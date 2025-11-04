import {
	NodeConnectionTypes,
	NodeOperationError,
	type IDataObject,
	type IExecuteFunctions,
	type INodeExecutionData,
	type INodeType,
	type INodeTypeDescription,
} from 'n8n-workflow';

import {
	TokenService,
	TokenServiceError,
} from '../../services/token-service';
import {
	SellerService,
	SellerServiceError,
} from '../../services/seller-service';

export class TikTokShop implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'TikTok Shop',
		name: 'tiktokShop',
		icon: {
			light: 'file:../../icons/tiktokshop.svg',
			dark: 'file:../../icons/tiktokshop.dark.svg',
		},
		version: 1,
		group: ['input'],
		description: 'Handle TikTok Shop token exchanges and seller data',
		defaults: {
			name: 'TikTok Shop',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		properties: [
			{
				displayName: 'Group',
				name: 'group',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Token',
						value: 'token',
					},
					{
						name: 'Seller',
						value: 'seller',
					},
				],
				default: 'token',
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Access Token',
						value: 'accessToken',
						description: 'Exchange an authorized code for access and refresh tokens',
					},
					{
						name: 'Refresh Token',
						value: 'refreshToken',
						description: 'Refresh the access token using an existing refresh token',
					},
				],
				default: 'accessToken',
				displayOptions: {
					show: {
						group: ['token'],
					},
				},
			},
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Active Shops',
						value: 'getActiveShops',
						description: 'List active shops for the current seller',
					},
					{
						name: 'Get Seller Permissions',
						value: 'getSellerPermissions',
						description: 'Retrieve the seller permissions granted to the current account',
					},
				],
				default: 'getActiveShops',
				displayOptions: {
					show: {
						group: ['seller'],
					},
				},
			},
			{
				displayName: 'App Key',
				name: 'appKey',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						group: ['token', 'seller'],
					},
				},
			},
			{
				displayName: 'App Secret',
				name: 'appSecret',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						group: ['token', 'seller'],
					},
				},
			},
			{
				displayName: 'Proxy',
				name: 'proxy',
				type: 'string',
				default: '',
				placeholder: 'e.g. http://proxy.internal:8080',
				description:
					'Override proxy for this execution. Leave empty to rely on credential setting or direct connection.',
				displayOptions: {
					show: {
						group: ['token', 'seller'],
					},
				},
			},
			{
				displayName: 'Access Token',
				name: 'accessToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				description: 'Access token applied to seller API requests.',
				displayOptions: {
					show: {
						group: ['seller'],
					},
				},
			},
			{
				displayName: 'Refresh Token',
				name: 'refreshToken',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				displayOptions: {
					show: {
						group: ['token'],
						operation: ['accessToken'],
					},
				},
			},
			{
				displayName: 'Authorization Code',
				name: 'authCode',
				type: 'string',
				typeOptions: {
					password: true,
				},
				default: '',
				required: true,
				description: 'Authorized code returned from the TikTok Shop OAuth flow.',
				displayOptions: {
					show: {
						group: ['token'],
						operation: ['refreshToken'],
					},
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];

		const tokenService = new TokenService();

		for (let itemIndex = 0; itemIndex < items.length; itemIndex++) {
			const group = this.getNodeParameter('group', itemIndex) as
				| 'token'
				| 'seller';
			const operation = this.getNodeParameter(
				'operation',
				itemIndex,
			) as
				| 'accessToken'
				| 'refreshToken'
				| 'getActiveShops'
				| 'getSellerPermissions';
			const appKey = this.getNodeParameter('appKey', itemIndex) as string;
			const appSecret = this.getNodeParameter('appSecret', itemIndex) as string;

			const proxyOverride = this.getNodeParameter(
				'proxy',
				itemIndex,
				'',
			) as string;
			const proxy = proxyOverride?.trim() || undefined;

			try {
				const trimmedAppKey = appKey.trim();
				const trimmedAppSecret = appSecret.trim();

				if (!trimmedAppKey) {
					throw new NodeOperationError(
						this.getNode(),
						'App key is required for the selected operation.',
						{ itemIndex },
					);
				}

				if (!trimmedAppSecret) {
					throw new NodeOperationError(
						this.getNode(),
						'App secret is required for the selected operation.',
						{ itemIndex },
					);
				}

				let result: Record<string, unknown>;

				if (group === 'token') {
					if (operation === 'accessToken') {
						const refreshTokenValue = this.getNodeParameter(
							'refreshToken',
							itemIndex,
						) as string;
						const trimmedRefreshToken = refreshTokenValue?.trim();

						if (!trimmedRefreshToken) {
							throw new NodeOperationError(
								this.getNode(),
								'Refresh token is required for the access token operation.',
								{ itemIndex },
							);
						}

						result = await tokenService.refreshToken({
							appKey: trimmedAppKey,
							appSecret: trimmedAppSecret,
							refreshToken: trimmedRefreshToken,
							proxy,
						});
					} else if (operation === 'refreshToken') {
						const authCode = this.getNodeParameter(
							'authCode',
							itemIndex,
						) as string;
						const trimmedAuthCode = authCode?.trim();

						if (!trimmedAuthCode) {
							throw new NodeOperationError(
								this.getNode(),
								'Authorization code is required for the refresh token operation.',
								{ itemIndex },
							);
						}

						result = await tokenService.accessToken({
							appKey: trimmedAppKey,
							appSecret: trimmedAppSecret,
							authCode: trimmedAuthCode,
							proxy,
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported token operation: ${operation}`,
							{ itemIndex },
						);
					}
				} else {
					const accessTokenValue = this.getNodeParameter(
						'accessToken',
						itemIndex,
						'',
					) as string;
					const accessToken = accessTokenValue?.trim() || undefined;

					const sellerService = new SellerService({
						appKey: trimmedAppKey,
						appSecret: trimmedAppSecret,
						accessToken,
						proxy,
					});

					if (operation === 'getActiveShops') {
						result = await sellerService.getActiveShops();
					} else if (operation === 'getSellerPermissions') {
						result = await sellerService.getSellerPermissions();
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported seller operation: ${operation}`,
							{ itemIndex },
						);
					}
				}

				const output = result as IDataObject;

				returnData.push({
					json: output,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				const tokenError = error instanceof TokenServiceError ? error : undefined;
				const sellerError = error instanceof SellerServiceError ? error : undefined;
				const nodeError =
					error instanceof NodeOperationError
						? error
						: new NodeOperationError(
								this.getNode(),
								error instanceof Error
									? error.message
									: 'An unexpected error occurred while processing the TikTok Shop node.',
								{ itemIndex },
						  );

				if (this.continueOnFail()) {
					const errorPayload: IDataObject = {
						error: nodeError.message,
					};

					const statusCode =
						tokenError?.status ?? sellerError?.status;

					if (statusCode !== undefined) {
						errorPayload.status = statusCode;
					}

					returnData.push({
						json: errorPayload,
						pairedItem: { item: itemIndex },
					});
					continue;
				}

				throw nodeError;
			}
		}

		return [returnData];
	}
}

