import axios, {
	type AxiosInstance,
	type AxiosRequestConfig,
	isAxiosError,
} from 'axios';
import type { Agent as HttpAgent } from 'node:http';
import type { Agent as HttpsAgent } from 'node:https';

import { createProxyAgent } from './proxy-agent';


export const AUTH_BASE_URL = 'https://auth.tiktok-shops.com';
const ACCESS_TOKEN_PATH = '/api/v2/token/get';
const REFRESH_TOKEN_PATH = '/api/v2/token/refresh';
const AUTHORIZED_CODE_GRANT = 'authorized_code';
const REFRESH_TOKEN_GRANT = 'refresh_token';

export interface TokenServiceOptions {
	httpClient?: AxiosInstance;
	timeoutMs?: number;
}

export interface AccessTokenRequestInput {
	appKey: string;
	appSecret: string;
	authCode: string;
	proxy?: string;
}

export interface RefreshTokenRequestInput {
	appKey: string;
	appSecret: string;
	refreshToken: string;
	proxy?: string;
}

export interface TokenServiceErrorDetails {
	status?: number;
	data?: unknown;
}

export class TokenServiceError extends Error {
	public readonly status?: number;
	public readonly data?: unknown;

	constructor(message: string, details: TokenServiceErrorDetails = {}) {
		super(message);
		this.name = 'TokenServiceError';
		this.status = details.status;
		this.data = details.data;
	}
}

export class TokenService {
	private readonly httpClient: AxiosInstance;

	constructor(options: TokenServiceOptions = {}) {
		const { httpClient, timeoutMs = 10000 } = options;
		this.httpClient =
			httpClient ??
			axios.create({
				baseURL: AUTH_BASE_URL,
				timeout: timeoutMs,
				headers: { 'Content-Type': 'application/json' },
			});
	}

	public async accessToken(
		input: AccessTokenRequestInput,
	): Promise<Record<string, unknown>> {
		const payload = {
			app_key: input.appKey,
			app_secret: input.appSecret,
			auth_code: input.authCode,
			grant_type: AUTHORIZED_CODE_GRANT,
		};

		return this.dispatchTokenRequest(
			ACCESS_TOKEN_PATH,
			payload,
			input.proxy,
		);
	}

	public async refreshToken(
		input: RefreshTokenRequestInput,
	): Promise<Record<string, unknown>> {
		const payload = {
			app_key: input.appKey,
			app_secret: input.appSecret,
			refresh_token: input.refreshToken,
			grant_type: REFRESH_TOKEN_GRANT,
		};

		return this.dispatchTokenRequest(
			REFRESH_TOKEN_PATH,
			payload,
			input.proxy,
		);
	}

	public async proxyValid(
		input: RefreshTokenRequestInput,
	): Promise<Record<string, unknown>> {
		try {
			const requestConfig: AxiosRequestConfig & {
				params?: Record<string, string>;
			} = {
				...this.buildRequestConfig(input.proxy)			
			};

			const response = await this.httpClient.get(
				"https://api.ipgeolocation.io/timezone?apiKey=2dc6bc44a1594d17b32f38f5de914ef6",
				requestConfig,
			);

			return response.data as Record<string, unknown>;
		} catch (error) {
			throw this.normalizeError(error);
		}
	}

	private async dispatchTokenRequest(
		path: string,
		payload: Record<string, string>,
		proxy?: string,
	): Promise<Record<string, unknown>> {
		try {
			const requestConfig: AxiosRequestConfig & {
				params: Record<string, string>;
			} = {
				...this.buildRequestConfig(proxy),
				params: payload,
			};

			const response = await this.httpClient.get(
				path,
				requestConfig,
			);

			return response.data as Record<string, unknown>;
		} catch (error) {
			throw this.normalizeError(error);
		}
	}

	private buildRequestConfig(proxy?: string): AxiosRequestConfig {
		const agent = createProxyAgent(proxy);
		const headers = {
			'Content-Type': 'application/json',
		};

		if (!agent) {
			return { headers };
		}

		return {
			headers,
			httpAgent: agent as HttpAgent,
			httpsAgent: agent as HttpsAgent,
		};
	}

	private normalizeError(error: unknown): TokenServiceError {
		if (isAxiosError(error)) {
			const status = error.response?.status;
			const data = error.response?.data;
			const errorMessage =
				typeof data === 'object' && data !== null && 'message' in data
					? String((data as { message: unknown }).message)
					: error.message;

			return new TokenServiceError(
				`Token request failed${status ? ` with status ${status}` : ''}: ${errorMessage}`,
				{ status, data },
			);
		}

		if (error instanceof TokenServiceError) {
			return error;
		}

		const message =
			error instanceof Error
				? error.message
				: 'Token request failed with an unknown error.';

		return new TokenServiceError(message);
	}
}
