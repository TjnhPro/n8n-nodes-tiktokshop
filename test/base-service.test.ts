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
import { createHmac } from 'node:crypto';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { SocksProxyAgent } from 'socks-proxy-agent';
import type { AxiosInstance } from 'axios';

import {
	BaseService,
	BaseServiceError,
	OPEN_API_BASE_URL,
} from '../services/base-service';

const FIXED_TIME = 1_700_000_000_000;
const FIXED_TIMESTAMP = Math.floor(FIXED_TIME / 1000).toString();

describe('BaseService', () => {
	beforeAll(() => {
		nock.disableNetConnect();
	});

	afterEach(() => {
		nock.cleanAll();
	});

	afterAll(() => {
		nock.enableNetConnect();
	});

	it('signs GET requests and appends canonical parameters', async () => {
		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			accessToken: 'token-abc',
			clock: () => FIXED_TIME,
		});

		const canonicalQuery =
			'app_keyapp-keypage_size10sortasctimestamp' + FIXED_TIMESTAMP;
		const expectedSign = createHmac('sha256', 'app-secret')
			.update(
				`app-secret/orders/search${canonicalQuery}app-secret`,
			)
			.digest('hex');

		const scope = nock(OPEN_API_BASE_URL)
			.get('/orders/search')
			.query((actual) => {
				expect(actual).toMatchObject({
					app_key: 'app-key',
					timestamp: FIXED_TIMESTAMP,
					page_size: '10',
					sort: 'asc',
				});
				expect(actual.sign).toBe(expectedSign);
				return true;
			})
			.matchHeader('x-tts-access-token', 'token-abc')
			.reply(200, { code: 0, data: [] });

		const response = await service.request<{
			code: number;
			data: unknown[];
		}>({
			path: '/orders/search',
			method: 'GET',
			query: { page_size: 10, sort: 'asc' },
		});

		expect(response).toEqual({ code: 0, data: [] });
		scope.done();
	});

	it('includes body in canonical signature for POST requests', async () => {
		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			clock: () => FIXED_TIME,
		});

		const body = { order_id: '123', include_details: true };
		const canonicalBody = JSON.stringify(body);
		const canonicalQuery = `app_keyapp-keytimestamp${FIXED_TIMESTAMP}`;
		const expectedSign = createHmac('sha256', 'app-secret')
			.update(
				`app-secret/orders/detail${canonicalQuery}${canonicalBody}app-secret`,
			)
			.digest('hex');

		const scope = nock(OPEN_API_BASE_URL)
			.post('/orders/detail', (payload) => {
				expect(payload).toEqual(body);
				return true;
			})
			.query((actual) => {
				expect(actual.app_key).toBe('app-key');
				expect(actual.timestamp).toBe(FIXED_TIMESTAMP);
				expect(actual.sign).toBe(expectedSign);
				return true;
			})
			.reply(200, { code: 0, data: { order_id: '123' } });

		const response = await service.request<{
			code: number;
			data: { order_id: string };
		}>({
			path: '/orders/detail',
			method: 'POST',
			body,
		});

		expect(response.data.order_id).toBe('123');
		scope.done();
	});

	it('omits access token header when none is provided', async () => {
		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			clock: () => FIXED_TIME,
		});

		const scope = nock(OPEN_API_BASE_URL)
			.get('/products/list')
			.query(true)
			.reply(function reply() {
				expect(
					this.req.headers['x-tts-access-token'],
				).toBeUndefined();
				return [200, { code: 0, data: [] }];
			});

		await service.request({ path: '/products/list' });
		scope.done();
	});

	it('excludes access_token from signature while sending query parameter', async () => {
		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			clock: () => FIXED_TIME,
		});

		const canonicalQuery =
			'app_keyapp-keystatuspendingtimestamp' + FIXED_TIMESTAMP;
		const expectedSign = createHmac('sha256', 'app-secret')
			.update(
				`app-secret/orders/search${canonicalQuery}app-secret`,
			)
			.digest('hex');

		const scope = nock(OPEN_API_BASE_URL)
			.get('/orders/search')
			.query((actual) => {
				expect(actual.access_token).toBe('token-abc');
				expect(actual.status).toBe('pending');
				expect(actual.sign).toBe(expectedSign);
				return true;
			})
			.reply(200, { code: 0, data: [] });

		await service.request({
			path: '/orders/search',
			method: 'GET',
			query: { access_token: 'token-abc', status: 'pending' },
		});

		scope.done();
	});

	it('applies HTTP proxy agent per request', async () => {
		const requestMock = vi.fn().mockResolvedValue({
			data: { code: 0 },
		});
		const httpClient = {
			request: requestMock,
		} as unknown as AxiosInstance;

		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.request({
			path: '/orders/search',
			proxy: 'http://proxy.internal:8080',
		});

		expect(requestMock).toHaveBeenCalledTimes(1);
		const [config] = requestMock.mock.calls[0];
		expect(config?.httpsAgent).toBeInstanceOf(HttpsProxyAgent);
		expect(config?.httpAgent).toBeInstanceOf(HttpsProxyAgent);
	});

	it('applies SOCKS5 proxy agent when configured on service', async () => {
		const requestMock = vi.fn().mockResolvedValue({
			data: { code: 0 },
		});
		const httpClient = {
			request: requestMock,
		} as unknown as AxiosInstance;

		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			proxy: 'socks5://proxy.internal:1080',
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.request({
			path: '/products/list',
		});

		expect(requestMock).toHaveBeenCalledTimes(1);
		const [config] = requestMock.mock.calls[0];
		expect(config?.httpsAgent).toBeInstanceOf(SocksProxyAgent);
		expect(config?.httpAgent).toBeInstanceOf(SocksProxyAgent);
	});

	it('omits body from signature when content type is multipart/form-data', async () => {
		const requestMock = vi.fn().mockResolvedValue({
			data: { code: 0 },
		});
		const httpClient = {
			request: requestMock,
		} as unknown as AxiosInstance;

		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.request({
			path: '/products/upload',
			method: 'POST',
			body: { file: 'encoded' },
			headers: {
				'Content-Type': 'multipart/form-data; boundary=abc123',
			},
		});

		const [config] = requestMock.mock.calls[0];
		const params = config?.params as Record<string, string>;
		const canonicalQuery = Object.keys(params)
			.filter((key) => key !== 'sign')
			.sort()
			.map((key) => `${key}${params[key]}`)
			.join('');

		const messageWithoutBody =
			'app-secret' +
			'/products/upload' +
			canonicalQuery +
			'app-secret';

		const messageWithBody =
			'app-secret' +
			'/products/upload' +
			canonicalQuery +
			JSON.stringify({ file: 'encoded' }) +
			'app-secret';

		const signWithoutBody = createHmac('sha256', 'app-secret')
			.update(messageWithoutBody)
			.digest('hex');

		const signWithBody = createHmac('sha256', 'app-secret')
			.update(messageWithBody)
			.digest('hex');

		expect(params.sign).toBe(signWithoutBody);
		expect(params.sign).not.toBe(signWithBody);
		expect(config?.data).toEqual({ file: 'encoded' });
		expect(config?.headers?.['Content-Type']).toContain(
			'multipart/form-data',
		);
	});

	it('wraps Axios errors in BaseServiceError', async () => {
		const requestMock = vi
			.fn()
			.mockRejectedValue(
				new Error('network timeout occurred'),
			);

		const httpClient = {
			request: requestMock,
		} as unknown as AxiosInstance;

		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			httpClient,
			clock: () => FIXED_TIME,
		});

		await expect(
			service.request({ path: '/orders/search' }),
		).rejects.toThrow(BaseServiceError);
	});

	it('requestLegacy appends shop_id, version, and access_token while delegating to request', async () => {
		const requestMock = vi.fn().mockResolvedValue({
			data: { code: 0 },
		});
		const httpClient = {
			request: requestMock,
		} as unknown as AxiosInstance;

		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			accessToken: 'token-header',
			httpClient,
			clock: () => FIXED_TIME,
		});

		const result = await service.requestLegacy<{ code: number }>({
			path: '/legacy/api',
			method: 'GET',
			query: { existing: 'value' },
			shopId: 'shop-123',
		});

		expect(result).toEqual({ code: 0 });
		expect(requestMock).toHaveBeenCalledTimes(1);
		const [config] = requestMock.mock.calls[0];
		const params = config?.params as Record<string, string>;
		expect(params.shop_id).toBe('shop-123');
		expect(params.version).toBe('202212');
		expect(params.access_token).toBe('token-header');
		expect(params.existing).toBe('value');
		expect(config?.headers?.['x-tts-access-token']).toBe(
			'token-header',
		);
	});

	it('requestLegacy throws when shop_id is missing', async () => {
		const service = new BaseService({
			appKey: 'app-key',
			appSecret: 'app-secret',
			clock: () => FIXED_TIME,
		});

		await expect(
			service.requestLegacy({
				path: '/legacy/api',
				shopId: '',
			}),
		).rejects.toThrow(BaseServiceError);
	});
});
