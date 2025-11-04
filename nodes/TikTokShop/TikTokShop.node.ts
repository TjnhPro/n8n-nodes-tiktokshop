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
		description: 'Handle TikTok Shop token exchanges',
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
				displayName: 'App Key',
				name: 'appKey',
				type: 'string',
				default: '',
				required: true,
				displayOptions: {
					show: {
						group: ['token'],
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
						group: ['token'],
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
						group: ['token'],
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
			const appKey = this.getNodeParameter('appKey', itemIndex) as string;
			const appSecret = this.getNodeParameter('appSecret', itemIndex) as string;
			const operation = this.getNodeParameter(
				'operation',
				itemIndex,
			) as 'accessToken' | 'refreshToken';

			const proxyOverride = this.getNodeParameter(
				'proxy',
				itemIndex,
				'',
			) as string;
			const proxy = proxyOverride?.trim() || undefined;

			try {
				let result: Record<string, unknown>;

				if (operation === 'accessToken') {
					const refreshTokenValue = this.getNodeParameter(
						'refreshToken',
						itemIndex,
					) as string;

					if (!refreshTokenValue) {
						throw new NodeOperationError(
							this.getNode(),
							'Refresh token is required for the access token operation.',
							{ itemIndex },
						);
					}

					result = await tokenService.refreshToken({
						appKey,
						appSecret,
						refreshToken: refreshTokenValue,
						proxy,
					});
				} else {
					const authCode = this.getNodeParameter(
						'authCode',
						itemIndex,
					) as string;

					if (!authCode) {
						throw new NodeOperationError(
							this.getNode(),
							'Authorization code is required for the refresh token operation.',
							{ itemIndex },
						);
					}

					result = await tokenService.accessToken({
						appKey,
						appSecret,
						authCode,
						proxy,
					});
				}

				const output = result as IDataObject;

				returnData.push({
					json: output,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				const tokenError = error instanceof TokenServiceError ? error : undefined;
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

					if (tokenError?.status) {
						errorPayload.status = tokenError.status;
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
