import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { createHmac } from 'node:crypto';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

import {
	FulfillmentsService,
	FulfillmentsServiceError,
	SHIPPING_DOCUMENT_TYPES,
} from '../fulfillments-service';

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

function computeExpectedSignature(
	path: string,
	params: Record<string, string>,
	body?: unknown,
): string {
	const canonicalQuery = Object.keys(params)
		.filter((key) => {
			const lowered = key.toLowerCase();
			return lowered !== 'sign' && lowered !== 'access_token';
		})
		.sort()
		.map((key) => `${key}${params[key]}`)
		.join('');

	const canonicalBody =
		body === undefined ? '' : JSON.stringify(body);

	return createHmac('sha256', APP_SECRET)
		.update(`${APP_SECRET}${path}${canonicalQuery}${canonicalBody}${APP_SECRET}`)
		.digest('hex');
}

describe('FulfillmentsService', () => {
	it('requires shop cipher and body for createPackages', async () => {
		const { httpClient } = createMockContext();
		const service = new FulfillmentsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await assert.rejects(
			() =>
				service.createPackages({
					shopCipher: '   ',
					body: {},
				}),
			(error: unknown) => {
				assert.ok(error instanceof FulfillmentsServiceError);
				assert.match(
					error.message,
					/createPackages requires a non-empty shopCipher/i,
				);
				return true;
			},
		);

		await assert.rejects(
			() =>
				service.createPackages({
					shopCipher: 'cipher',
					body: {},
				}),
			(error: unknown) => {
				assert.ok(error instanceof FulfillmentsServiceError);
				assert.match(
					error.message,
					/createPackages requires a non-empty JSON body/i,
				);
				return true;
			},
		);
	});

	it('constructs signed request for createPackages', async () => {
		const { httpClient, capturedConfigs } = createMockContext();
		const service = new FulfillmentsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.createPackages({
			shopCipher: 'cipher-123',
			body: { foo: 'bar' },
			accessToken: 'token-abc',
		});

		assert.equal(capturedConfigs.length, 1);
		const config = capturedConfigs[0];
		assert.equal(config.url, '/fulfillment/202309/packages');
		assert.equal((config.method ?? 'POST').toUpperCase(), 'POST');
		assert.deepEqual(config.data, { foo: 'bar' });
		assert.equal(config.headers?.['Content-Type'], 'application/json');
		assert.equal(config.headers?.['x-tts-access-token'], 'token-abc');
		assert.equal(config.params?.shop_cipher, 'cipher-123');
		assert.equal(config.params?.app_key, APP_KEY);

		const expectedSign = computeExpectedSignature(
			'/fulfillment/202309/packages',
			config.params as Record<string, string>,
			{ foo: 'bar' },
		);
		assert.equal(config.params?.sign, expectedSign);
	});

	it('ships package with encoded package id and JSON body', async () => {
		const { httpClient, capturedConfigs } = createMockContext();
		const service = new FulfillmentsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.shipPackage({
			packageId: 'PKG 123',
			shopCipher: 'cipher-789',
			body: { tracking: '12345' },
		});

		assert.equal(capturedConfigs.length, 1);
		const config = capturedConfigs[0];
		assert.equal(
			config.url,
			'/fulfillment/202309/packages/PKG%20123/ship',
		);
		assert.equal((config.method ?? 'POST').toUpperCase(), 'POST');
		assert.deepEqual(config.data, { tracking: '12345' });
		assert.equal(config.params?.shop_cipher, 'cipher-789');

		const expectedSign = computeExpectedSignature(
			'/fulfillment/202309/packages/PKG%20123/ship',
			config.params as Record<string, string>,
			{ tracking: '12345' },
		);
		assert.equal(config.params?.sign, expectedSign);
	});

	it('fetches package shipping documents with optional documentType', async () => {
		const { httpClient, capturedConfigs } = createMockContext();
		const service = new FulfillmentsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await service.getPackageShippingDocument({
			packageId: 'pkg-1',
			shopCipher: 'cipher-321',
			documentType: SHIPPING_DOCUMENT_TYPES[0],
		});

		assert.equal(capturedConfigs.length, 1);
		const config = capturedConfigs[0];
		assert.equal(
			config.url,
			'/fulfillment/202309/packages/pkg-1/shipping_documents',
		);
		assert.equal((config.method ?? 'GET').toUpperCase(), 'GET');
		assert.equal(config.params?.shop_cipher, 'cipher-321');
		assert.equal(
			config.params?.document_type,
			SHIPPING_DOCUMENT_TYPES[0],
		);

		const expectedSign = computeExpectedSignature(
			'/fulfillment/202309/packages/pkg-1/shipping_documents',
			config.params as Record<string, string>,
		);
		assert.equal(config.params?.sign, expectedSign);
	});

	it('rejects unsupported document type', async () => {
		const { httpClient } = createMockContext();
		const service = new FulfillmentsService({
			appKey: APP_KEY,
			appSecret: APP_SECRET,
			httpClient,
			clock: () => FIXED_TIME,
		});

		await assert.rejects(
			() =>
				service.getPackageShippingDocument({
					packageId: 'pkg',
					shopCipher: 'cipher',
					documentType: 'INVALID' as never,
				}),
			(error: unknown) => {
				assert.ok(error instanceof FulfillmentsServiceError);
				assert.match(error.message, /unsupported documentType/i);
				return true;
			},
		);
	});
});
