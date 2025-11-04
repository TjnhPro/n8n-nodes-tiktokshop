import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	type Method,
	isAxiosError,
} from 'axios';
import { createHmac } from 'node:crypto';
import type { Agent as HttpAgent } from 'node:http';
import type { Agent as HttpsAgent } from 'node:https';

import { createProxyAgent } from './proxy-agent';

export const OPEN_API_BASE_URL = 'https://open-api.tiktokglobalshop.com';

export interface BaseServiceOptions {
	appKey: string;
	appSecret: string;
	accessToken?: string;
	proxy?: string;
	httpClient?: AxiosInstance;
	timeoutMs?: number;
	clock?: () => number;
}

export interface BaseServiceRequestConfig {
	path: string;
	method?: Method;
	query?: Record<string, unknown>;
	body?: unknown;
	headers?: Record<string, string>;
	proxy?: string;
	accessToken?: string;
	config?: Omit<
		AxiosRequestConfig,
		'url' | 'baseURL' | 'params' | 'headers' | 'data' | 'method'
	>;
}

export interface BaseServiceErrorDetails {
	status?: number;
	data?: unknown;
}

export class BaseServiceError extends Error {
	public readonly status?: number;
	public readonly data?: unknown;

	constructor(message: string, details: BaseServiceErrorDetails = {}) {
		super(message);
		this.name = 'BaseServiceError';
		this.status = details.status;
		this.data = details.data;
	}
}

export class BaseService {
	private readonly httpClient: AxiosInstance;
	private readonly appKey: string;
	private readonly appSecret: string;
	private readonly defaultAccessToken?: string;
	private readonly defaultProxy?: string;
	private readonly clock: () => number;

	constructor(options: BaseServiceOptions) {
		const {
			appKey,
			appSecret,
			accessToken,
			proxy,
			httpClient,
			timeoutMs = 10000,
			clock = () => Date.now(),
		} = options;

		this.appKey = appKey;
		this.appSecret = appSecret;
		this.defaultAccessToken = accessToken;
		this.defaultProxy = proxy;
		this.clock = clock;

		this.httpClient =
			httpClient ??
			axios.create({
				baseURL: OPEN_API_BASE_URL,
				timeout: timeoutMs,
				headers: { 'Content-Type': 'application/json' },
			});
	}

	public async requestLegacy<T = unknown>(
		input: BaseServiceRequestConfig & {
			shopId: string;
			version?: string;
			accessToken?: string;
		},
	): Promise<T> {
		const { shopId, version, accessToken, ...rest } = input;

		if (!shopId || !shopId.toString().trim()) {
			throw new BaseServiceError(
				'Legacy requests require a non-empty shop_id value.',
			);
		}

		const resolvedAccessToken =
			accessToken ?? this.defaultAccessToken;

		const mergedQuery: Record<string, unknown> = {
			...(rest.query ?? {}),
			shop_id: shopId,
			version: version ?? '202212',
		};

		if (resolvedAccessToken) {
			mergedQuery.access_token = resolvedAccessToken;
		}

		return this.request<T>({
			...rest,
			query: mergedQuery,
			accessToken: resolvedAccessToken,
		});
	}

	public async request<T = unknown>(
		request: BaseServiceRequestConfig,
	): Promise<T> {
		const canonicalPath = this.normalizePath(request.path);
		const timestampSeconds = Math.floor(this.clock() / 1000);

		const { data, canonicalBody } = this.prepareBody(request.body);
		const includeBodyInSignature = this.shouldIncludeBodyInSignature(
			request.headers,
			request.body,
			canonicalBody,
		);
		const { requestParams, signatureParams } =
			this.normalizeQueryParams(request.query);

		const paramsForSignature: Record<string, string> = {
			...signatureParams,
			app_key: this.appKey,
			timestamp: timestampSeconds.toString(),
		};

		const canonicalQuery = this.buildCanonicalQuery(
			paramsForSignature,
		);

		const sign = this.computeSignature(
			canonicalPath,
			canonicalQuery,
			includeBodyInSignature ? canonicalBody : '',
		);

		const params: Record<string, string> = {
			...requestParams,
			app_key: this.appKey,
			timestamp: timestampSeconds.toString(),
			sign,
		};

		const headers = this.buildHeaders(
			request.headers,
			request.accessToken,
		);

		const axiosConfig: AxiosRequestConfig = {
			...(request.config ?? {}),
			url: canonicalPath,
			method: request.method ?? 'GET',
			params,
			data,
			...this.buildProxyConfig(request.proxy),
		};

		if (headers) {
			axiosConfig.headers = headers;
		}

		try {
			const response = await this.httpClient.request<T>(
				axiosConfig,
			);
			return response.data;
		} catch (error) {
			throw this.normalizeError(error);
		}
	}

