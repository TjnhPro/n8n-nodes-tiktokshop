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
import {
	ProductService,
	ProductServiceError,
} from '../../services/product-service';

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
		description:
			'Handle TikTok Shop token exchanges, seller insights, and product catalog queries',
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
					{
						name: 'Product',
						value: 'product',
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
			displayName: 'Operation',
			name: 'operation',
			type: 'options',
			noDataExpression: true,
			options: [
				{
					name: 'Search Products',
					value: 'searchProducts',
					description: 'Search the product catalog with optional pagination',
				},
				{
					name: 'Create Product',
					value: 'createProduct',
					description: 'Create a new product in the shop',
				},
				{
					name: 'Upload Product Image',
					value: 'uploadProductImage',
					description: 'Upload an image to reuse across product listings',
				},
				{
					name: 'Delete Products',
					value: 'deleteProducts',
					description: 'Delete up to 20 products in a single request',
				},
				{
					name: 'Get Product Detail',
					value: 'getProductDetail',
					description: 'Retrieve the details for a specific product',
				},
			],
			default: 'searchProducts',
			displayOptions: {
				show: {
					group: ['product'],
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
						group: ['token', 'seller', 'product'],
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
						group: ['token', 'seller', 'product'],
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
						group: ['token', 'seller', 'product'],
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
				description:
					'Access token applied to Seller and Product API requests.',
				displayOptions: {
					show: {
						group: ['seller', 'product'],
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
		{
			displayName: 'Product ID',
			name: 'productId',
			type: 'string',
			default: '',
			required: true,
			description: 'Unique identifier for the product to retrieve.',
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['getProductDetail'],
				},
			},
		},
		{
			displayName: 'Shop Cipher',
			name: 'shopCipher',
			type: 'string',
			default: '',
			description:
				'Shop cipher identifier. Required for product search, creation, and deletion; optional for product detail lookups.',
			displayOptions: {
				show: {
					group: ['product'],
					operation: [
						'searchProducts',
						'createProduct',
						'deleteProducts',
						'getProductDetail',
					],
				},
			},
		},
		{
			displayName: 'Page Size',
			name: 'pageSize',
			type: 'number',
			default: 20,
			typeOptions: {
				minValue: 1,
				maxValue: 100,
			},
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['searchProducts'],
				},
			},
		},
		{
			displayName: 'Page Token',
			name: 'pageToken',
			type: 'string',
			default: '',
			description:
				'Use the token supplied by the previous response to continue paging results.',
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['searchProducts'],
				},
			},
		},
		{
			displayName: 'Payload',
			name: 'payload',
			type: 'json',
			default: '{}',
			description: 'Additional search filters expressed as a JSON object.',
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['searchProducts'],
				},
			},
		},
		{
			displayName: 'Product Payload',
			name: 'productPayload',
			type: 'json',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			default: '{}',
			description:
				'JSON object describing the product to create. Must include TikTok-required fields.',
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['createProduct'],
				},
			},
		},
		{
			displayName: 'Binary Property',
			name: 'binaryPropertyName',
			type: 'string',
			default: 'data',
			description:
				'Name of the input binary property that holds the image to upload.',
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['uploadProductImage'],
				},
			},
		},
		{
			displayName: 'Use Case',
			name: 'useCase',
			type: 'options',
			options: [
				{ name: 'Main Image', value: 'MAIN_IMAGE' },
				{ name: 'Attribute Image', value: 'ATTRIBUTE_IMAGE' },
				{ name: 'Description Image', value: 'DESCRIPTION_IMAGE' },
				{ name: 'Certification Image', value: 'CERTIFICATION_IMAGE' },
				{ name: 'Size Chart Image', value: 'SIZE_CHART_IMAGE' },
			],
			default: 'MAIN_IMAGE',
			description: 'Usage scenario of the image being uploaded.',
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['uploadProductImage'],
				},
			},
		},
		{
			displayName: 'Product IDs',
			name: 'productIds',
			type: 'string',
			default: '',
			placeholder: 'id1, id2, id3',
			description:
				'Comma-separated list of product IDs to delete (maximum 20 IDs).',
			displayOptions: {
				show: {
					group: ['product'],
					operation: ['deleteProducts'],
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
				| 'seller'
				| 'product';
			const operation = this.getNodeParameter(
				'operation',
				itemIndex,
			) as
				| 'accessToken'
				| 'refreshToken'
				| 'getActiveShops'
				| 'getSellerPermissions'
				| 'searchProducts'
				| 'createProduct'
				| 'uploadProductImage'
				| 'deleteProducts'
				| 'getProductDetail';
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
				} else if (group === 'seller') {
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
				} else if (group === 'product') {
					const accessTokenValue = this.getNodeParameter(
						'accessToken',
						itemIndex,
						'',
					) as string;
					const accessToken = accessTokenValue?.trim() || undefined;

					const productService = new ProductService({
						appKey: trimmedAppKey,
						appSecret: trimmedAppSecret,
						accessToken,
						proxy,
					});

					if (operation === 'searchProducts') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the search products operation.',
								{ itemIndex },
							);
						}

						const pageSize = this.getNodeParameter(
							'pageSize',
							itemIndex,
							undefined,
						) as number | undefined;
						const pageToken = this.getNodeParameter(
							'pageToken',
							itemIndex,
							'',
						) as string;
						const payloadParam = this.getNodeParameter(
							'payload',
							itemIndex,
							{},
						) as IDataObject | string;

						let payload: IDataObject | undefined;

						if (typeof payloadParam === 'string') {
							const trimmedPayload = payloadParam.trim();

							if (trimmedPayload) {
								try {
									payload = JSON.parse(trimmedPayload) as IDataObject;
								} catch (error) {
									throw new NodeOperationError(
										this.getNode(),
										`Payload must be valid JSON: ${
											error instanceof Error ? error.message : 'Unknown error'
										}`,
										{ itemIndex },
									);
								}
							}
						} else if (
							payloadParam &&
							Object.keys(payloadParam as IDataObject).length > 0
						) {
							payload = payloadParam as IDataObject;
						}

						result = await productService.searchProducts({
							shopCipher: trimmedShopCipher,
							pageSize:
								typeof pageSize === 'number' && Number.isFinite(pageSize)
									? pageSize
									: undefined,
							pageToken: pageToken?.toString().trim() || undefined,
							body: payload,
							accessToken,
							proxy,
						});
					} else if (operation === 'createProduct') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the create product operation.',
								{ itemIndex },
							);
						}

						const rawPayload = this.getNodeParameter(
							'productPayload',
							itemIndex,
							{},
						) as IDataObject | string;

						let body: IDataObject | undefined;

						if (typeof rawPayload === 'string') {
							const trimmed = rawPayload.trim();

							if (!trimmed) {
								throw new NodeOperationError(
									this.getNode(),
									'Product payload must be provided as a non-empty JSON object.',
									{ itemIndex },
								);
							}

							try {
								const parsed = JSON.parse(trimmed) as unknown;
								if (
									!parsed ||
									typeof parsed !== 'object' ||
									Array.isArray(parsed)
								) {
									throw new Error('Payload must be a JSON object.');
								}

								body = parsed as IDataObject;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Product payload must be valid JSON: ${
										error instanceof Error ? error.message : 'Unknown error'
									}`,
									{ itemIndex },
								);
							}
						} else {
							body = rawPayload as IDataObject;
						}

						if (
							!body ||
							typeof body !== 'object' ||
							Array.isArray(body) ||
							Object.keys(body).length === 0
						) {
							throw new NodeOperationError(
								this.getNode(),
								'Product payload must include at least one field.',
								{ itemIndex },
							);
						}

						result = await productService.createProduct({
							shopCipher: trimmedShopCipher,
							body,
							accessToken,
							proxy,
						});
					} else if (operation === 'uploadProductImage') {
						const binaryPropertyName = this.getNodeParameter(
							'binaryPropertyName',
							itemIndex,
						) as string;

						const trimmedBinaryProperty = binaryPropertyName?.trim();

						if (!trimmedBinaryProperty) {
							throw new NodeOperationError(
								this.getNode(),
								'Binary property name is required for the upload product image operation.',
								{ itemIndex },
							);
						}

						const binaryData = this.helpers.assertBinaryData(
							itemIndex,
							trimmedBinaryProperty,
						);
						const fileBuffer = await this.helpers.getBinaryDataBuffer(
							itemIndex,
							trimmedBinaryProperty,
						);
						const fileName =
							binaryData.fileName || `${trimmedBinaryProperty}.bin`;
						const useCase = this.getNodeParameter('useCase', itemIndex) as string;

						result = await productService.uploadProductImage({
							fileBuffer,
							fileName,
							fileMimeType: binaryData.mimeType,
							useCase,
							accessToken,
							proxy,
						});
					} else if (operation === 'deleteProducts') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the delete products operation.',
								{ itemIndex },
							);
						}

						const productIdsValue = this.getNodeParameter(
							'productIds',
							itemIndex,
						) as string;

						const productIds = productIdsValue
							.split(/[\s,]+/)
							.map((id) => id.trim())
							.filter((id) => Boolean(id));

						if (productIds.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'At least one product ID is required to delete products.',
								{ itemIndex },
							);
						}

						if (productIds.length > 20) {
							throw new NodeOperationError(
								this.getNode(),
								'You can delete at most 20 product IDs per request.',
								{ itemIndex },
							);
						}

						result = await productService.deleteProducts({
							shopCipher: trimmedShopCipher,
							productIds,
							accessToken,
							proxy,
						});
					} else if (operation === 'getProductDetail') {
						const productIdValue = this.getNodeParameter(
							'productId',
							itemIndex,
						) as string;
						const trimmedProductId = productIdValue.trim();

						if (!trimmedProductId) {
							throw new NodeOperationError(
								this.getNode(),
								'Product ID is required for the get product detail operation.',
								{ itemIndex },
							);
						}

						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const shopCipher = shopCipherValue?.trim() || undefined;

						result = await productService.getProductDetail({
							productId: trimmedProductId,
							shopCipher,
							accessToken,
							proxy,
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported product operation: ${operation}`,
							{ itemIndex },
						);
					}
				} else {
					throw new NodeOperationError(
						this.getNode(),
						`Unsupported group: ${group}`,
						{ itemIndex },
					);
				}

				const output = result as IDataObject;

				returnData.push({
					json: output,
					pairedItem: { item: itemIndex },
				});
			} catch (error) {
				const tokenError = error instanceof TokenServiceError ? error : undefined;
				const sellerError = error instanceof SellerServiceError ? error : undefined;
				const productError =
					error instanceof ProductServiceError ? error : undefined;
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
						tokenError?.status ?? sellerError?.status ?? productError?.status;

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

