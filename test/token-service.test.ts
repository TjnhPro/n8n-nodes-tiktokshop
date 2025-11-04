import {
	afterAll,
	afterEach,
	beforeAll,
	describe,
	expect,
	it,
	vi,
} from 'vitest';
import nock from 'nock';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import type { AxiosInstance } from 'axios';

import {
	AUTH_BASE_URL,
	TokenService,
	TokenServiceError,
} from '../services/token-service';
import {
	ProxyConfigurationError,
	createProxyAgent,
} from '../services/proxy-agent';

describe('TokenService', () => {
	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterEach(() => {
		nock.cleanAll();
	});

	afterAll(() => {
		nock.enableNetConnect();
	});

	it('exchanges authorized code for tokens using GET parameters', async () => {
		const responsePayload = {
			code: 0,
			message: 'success',
			request_id: 'req-1',
			data: {
				access_token: 'access-123',
				refresh_token: 'refresh-456',
				access_token_expire_in: 7200,
				refresh_token_expire_in: 3600,
				open_id: 'open-1',
				seller_name: 'Demo Shop',
				seller_base_region: 'VN',
				user_type: 1,
			},
		};

		const scope = nock(AUTH_BASE_URL)
			.get('/api/v2/token/get')
			.query({
				app_key: 'app-key',
				app_secret: 'app-secret',
				auth_code: 'auth-code',
				grant_type: 'authorized_code',
			})
			.reply(200, responsePayload);

		const service = new TokenService();
		const result = await service.accessToken({
			appKey: 'app-key',
			appSecret: 'app-secret',
			authCode: 'auth-code',
		});

		expect(result).toEqual(responsePayload);

		scope.done();
	});

	it('refreshes tokens using the refreshToken endpoint with GET parameters', async () => {
		const responsePayload = {
			code: 0,
			message: 'success',
			request_id: 'req-2',
			data: {
				access_token: 'new-access',
				refresh_token: 'new-refresh',
				access_token_expire_in: 7200,
				refresh_token_expire_in: 3600,
				open_id: 'open-2',
				seller_name: 'Demo Shop',
				seller_base_region: 'VN',
				user_type: 1,
			},
		};

		const scope = nock(AUTH_BASE_URL)
			.get('/api/v2/token/refresh')
			.query({
				app_key: 'app-key',
				app_secret: 'app-secret',
				refresh_token: 'refresh-456',
				grant_type: 'refresh_token',
			})
			.reply(200, responsePayload);

		const service = new TokenService();
		const result = await service.refreshToken({
			appKey: 'app-key',
			appSecret: 'app-secret',
			refreshToken: 'refresh-456',
		});

		expect(result).toEqual(responsePayload);

		scope.done();
	});

	it('wraps TikTok errors in TokenServiceError', async () => {
		const scope = nock(AUTH_BASE_URL)
			.get('/api/v2/token/get')
			.query(true)
			.reply(400, { code: 1001, message: 'invalid auth code' });

		const service = new TokenService();

		await expect(
			service.accessToken({
				appKey: 'app-key',
				appSecret: 'app-secret',
				authCode: 'bad-auth',
			}),
		).rejects.toThrow(TokenServiceError);

		scope.done();
	});

	it('applies HTTP proxy agent and query params when provided', async () => {
		const getMock = vi.fn().mockResolvedValue({
			data: {
				code: 0,
				message: 'success',
				request_id: 'req-3',
				data: {
					access_token: 'token',
					refresh_token: 'refresh',
					access_token_expire_in: 7200,
					refresh_token_expire_in: 3600,
					open_id: 'open-3',
					seller_name: 'Demo Shop',
					seller_base_region: 'VN',
					user_type: 1,
				},
			},
			status: 200,
		});

		const fakeHttpClient = { get: getMock } as unknown as AxiosInstance;
		const service = new TokenService({ httpClient: fakeHttpClient });

		await service.accessToken({
			appKey: 'app-key',
			appSecret: 'app-secret',
			authCode: 'auth-code',
			proxy: 'http://proxy.internal:8080',
		});

		const [, config] = getMock.mock.calls[0];
		expect(config?.httpsAgent).toBeInstanceOf(HttpsProxyAgent);
		expect(config?.httpAgent).toBeInstanceOf(HttpsProxyAgent);
		expect(config?.params).toEqual({
			app_key: 'app-key',
			app_secret: 'app-secret',
			auth_code: 'auth-code',
			grant_type: 'authorized_code',
		});
	});

	it('applies SOCKS5 proxy agent and query params when provided', async () => {
	const getMock = vi.fn().mockResolvedValue({
		data: {
			code: 0,
			message: 'success',
			request_id: 'req-4',
			data: {
				access_token: 'token',
				refresh_token: 'refresh',
				access_token_expire_in: 7200,
				refresh_token_expire_in: 3600,
				open_id: 'open-4',
				seller_name: 'Demo Shop',
				seller_base_region: 'VN',
				user_type: 1,
			},
		},
		status: 200,
	});

		const fakeHttpClient = { get: getMock } as unknown as AxiosInstance;
		const service = new TokenService({ httpClient: fakeHttpClient });

		await service.refreshToken({
			appKey: 'app-key',
			appSecret: 'app-secret',
			refreshToken: 'refresh',
			proxy: 'socks5://proxy.internal:1080',
		});

		const [, config] = getMock.mock.calls[0];
		expect(config?.httpsAgent).toBeInstanceOf(SocksProxyAgent);
		expect(config?.httpAgent).toBeInstanceOf(SocksProxyAgent);
		expect(config?.params).toEqual({
			app_key: 'app-key',
			app_secret: 'app-secret',
			refresh_token: 'refresh',
			grant_type: 'refresh_token',
		});
	});
});

describe('createProxyAgent', () => {
	it('returns undefined for empty values', () => {
		expect(createProxyAgent(undefined)).toBeUndefined();
		expect(createProxyAgent('')).toBeUndefined();
		expect(createProxyAgent('   ')).toBeUndefined();
	});

	it('creates an HTTPS proxy agent for http-prefixed values', () => {
		expect(createProxyAgent('http://proxy:3128')).toBeInstanceOf(
			HttpsProxyAgent,
		);
		expect(createProxyAgent('https://proxy:3128')).toBeInstanceOf(
			HttpsProxyAgent,
		);
	});

	it('creates a SOCKS5 proxy agent when socks5-prefixed', () => {
		expect(createProxyAgent('socks5://proxy:1080')).toBeInstanceOf(
			SocksProxyAgent,
		);
	});

	it('throws for unsupported protocols', () => {
		expect(() => createProxyAgent('ftp://proxy')).toThrow(
			ProxyConfigurationError,
		);
	});
});