	private buildHeaders(
		customHeaders?: Record<string, string>,
		overrideAccessToken?: string,
	): Record<string, string> | undefined {
		const headers: Record<string, string> = {
			...(customHeaders ?? {}),
		};

		const accessToken =
			overrideAccessToken ?? this.defaultAccessToken;

		if (accessToken) {
			headers['x-tts-access-token'] = accessToken;
		}

		return Object.keys(headers).length > 0 ? headers : undefined;
	}

	private normalizePath(path: string): string {
		return path.startsWith('/') ? path : `/${path}`;
	}

	private prepareBody(body: unknown): {
		data: unknown;
		canonicalBody: string;
	} {

		if (body === undefined || body === null) {
			return { data: undefined, canonicalBody: '' };
		}

		if (typeof body === 'string') {
			return { data: body, canonicalBody: body };
		}

		if (Buffer.isBuffer(body)) {
			const bodyString = body.toString();
			return { data: body, canonicalBody: bodyString };
		}

		const json = JSON.stringify(body);
		return { data: body, canonicalBody: json };
	}

	private normalizeQueryParams(
		query: Record<string, unknown> | undefined,
	): {
		requestParams: Record<string, string>;
		signatureParams: Record<string, string>;
	} {
		const requestParams: Record<string, string> = {};
		const signatureParams: Record<string, string> = {};

		if (!query) {
			return { requestParams, signatureParams };
		}

		for (const [key, value] of Object.entries(query)) {
			if (value === undefined || value === null) {
				continue;
			}

			if (key.toLowerCase() === 'sign') {
				continue;
			}

			const stringValue =
				typeof value === 'string' ? value : String(value);

			requestParams[key] = stringValue;

			if (key.toLowerCase() !== 'access_token') {
				signatureParams[key] = stringValue;
			}
		}

		return { requestParams, signatureParams };
	}

	private buildCanonicalQuery(
		params: Record<string, string>,
	): string {
		return Object.keys(params)
			.filter((key) => {
				const lowered = key.toLowerCase();
				return lowered !== 'sign' && lowered !== 'access_token';
			})
			.sort()
			.map((key) => `${key}${params[key]}`)
			.join('');
	}

	private computeSignature(
		path: string,
		canonicalQuery: string,
		canonicalBody: string,
	): string {
		const message =
			this.appSecret + path + canonicalQuery + canonicalBody + this.appSecret;

		return createHmac('sha256', this.appSecret)
			.update(message)
			.digest('hex');
	}

	private shouldIncludeBodyInSignature(
		customHeaders: Record<string, string> | undefined,
		body: unknown,
		canonicalBody: string,
	): boolean {
		if (!this.hasSerializableBody(body, canonicalBody)) {
			return false;
		}

		const contentType = this.resolveContentType(customHeaders);

		if (!contentType) {
			return true;
		}

		return !contentType
			.toLowerCase()
			.startsWith('multipart/form-data');
	}

	private hasSerializableBody(
		body: unknown,
		canonicalBody: string,
	): boolean {
		if (body === undefined || body === null) {
			return false;
		}

		if (Buffer.isBuffer(body)) {
			return body.length > 0;
		}

		if (typeof body === 'string') {
			return body.length > 0;
		}

		if (typeof body === 'number' || typeof body === 'boolean') {
			return true;
		}

		if (Array.isArray(body)) {
			return body.length > 0;
		}

		if (typeof body === 'object') {
			return Object.keys(body as Record<string, unknown>).length > 0;
		}

		return canonicalBody.length > 0;
	}

	private resolveContentType(
		headers: Record<string, string> | undefined,
	): string | undefined {
		if (!headers) {
			return 'application/json';
		}

		for (const [key, value] of Object.entries(headers)) {
			if (key.toLowerCase() === 'content-type') {
				return value;
			}
		}

		return 'application/json';
	}

	private buildProxyConfig(proxyOverride?: string): {
		httpAgent?: HttpAgent;
		httpsAgent?: HttpsAgent;
	} {
		const agent = createProxyAgent(
			proxyOverride ?? this.defaultProxy,
		);

		if (!agent) {
			return {};
		}

		return {
			httpAgent: agent as HttpAgent,
			httpsAgent: agent as HttpsAgent,
		};
	}

	private normalizeError(error: unknown): BaseServiceError {
		if (isAxiosError(error)) {
			const status = error.response?.status;
			const data = error.response?.data;
			const message =
				typeof data === 'object' && data !== null && 'message' in data
					? String((data as { message: unknown }).message)
					: error.message;

			return new BaseServiceError(
				`TikTok Shop request failed${status ? ` with status ${status}` : ''}: ${message}`,
				{ status, data },
			);
		}

		if (error instanceof BaseServiceError) {
			return error;
		}

		const fallbackMessage =
			error instanceof Error
				? error.message
				: 'TikTok Shop request failed with an unknown error.';

		return new BaseServiceError(fallbackMessage);
	}
}
