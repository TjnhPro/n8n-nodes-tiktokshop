import {
	describe,
	expect,
	it,
	beforeEach,
	vi,
} from 'vitest';
import type { IExecuteFunctions } from 'n8n-workflow';
import { NodeOperationError } from 'n8n-workflow';

const accessTokenMock = vi.fn();
const refreshTokenMock = vi.fn();

vi.mock('../services/token-service', () => {
	class MockTokenServiceError extends Error {}

	const TokenService = vi.fn().mockImplementation(function () {
		return {
			accessToken: accessTokenMock,
			refreshToken: refreshTokenMock,
		};
	});

	return {
		TokenService,
		TokenServiceError: MockTokenServiceError,
	};
});

import { TikTokShop } from '../nodes/TikTokShop/TikTokShop.node';
import { TokenService, TokenServiceError } from '../services/token-service';

const createExecuteFunctions = (
	parameters: Record<string, unknown>,
	credentials: Record<string, unknown>,
	options?: { continueOnFail?: boolean },
) =>
	({
		getInputData: () => Array.from({ length: 1 }, () => ({ json: {} })),
		getNodeParameter: (name: string, _itemIndex: number, defaultValue?: unknown) => {
			if (parameters.hasOwnProperty(name)) {
				return parameters[name];
			}

			return defaultValue;
		},
		getCredentials: async () => credentials,
		getNode: () =>
			({
				name: 'TikTok Shop',
			}) as unknown,
		continueOnFail: () => options?.continueOnFail ?? false,
	} as unknown as IExecuteFunctions);

describe('TikTokShop node', () => {
	beforeEach(() => {
		accessTokenMock.mockReset();
		refreshTokenMock.mockReset();
		(TokenService as unknown as vi.Mock).mockClear();
	});

	it('calls TokenService.refreshToken and returns raw response for access operation', async () => {
		const rawResponse = {
			code: 0,
			message: 'success',
			data: {
				access_token: 'access-123',
				refresh_token: 'refresh-456',
			},
		};

		refreshTokenMock.mockResolvedValue(rawResponse);

		const node = new TikTokShop();
		const execution = createExecuteFunctions(
			{
				group: 'token',
				operation: 'accessToken',
				appKey: 'app-key',
				appSecret: 'app-secret',
				refreshToken: 'refresh-456',
				proxy: '',
			},
			{
			},
		);

		const result = await node.execute.call(execution);

		expect(refreshTokenMock).toHaveBeenCalledWith({
			appKey: 'app-key',
			appSecret: 'app-secret',
			refreshToken: 'refresh-456',
			proxy: undefined,
		});
		expect(result).toEqual([
			[
				{
					json: rawResponse,
					pairedItem: { item: 0 },
				},
			],
		]);
	});

	it('calls TokenService.accessToken and returns raw response for refresh operation', async () => {
		const rawResponse = {
			code: 0,
			message: 'success',
			data: {
				access_token: 'new-access',
				refresh_token: 'new-refresh',
			},
		};

		accessTokenMock.mockResolvedValue(rawResponse);

		const node = new TikTokShop();
		const execution = createExecuteFunctions(
			{
				group: 'token',
				operation: 'refreshToken',
				appKey: 'app-key',
				appSecret: 'app-secret',
				authCode: 'auth-code',
				proxy: 'socks5://proxy.internal:1080',
			},
			{
			},
		);

		const result = await node.execute.call(execution);

		expect(accessTokenMock).toHaveBeenCalledWith({
			appKey: 'app-key',
			appSecret: 'app-secret',
			authCode: 'auth-code',
			proxy: 'socks5://proxy.internal:1080',
		});
		expect(result).toEqual([
			[
				{
					json: rawResponse,
					pairedItem: { item: 0 },
				},
			],
		]);
	});

	it('throws NodeOperationError when refresh token is missing', async () => {
		const node = new TikTokShop();
		const execution = createExecuteFunctions(
			{
				group: 'token',
				operation: 'refreshToken',
				refreshToken: '',
				proxy: '',
			},
			{
				appKey: 'app-key',
				appSecret: 'app-secret',
				refreshToken: '',
			},
		);

		await expect(node.execute.call(execution)).rejects.toBeInstanceOf(
			NodeOperationError,
		);
	});

	it('continues on failure when TokenService throws and continueOnFail is set', async () => {
		refreshTokenMock.mockRejectedValue(
			new TokenServiceError('exchange failed'),
		);

		const node = new TikTokShop();
		const execution = createExecuteFunctions(
			{
				group: 'token',
				operation: 'accessToken',
				appKey: 'app-key',
				appSecret: 'app-secret',
				refreshToken: 'refresh-456',
				proxy: '',
			},
			{
			},
			{ continueOnFail: true },
		);

		const result = await node.execute.call(execution);

		expect(result).toEqual([
			[
				{
					json: {
						error: 'exchange failed',
					},
					pairedItem: { item: 0 },
				},
			],
		]);
	});
});
