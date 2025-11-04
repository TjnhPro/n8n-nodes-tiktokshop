import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createHmac } from 'node:crypto';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import {
	LogisticsService,
	LogisticsServiceError,
} from '../logistics-service';

const FIXED_TIME = 1_700_000_000_000;
const APP_KEY = 'testAppKey';
const APP_SECRET = 'testAppSecret';

interface MockContext {
	capturedConfigs: AxiosRequestConfig[];
	httpClient: AxiosInstance;
}

function createMockContext(): MockContext {
	const capturedConfigs: AxiosRequestConfig[] = [];

	const httpClient = {
		request: async <T>(config: AxiosRequestConfig): Promise<{ data: T }> => {
			capturedConfigs.push(config);
			return { data: {} as T };
		},
		getUri: () => '',
		defaults: {},
		interceptors: {
			request: { use: () => 0, eject: () => {} },
			response: { use: () => 0, eject: () => {} },
		},
	} as unknown as AxiosInstance;

	return { capturedConfigs, httpClient };
}

function computeExpectedSignature(path: string, params: Record<string, string>): string {
	const canonicalQuery = Object.keys(params)
		.filter((key) => {
			const lowered = key.toLowerCase();
			return lowered !== 'sign' && lowered !== 'access_token';
		})
		.sort()
		.map((key) => `${key}${params[key]}`)
		.join('');

	return createHmac('sha256', APP_SECRET)
		.update(`${APP_SECRET}${path}${canonicalQuery}${''}${APP_SECRET}`)
		.digest('hex');
}

describe('LogisticsService', () => {
	it('requires a shop cipher for listWarehouses', async () => {
		const { httpClient } = createMockContext();
		const service = new LogisticsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await assert.rejects(
			() =>
				service.listWarehouses({
					shopCipher: '   ',
				}),
			(error: unknown) => {
				assert.ok(error instanceof LogisticsServiceError);
				assert.match(
					error.message,
					/listWarehouses requires a non-empty shopCipher/i,
				);
				return true;
			},
		);
	});

	it('constructs signed request for listWarehouses', async () => {
		const { httpClient, capturedConfigs } = createMockContext();
		const service = new LogisticsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.listWarehouses({
			shopCipher: 'cipher-123',
			accessToken: 'token-abc',
		});

		assert.equal(capturedConfigs.length, 1);
		const config = capturedConfigs[0];
		assert.equal(config.url, '/logistics/202309/warehouses');
		assert.equal((config.method ?? 'GET').toUpperCase(), 'GET');
		assert.equal(config.headers?.['Content-Type'], 'application/json');
		assert.equal(config.headers?.['x-tts-access-token'], 'token-abc');
		assert.equal(config.params?.shop_cipher, 'cipher-123');
		assert.equal(config.params?.app_key, APP_KEY);
		assert.equal(config.params?.timestamp, `${Math.floor(FIXED_TIME / 1000)}`);

		const expectedSign = computeExpectedSignature(
			'/logistics/202309/warehouses',
			config.params as Record<string, string>,
		);
		assert.equal(config.params?.sign, expectedSign);
	});

	it('builds delivery option request with encoded warehouse id', async () => {
		const { httpClient, capturedConfigs } = createMockContext();
		const service = new LogisticsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.listWarehouseDeliveryOptions({
			warehouseId: 'WH/123',
			shopCipher: 'cipher-123',
		});

		assert.equal(capturedConfigs.length, 1);
		const config = capturedConfigs[0];
		assert.equal(
			config.url,
			'/logistics/202309/warehouses/WH%2F123/delivery_options',
		);
		assert.equal(config.params?.shop_cipher, 'cipher-123');
		const expectedSign = computeExpectedSignature(
			'/logistics/202309/warehouses/WH%2F123/delivery_options',
			config.params as Record<string, string>,
		);
		assert.equal(config.params?.sign, expectedSign);
	});

	it('builds shipping provider request with encoded delivery option id', async () => {
		const { httpClient, capturedConfigs } = createMockContext();
		const service = new LogisticsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.listShippingProviders({
			deliveryOptionId: 'DO 123',
			shopCipher: 'cipher-123',
		});

		assert.equal(capturedConfigs.length, 1);
		const config = capturedConfigs[0];
		assert.equal(
			config.url,
			'/logistics/202309/delivery_options/DO%20123/shipping_providers',
		);
		assert.equal(config.params?.shop_cipher, 'cipher-123');
		const expectedSign = computeExpectedSignature(
			'/logistics/202309/delivery_options/DO%20123/shipping_providers',
			config.params as Record<string, string>,
		);
		assert.equal(config.params?.sign, expectedSign);
	});
});
