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
import {
	LogisticsService,
	LogisticsServiceError,
} from '../../services/logistics-service';
import {
	FulfillmentsService,
	FulfillmentsServiceError,
	SHIPPING_DOCUMENT_TYPES,
	type ShippingDocumentType,
} from '../../services/fulfillments-service';
import {
	OrdersService,
	OrdersServiceError,
	type ExternalOrderReference,
} from '../../services/orders-service';
import {
	FinancesService,
	FinancesServiceError,
	type SortOrder,
	type WithdrawalType,
} from '../../services/finances-service';

export class TikTokShop implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'TikTok Shop',
		name: 'tiktokShop',
		icon: {
			light: 'file:../../icons/tiktokshop.dark.svg',
			dark: 'file:../../icons/tiktokshop.dark.svg',
		},
		version: 1,
		group: ['input'],
		description:
			'Handle TikTok Shop token exchanges, seller insights, order management, finance reconciliation, product catalog queries, and logistics lookups',
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
					{
						name: 'Orders',
						value: 'orders',
					},
					{
						name: 'Finances',
						value: 'finances',
					},
					{
						name: 'Logistics',
						value: 'logistics',
					},
					{
						name: 'Fulfillments',
						value: 'fulfillments',
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
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				options: [
					{
						name: 'Get Order List',
						value: 'getOrderList',
						description: 'Search orders for a shop with optional pagination and filters',
					},
					{
						name: 'Get Price Detail',
						value: 'getPriceDetail',
						description: 'Retrieve pricing details for a specific order',
					},
					{
						name: 'Add External Order References',
						value: 'addExternalOrderReferences',
						description: 'Attach external OMS references to TikTok Shop orders',
					},
					{
						name: 'Get External Order References',
						value: 'getExternalOrderReferences',
						description: 'Retrieve external OMS references linked to a TikTok Shop order',
					},
					{
						name: 'Search Order by External Reference',
						value: 'searchOrderByExternalReference',
						description: 'Find TikTok Shop orders using an external OMS identifier',
					},
					{
						name: 'Get Order Detail',
						value: 'getOrderDetail',
						description: 'Retrieve details for up to 50 TikTok Shop orders',
					},
				],
				default: 'getOrderList',
				displayOptions: {
					show: {
						group: ['orders'],
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
						name: 'Get Statements',
						value: 'getStatements',
						description:
							'Retrieve settlement statements for a shop with pagination and sorting controls',
					},
					{
						name: 'Get Payments',
						value: 'getPayments',
						description:
							'Retrieve payment records for a shop with pagination and optional sorting',
					},
					{
						name: 'Get Withdrawals',
						value: 'getWithdrawals',
						description:
							'Retrieve withdrawal records for a shop with optional type filters and pagination',
					},
					{
						name: 'Get Transactions by Order',
						value: 'getStatementTransactionsByOrder',
						description:
							'Inspect statement transactions linked to a specific order',
					},
					{
						name: 'Get Transactions by Statement',
						value: 'getStatementTransactionsByStatement',
						description:
							'Inspect transactions contained within a specific settlement statement',
					},
					{
						name: 'Get Unsettled Transactions',
						value: 'getUnsettledTransactions',
						description:
							'Retrieve unsettled order transactions for reconciliation',
					},
				],
				default: 'getStatements',
				displayOptions: {
					show: {
						group: ['finances'],
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
					name: 'List Warehouses',
					value: 'listWarehouses',
					description: 'Retrieve the warehouses configured for the seller',
				},
				{
					name: 'List Global Warehouses',
					value: 'listGlobalWarehouses',
					description: 'Retrieve the global warehouses available to the seller',
				},
				{
					name: 'List Warehouse Delivery Options',
					value: 'listWarehouseDeliveryOptions',
					description: 'Retrieve delivery options for a specific warehouse',
				},
				{
					name: 'List Shipping Providers',
					value: 'listShippingProviders',
					description: 'Retrieve shipping providers for a delivery option',
				},
			],
			default: 'listWarehouses',
			displayOptions: {
				show: {
					group: ['logistics'],
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
					name: 'Create Packages',
					value: 'createPackages',
					description: 'Create fulfillment packages for an order or shipment',
				},
				{
					name: 'Ship Package',
					value: 'shipPackage',
					description: 'Mark a package as shipped and provide shipment details',
				},
				{
					name: 'Get Package Shipping Document',
					value: 'getPackageShippingDocument',
					description: 'Download labels or documents generated for a package',
				},
			],
			default: 'createPackages',
			displayOptions: {
				show: {
					group: ['fulfillments'],
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
						group: ['token', 'seller', 'product', 'orders', 'finances', 'logistics', 'fulfillments'],
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
						group: ['token', 'seller', 'product', 'orders', 'finances', 'logistics', 'fulfillments'],
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
						group: ['token', 'seller', 'product', 'orders', 'finances', 'logistics', 'fulfillments'],
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
					'Access token applied to Seller, Product, Orders, Finances, Logistics, and Fulfillments API requests.',
				displayOptions: {
					show: {
						group: ['seller', 'product', 'orders', 'finances', 'logistics', 'fulfillments'],
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
				'Shop cipher identifier. Required for finance operations, fulfillments, order search and external reference batches, product search/creation/deletion, and most logistics lookups; optional for detail lookups.',
			displayOptions: {
				show: {
					group: ['product', 'orders', 'finances', 'logistics', 'fulfillments'],
					operation: [
						'searchProducts',
						'createProduct',
						'deleteProducts',
						'getProductDetail',
						'getOrderList',
						'getPriceDetail',
						'addExternalOrderReferences',
						'getExternalOrderReferences',
						'searchOrderByExternalReference',
						'getOrderDetail',
						'getStatements',
						'getPayments',
						'getWithdrawals',
						'getStatementTransactionsByOrder',
						'getStatementTransactionsByStatement',
						'getUnsettledTransactions',
						'listWarehouses',
						'listWarehouseDeliveryOptions',
						'listShippingProviders',
						'createPackages',
						'shipPackage',
						'getPackageShippingDocument',
					],
				},
			},
		},
		{
			displayName: 'Warehouse ID',
			name: 'warehouseId',
			type: 'string',
			default: '',
			required: true,
			description:
				'Unique identifier of the warehouse whose delivery options you want to retrieve.',
			displayOptions: {
				show: {
					group: ['logistics'],
					operation: ['listWarehouseDeliveryOptions'],
				},
			},
		},
		{
			displayName: 'Delivery Option ID',
			name: 'deliveryOptionId',
			type: 'string',
			default: '',
			required: true,
			description:
				'Unique identifier of the delivery option whose shipping providers you want to retrieve.',
			displayOptions: {
				show: {
					group: ['logistics'],
					operation: ['listShippingProviders'],
				},
			},
		},
		{
			displayName: 'Package ID',
			name: 'packageId',
			type: 'string',
			default: '',
			required: true,
			description: 'Identifier of the package to ship or download documents for.',
			displayOptions: {
				show: {
					group: ['fulfillments'],
					operation: ['shipPackage', 'getPackageShippingDocument'],
				},
			},
		},
		{
			displayName: 'Package Payload',
			name: 'packagePayload',
			type: 'json',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			default: '{}',
			description:
				'JSON object describing the packages to create. Refer to TikTok documentation for required fields.',
			displayOptions: {
				show: {
					group: ['fulfillments'],
					operation: ['createPackages'],
				},
			},
		},
		{
			displayName: 'Shipment Payload',
			name: 'shipmentPayload',
			type: 'json',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			default: '{}',
			description:
				'JSON object describing the shipment details for the package you are shipping.',
			displayOptions: {
				show: {
					group: ['fulfillments'],
					operation: ['shipPackage'],
				},
			},
		},
		{
			displayName: 'Document Type',
			name: 'documentType',
			type: 'options',
			options: [
				{ name: 'Shipping Label (PDF)', value: 'SHIPPING_LABEL' },
				{ name: 'Packing Slip (PDF)', value: 'PACKING_SLIP' },
				{
					name: 'Shipping Label + Packing Slip (PDF)',
					value: 'SHIPPING_LABEL_AND_PACKING_SLIP',
				},
				{ name: 'Shipping Label Picture (PNG)', value: 'SHIPPING_LABEL_PICTURE' },
				{ name: 'Hazmat Label (PDF)', value: 'HAZMAT_LABEL' },
				{ name: 'Invoice Label (Brazil, PDF A6)', value: 'INVOICE_LABEL' },
			],
			default: '',
			description:
				'Optional document type to download. Leave empty for the default shipping label PDF.',
			displayOptions: {
				show: {
					group: ['fulfillments'],
					operation: ['getPackageShippingDocument'],
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
		{
			displayName: 'Order Page Size',
			name: 'orderPageSize',
			type: 'number',
			default: 20,
			typeOptions: {
				minValue: 1,
				maxValue: 100,
			},
			description:
				'Number of orders to return per page. TikTok defaults apply when left empty.',
			displayOptions: {
				show: {
					group: ['orders'],
					operation: ['getOrderList'],
				},
			},
		},
		{
			displayName: 'Order Page Token',
			name: 'orderPageToken',
			type: 'string',
			default: '',
			description:
				'Use the token supplied by the previous response to continue paging order results.',
			displayOptions: {
				show: {
					group: ['orders'],
					operation: ['getOrderList'],
				},
			},
		},
		{
			displayName: 'Order Payload',
			name: 'orderPayload',
			type: 'json',
			default: '{}',
			description: 'Additional order search filters expressed as a JSON object.',
			displayOptions: {
				show: {
					group: ['orders'],
					operation: ['getOrderList'],
				},
			},
		},
		{
			displayName: 'Order ID',
			name: 'orderId',
			type: 'string',
			default: '',
			description:
				'TikTok Shop order ID to inspect. Required for price detail, external reference retrieval, and finance transaction lookups.',
			displayOptions: {
				show: {
					group: ['orders', 'finances'],
					operation: [
						'getPriceDetail',
						'getExternalOrderReferences',
						'getStatementTransactionsByOrder',
					],
				},
			},
		},
		{
			displayName: 'External Order ID',
			name: 'externalOrderId',
			type: 'string',
			default: '',
			description:
				'External OMS order identifier used to search TikTok Shop orders.',
			displayOptions: {
				show: {
					group: ['orders'],
					operation: ['searchOrderByExternalReference'],
				},
			},
		},
		{
			displayName: 'Order IDs',
			name: 'orderIds',
			type: 'string',
			default: '',
			placeholder: 'order1, order2, order3',
			description:
				'Comma-separated list of TikTok Shop order IDs (maximum 50 per request).',
			displayOptions: {
				show: {
					group: ['orders'],
					operation: ['getOrderDetail'],
				},
			},
		},
		{
			displayName: 'External Platform',
			name: 'platform',
			type: 'options',
			options: [
				{ name: 'Not Set', value: '' },
				{ name: 'Shopify', value: 'SHOPIFY' },
				{ name: 'WooCommerce', value: 'WOOCOMMERCE' },
				{ name: 'BigCommerce', value: 'BIGCOMMERCE' },
				{ name: 'Magento', value: 'MAGENTO' },
				{ name: 'Salesforce Commerce Cloud', value: 'SALESFORCE_COMMERCE_CLOUD' },
				{ name: 'ChannelAdvisor', value: 'CHANNEL_ADVISOR' },
				{ name: 'Amazon', value: 'AMAZON' },
				{ name: 'Order Management System', value: 'ORDER_MANAGEMENT_SYSTEM' },
				{ name: 'Warehouse Management System', value: 'WAREHOUSE_MANAGEMENT_SYSTEM' },
				{ name: 'ERP System', value: 'ERP_SYSTEM' },
			],
			default: '',
			description:
				'Alias of your external order management system. Leave unset unless an external platform applies.',
			displayOptions: {
				show: {
					group: ['orders'],
					operation: [
						'addExternalOrderReferences',
						'getExternalOrderReferences',
						'searchOrderByExternalReference',
					],
				},
			},
		},
		{
			displayName: 'External Order References',
			name: 'references',
			type: 'json',
			typeOptions: {
				alwaysOpenEditWindow: true,
			},
			default: '[]',
			description:
				'Array of external order reference objects to link (maximum 100 entries).',
			displayOptions: {
				show: {
					group: ['orders'],
					operation: ['addExternalOrderReferences'],
				},
			},
		},
		{
			displayName: 'Finance Page Size',
			name: 'financePageSize',
			type: 'number',
			default: 20,
			typeOptions: {
				minValue: 1,
				maxValue: 100,
			},
			description:
				'Number of finance records to return per page (1-100). Defaults to 20 when left empty.',
			displayOptions: {
				show: {
					group: ['finances'],
					operation: [
						'getStatements',
						'getPayments',
						'getWithdrawals',
						'getStatementTransactionsByStatement',
						'getUnsettledTransactions',
					],
				},
			},
		},
		{
			displayName: 'Finance Page Token',
			name: 'financePageToken',
			type: 'string',
			default: '',
			description:
				'Use the token from a previous finance response to continue paging results.',
			displayOptions: {
				show: {
					group: ['finances'],
					operation: [
						'getStatements',
						'getPayments',
						'getWithdrawals',
						'getStatementTransactionsByStatement',
						'getUnsettledTransactions',
					],
				},
			},
		},
		{
			displayName: 'Finance Sort Field',
			name: 'financeSortField',
			type: 'string',
			default: 'statement_time',
			description:
				'Custom field used to sort finance results. Statements default to statement_time; transaction lists default to order_create_time.',
			displayOptions: {
				show: {
					group: ['finances'],
					operation: [
						'getStatements',
						'getPayments',
						'getStatementTransactionsByStatement',
						'getUnsettledTransactions',
					],
				},
			},
		},
		{
			displayName: 'Finance Sort Order',
			name: 'financeSortOrder',
			type: 'options',
			options: [
				{ name: 'Ascending', value: 'ASC' },
				{ name: 'Descending', value: 'DESC' },
			],
			default: '',
			description:
				'Sort order for finance results. Defaults to TikTok API ordering when left empty.',
			displayOptions: {
				show: {
					group: ['finances'],
					operation: [
						'getStatements',
						'getPayments',
						'getStatementTransactionsByStatement',
						'getUnsettledTransactions',
					],
				},
			},
		},
		{
			displayName: 'Withdrawal Types',
			name: 'withdrawalTypes',
			type: 'multiOptions',
			options: [
				{
					name: 'Withdraw',
					value: 'WITHDRAW',
					description:
						'Seller withdrawn settlement amounts to their bank account.',
				},
				{
					name: 'Settle',
					value: 'SETTLE',
					description: 'Platform settled amounts to the seller.',
				},
				{
					name: 'Transfer',
					value: 'TRANSFER',
					description:
						'Platform subsidies or deductions triggered by platform policies.',
				},
				{
					name: 'Reverse',
					value: 'REVERSE',
					description:
						'Withdrawal reversal due to issues such as invalid bank details.',
				},
			],
			default: [],
			description:
				'Filter withdrawal records by type. Leave empty to include all withdrawal events.',
			displayOptions: {
				show: {
					group: ['finances'],
					operation: ['getWithdrawals'],
				},
			},
		},
		{
			displayName: 'Statement ID',
			name: 'statementId',
			type: 'string',
			default: '',
			required: true,
			description: 'Settlement statement ID to inspect.',
			displayOptions: {
				show: {
					group: ['finances'],
					operation: ['getStatementTransactionsByStatement'],
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
				| 'product'
				| 'orders'
				| 'finances'
				| 'logistics'
				| 'fulfillments';
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
				| 'getProductDetail'
				| 'getOrderList'
				| 'getPriceDetail'
				| 'addExternalOrderReferences'
				| 'getExternalOrderReferences'
				| 'searchOrderByExternalReference'
				| 'getOrderDetail'
				| 'getStatements'
				| 'getPayments'
				| 'getWithdrawals'
				| 'getStatementTransactionsByOrder'
				| 'getStatementTransactionsByStatement'
				| 'getUnsettledTransactions'
				| 'listWarehouses'
				| 'listGlobalWarehouses'
				| 'listWarehouseDeliveryOptions'
				| 'listShippingProviders'
				| 'createPackages'
				| 'shipPackage'
				| 'getPackageShippingDocument';
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
				} else if (group === 'orders') {
					const accessTokenValue = this.getNodeParameter(
						'accessToken',
						itemIndex,
						'',
					) as string;
					const accessToken = accessTokenValue?.trim() || undefined;

					const ordersService = new OrdersService({
						appKey: trimmedAppKey,
						appSecret: trimmedAppSecret,
						accessToken,
						proxy,
					});

					if (operation === 'getOrderList') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the get order list operation.',
								{ itemIndex },
							);
						}

						const pageSizeValue = this.getNodeParameter(
							'orderPageSize',
							itemIndex,
							undefined,
						) as number | undefined;
						const pageTokenValue = this.getNodeParameter(
							'orderPageToken',
							itemIndex,
							'',
						) as string;
						const rawOrderPayload = this.getNodeParameter(
							'orderPayload',
							itemIndex,
							{},
						) as IDataObject | string;

						let orderPayload: IDataObject | undefined;

						if (typeof rawOrderPayload === 'string') {
							const trimmedPayload = rawOrderPayload.trim();

							if (trimmedPayload) {
								try {
									const parsed = JSON.parse(trimmedPayload) as unknown;
									if (
										!parsed ||
										typeof parsed !== 'object' ||
										Array.isArray(parsed)
									) {
										throw new Error('Payload must be a JSON object.');
									}

									orderPayload = parsed as IDataObject;
								} catch (error) {
									throw new NodeOperationError(
										this.getNode(),
										`Order payload must be valid JSON: ${
											error instanceof Error ? error.message : 'Unknown error'
										}`,
										{ itemIndex },
									);
								}
							}
						} else if (Array.isArray(rawOrderPayload)) {
							throw new NodeOperationError(
								this.getNode(),
								'Order payload must be provided as a JSON object, not an array.',
								{ itemIndex },
							);
						} else if (
							rawOrderPayload &&
							typeof rawOrderPayload === 'object'
						) {
							orderPayload = rawOrderPayload as IDataObject;
						}

						const pageSize =
							typeof pageSizeValue === 'number' &&
							Number.isFinite(pageSizeValue)
								? pageSizeValue
								: undefined;
						const pageToken = pageTokenValue?.toString().trim() || undefined;

						result = await ordersService.getOrderList({
							shopCipher: trimmedShopCipher,
							pageSize,
							pageToken,
							body: orderPayload,
							accessToken,
							proxy,
						});
					} else if (operation === 'getPriceDetail') {
						const orderIdValue = this.getNodeParameter(
							'orderId',
							itemIndex,
							'',
						) as string;
						const trimmedOrderId = orderIdValue.trim();

						if (!trimmedOrderId) {
							throw new NodeOperationError(
								this.getNode(),
								'Order ID is required for the get price detail operation.',
								{ itemIndex },
							);
						}

						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const shopCipher = shopCipherValue?.trim() || undefined;

						result = await ordersService.getPriceDetail({
							orderId: trimmedOrderId,
							shopCipher,
							accessToken,
							proxy,
						});
					} else if (operation === 'addExternalOrderReferences') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the add external order references operation.',
								{ itemIndex },
							);
						}

						const platformValue = this.getNodeParameter(
							'platform',
							itemIndex,
							'',
						) as string;
						const trimmedPlatform = platformValue?.trim() || '';

						const rawReferences = this.getNodeParameter(
							'references',
							itemIndex,
							'[]',
						) as IDataObject[] | IDataObject | string;

						let references: IDataObject[] = [];

						if (typeof rawReferences === 'string') {
							const trimmed = rawReferences.trim();

							if (!trimmed) {
								throw new NodeOperationError(
									this.getNode(),
									'External order references must be provided as a JSON array of objects.',
									{ itemIndex },
								);
							}

							try {
								const parsed = JSON.parse(trimmed) as unknown;
								if (!Array.isArray(parsed)) {
									throw new Error('Payload must be a JSON array.');
								}

								references = parsed.map((entry, index) => {
									if (
										!entry ||
										typeof entry !== 'object' ||
										Array.isArray(entry)
									) {
										throw new Error(
											`Reference at index ${index} must be a JSON object.`,
										);
									}

									return entry as IDataObject;
								});
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`External order references must be provided as a JSON array of objects: ${
										error instanceof Error ? error.message : 'Unknown error'
									}`,
									{ itemIndex },
								);
							}
						} else if (Array.isArray(rawReferences)) {
							references = rawReferences.map((entry, index) => {
								if (
									!entry ||
									typeof entry !== 'object' ||
									Array.isArray(entry)
								) {
									throw new NodeOperationError(
										this.getNode(),
										`External order references must be objects. Invalid entry at index ${index}.`,
										{ itemIndex },
									);
								}

								return entry as IDataObject;
							});
						} else if (
							rawReferences &&
							typeof rawReferences === 'object'
						) {
							throw new NodeOperationError(
								this.getNode(),
								'External order references must be provided as a JSON array of objects.',
								{ itemIndex },
							);
						}

						if (references.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'At least one external order reference is required to add references.',
								{ itemIndex },
							);
						}

						if (references.length > 100) {
							throw new NodeOperationError(
								this.getNode(),
								'You can link at most 100 external order references per request.',
								{ itemIndex },
							);
						}

						result = await ordersService.addExternalOrderReferences({
							shopCipher: trimmedShopCipher,
							platform: trimmedPlatform || undefined,
							references: references as ExternalOrderReference[],
							accessToken,
							proxy,
						});
					} else if (operation === 'getExternalOrderReferences') {
						const orderIdValue = this.getNodeParameter(
							'orderId',
							itemIndex,
							'',
						) as string;
						const trimmedOrderId = orderIdValue.trim();

						if (!trimmedOrderId) {
							throw new NodeOperationError(
								this.getNode(),
								'Order ID is required for the get external order references operation.',
								{ itemIndex },
							);
						}

						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const shopCipher = shopCipherValue?.trim() || undefined;

						const platformValue = this.getNodeParameter(
							'platform',
							itemIndex,
							'',
						) as string;
						const platform = platformValue?.trim() || undefined;

						result = await ordersService.getExternalOrderReferences({
							orderId: trimmedOrderId,
							platform,
							shopCipher,
							accessToken,
							proxy,
						});
					} else if (operation === 'searchOrderByExternalReference') {
						const platformValue = this.getNodeParameter(
							'platform',
							itemIndex,
							'',
						) as string;
						const trimmedPlatform = platformValue?.trim();

						if (!trimmedPlatform) {
							throw new NodeOperationError(
								this.getNode(),
								'Platform is required for the search order by external reference operation.',
								{ itemIndex },
							);
						}

						const externalOrderIdValue = this.getNodeParameter(
							'externalOrderId',
							itemIndex,
							'',
						) as string;
						const trimmedExternalOrderId = externalOrderIdValue.trim();

						if (!trimmedExternalOrderId) {
							throw new NodeOperationError(
								this.getNode(),
								'External order ID is required for the search order by external reference operation.',
								{ itemIndex },
							);
						}

						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const shopCipher = shopCipherValue?.trim() || undefined;

						result = await ordersService.searchOrderByExternalReference({
							platform: trimmedPlatform,
							externalOrderId: trimmedExternalOrderId,
							shopCipher,
							accessToken,
							proxy,
						});
					} else if (operation === 'getOrderDetail') {
						const orderIdsValue = this.getNodeParameter(
							'orderIds',
							itemIndex,
							'',
						) as string;

						const orderIds = orderIdsValue
							.split(/[\s,]+/)
							.map((id) => id.trim())
							.filter((id) => Boolean(id));

						if (orderIds.length === 0) {
							throw new NodeOperationError(
								this.getNode(),
								'At least one order ID is required for the get order detail operation.',
								{ itemIndex },
							);
						}

						if (orderIds.length > 50) {
							throw new NodeOperationError(
								this.getNode(),
								'You can retrieve at most 50 order IDs per request.',
								{ itemIndex },
							);
						}

						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const shopCipher = shopCipherValue?.trim() || undefined;

						result = await ordersService.getOrderDetail({
							ids: orderIds,
							shopCipher,
							accessToken,
							proxy,
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported orders operation: ${operation}`,
							{ itemIndex },
						);
					}
				} else if (group === 'finances') {
					const accessTokenValue = this.getNodeParameter(
						'accessToken',
						itemIndex,
						'',
					) as string;
					const accessToken = accessTokenValue?.trim() || undefined;

					const financesService = new FinancesService({
						appKey: trimmedAppKey,
						appSecret: trimmedAppSecret,
						accessToken,
						proxy,
					});

					const resolveFinancePageSize = (
						value: number | undefined,
						context: string,
					): number | undefined => {
						if (value === undefined) {
							return undefined;
						}

						if (!Number.isFinite(value)) {
							throw new NodeOperationError(
								this.getNode(),
								`${context} must be a finite number between 1 and 100.`,
								{ itemIndex },
							);
						}

						const numeric = Number(value);

						if (numeric < 1 || numeric > 100) {
							throw new NodeOperationError(
								this.getNode(),
								`${context} must be between 1 and 100.`,
								{ itemIndex },
							);
						}

						return numeric;
					};

					const resolveFinanceSortOrder = (
						value: string | undefined,
					): SortOrder | undefined => {
						const trimmed = value?.toString().trim();
						if (!trimmed) {
							return undefined;
						}

						const upper = trimmed.toUpperCase();
						if (upper !== 'ASC' && upper !== 'DESC') {
							throw new NodeOperationError(
								this.getNode(),
								'Sort order must be either ASC or DESC when provided.',
								{ itemIndex },
							);
						}

						return upper as SortOrder;
					};

					const resolveShopCipher = (): string => {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the selected finance operation.',
								{ itemIndex },
							);
						}

						return trimmedShopCipher;
					};

					if (operation === 'getStatements') {
						const shopCipher = resolveShopCipher();

						const pageSizeValue = this.getNodeParameter(
							'financePageSize',
							itemIndex,
							undefined,
						) as number | undefined;
						const pageTokenValue = this.getNodeParameter(
							'financePageToken',
							itemIndex,
							'',
						) as string;
						const sortFieldValue = this.getNodeParameter(
							'financeSortField',
							itemIndex,
							'',
						) as string;
						const sortOrderValue = this.getNodeParameter(
							'financeSortOrder',
							itemIndex,
							'',
						) as string;

						const pageSize = resolveFinancePageSize(
							pageSizeValue,
							'Finance page size',
						);
						const pageToken = pageTokenValue?.trim() || undefined;
						const sortField = sortFieldValue?.trim() || undefined;
						const sortOrder = resolveFinanceSortOrder(sortOrderValue);

						result = await financesService.getStatements({
							shopCipher,
							pageSize,
							pageToken,
							sortField,
							sortOrder,
							accessToken,
							proxy,
						});
					} else if (operation === 'getPayments') {
						const shopCipher = resolveShopCipher();

						const pageSizeValue = this.getNodeParameter(
							'financePageSize',
							itemIndex,
							undefined,
						) as number | undefined;
						const pageTokenValue = this.getNodeParameter(
							'financePageToken',
							itemIndex,
							'',
						) as string;
						const sortFieldValue = this.getNodeParameter(
							'financeSortField',
							itemIndex,
							'',
						) as string;
						const sortOrderValue = this.getNodeParameter(
							'financeSortOrder',
							itemIndex,
							'',
						) as string;

						const pageSize = resolveFinancePageSize(
							pageSizeValue,
							'Finance page size',
						);
						const pageToken = pageTokenValue?.trim() || undefined;
						const sortField = sortFieldValue?.trim() || undefined;
						const sortOrder = resolveFinanceSortOrder(sortOrderValue);

						result = await financesService.getPayments({
							shopCipher,
							pageSize,
							pageToken,
							sortField,
							sortOrder,
							accessToken,
							proxy,
						});
					} else if (operation === 'getWithdrawals') {
						const shopCipher = resolveShopCipher();

						const pageSizeValue = this.getNodeParameter(
							'financePageSize',
							itemIndex,
							undefined,
						) as number | undefined;
						const pageTokenValue = this.getNodeParameter(
							'financePageToken',
							itemIndex,
							'',
						) as string;
						const rawTypes = this.getNodeParameter(
							'withdrawalTypes',
							itemIndex,
							[],
						) as string[];

						const pageSize = resolveFinancePageSize(
							pageSizeValue,
							'Finance page size',
						);
						const pageToken = pageTokenValue?.trim() || undefined;

						const allowedWithdrawalTypes: WithdrawalType[] = [
							'WITHDRAW',
							'SETTLE',
							'TRANSFER',
							'REVERSE',
						];

						const withdrawalTypes = Array.isArray(rawTypes)
							? rawTypes
									.map((value) => value?.toString().trim().toUpperCase())
									.filter((value): value is WithdrawalType =>
										allowedWithdrawalTypes.includes(value as WithdrawalType),
									)
							: [];

						if (
							Array.isArray(rawTypes) &&
							withdrawalTypes.length !== rawTypes.length
						) {
							throw new NodeOperationError(
								this.getNode(),
								`Withdrawal types must be within ${allowedWithdrawalTypes.join(', ')}.`,
								{ itemIndex },
							);
						}

						result = await financesService.getWithdrawals({
							shopCipher,
							pageSize,
							pageToken,
							types: withdrawalTypes.length
								? (withdrawalTypes as WithdrawalType[])
								: undefined,
							accessToken,
							proxy,
						});
					} else if (operation === 'getStatementTransactionsByOrder') {
						const shopCipher = resolveShopCipher();
						const orderIdValue = this.getNodeParameter(
							'orderId',
							itemIndex,
							'',
						) as string;
						const trimmedOrderId = orderIdValue.trim();

						if (!trimmedOrderId) {
							throw new NodeOperationError(
								this.getNode(),
								'Order ID is required for the get transactions by order operation.',
								{ itemIndex },
							);
						}

						result = await financesService.getStatementTransactionsByOrder({
							orderId: trimmedOrderId,
							shopCipher,
							accessToken,
							proxy,
						});
					} else if (operation === 'getStatementTransactionsByStatement') {
						const shopCipher = resolveShopCipher();

						const statementIdValue = this.getNodeParameter(
							'statementId',
							itemIndex,
							'',
						) as string;
						const trimmedStatementId = statementIdValue.trim();

						if (!trimmedStatementId) {
							throw new NodeOperationError(
								this.getNode(),
								'Statement ID is required for the get transactions by statement operation.',
								{ itemIndex },
							);
						}

						const pageSizeValue = this.getNodeParameter(
							'financePageSize',
							itemIndex,
							undefined,
						) as number | undefined;
						const pageTokenValue = this.getNodeParameter(
							'financePageToken',
							itemIndex,
							'',
						) as string;
						const sortFieldValue = this.getNodeParameter(
							'financeSortField',
							itemIndex,
							'',
						) as string;
						const sortOrderValue = this.getNodeParameter(
							'financeSortOrder',
							itemIndex,
							'',
						) as string;

						const pageSize = resolveFinancePageSize(
							pageSizeValue,
							'Finance page size',
						);
						const pageToken = pageTokenValue?.trim() || undefined;
						const sortField = sortFieldValue?.trim() || undefined;
						const sortOrder = resolveFinanceSortOrder(sortOrderValue);

						result = await financesService.getStatementTransactionsByStatement({
							statementId: trimmedStatementId,
							shopCipher,
							pageSize,
							pageToken,
							sortField,
							sortOrder,
							accessToken,
							proxy,
						});
					} else if (operation === 'getUnsettledTransactions') {
						const shopCipher = resolveShopCipher();

						const pageSizeValue = this.getNodeParameter(
							'financePageSize',
							itemIndex,
							undefined,
						) as number | undefined;
						const pageTokenValue = this.getNodeParameter(
							'financePageToken',
							itemIndex,
							'',
						) as string;
						const sortFieldValue = this.getNodeParameter(
							'financeSortField',
							itemIndex,
							'',
						) as string;
						const sortOrderValue = this.getNodeParameter(
							'financeSortOrder',
							itemIndex,
							'',
						) as string;

						const pageSize = resolveFinancePageSize(
							pageSizeValue,
							'Finance page size',
						);
						const pageToken = pageTokenValue?.trim() || undefined;
						const sortField = sortFieldValue?.trim() || undefined;
						const sortOrder = resolveFinanceSortOrder(sortOrderValue);

						result = await financesService.getUnsettledTransactions({
							shopCipher,
							pageSize,
							pageToken,
							sortField,
							sortOrder,
							accessToken,
							proxy,
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported finances operation: ${operation}`,
							{ itemIndex },
						);
					}
				} else if (group === 'logistics') {
					const accessTokenValue = this.getNodeParameter(
						'accessToken',
						itemIndex,
						'',
					) as string;
					const accessToken = accessTokenValue?.trim() || undefined;

					const logisticsService = new LogisticsService({
						appKey: trimmedAppKey,
						appSecret: trimmedAppSecret,
						accessToken,
						proxy,
					});

					if (operation === 'listWarehouses') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the list warehouses operation.',
								{ itemIndex },
							);
						}

						result = await logisticsService.listWarehouses({
							shopCipher: trimmedShopCipher,
							accessToken,
							proxy,
						});
					} else if (operation === 'listGlobalWarehouses') {
						result = await logisticsService.listGlobalWarehouses({
							accessToken,
							proxy,
						});
					} else if (operation === 'listWarehouseDeliveryOptions') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the list warehouse delivery options operation.',
								{ itemIndex },
							);
						}

						const warehouseIdValue = this.getNodeParameter(
							'warehouseId',
							itemIndex,
						) as string;
						const trimmedWarehouseId = warehouseIdValue.trim();

						if (!trimmedWarehouseId) {
							throw new NodeOperationError(
								this.getNode(),
								'Warehouse ID is required for the list warehouse delivery options operation.',
								{ itemIndex },
							);
						}

						result = await logisticsService.listWarehouseDeliveryOptions({
							warehouseId: trimmedWarehouseId,
							shopCipher: trimmedShopCipher,
							accessToken,
							proxy,
						});
					} else if (operation === 'listShippingProviders') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the list shipping providers operation.',
								{ itemIndex },
							);
						}

						const deliveryOptionIdValue = this.getNodeParameter(
							'deliveryOptionId',
							itemIndex,
						) as string;
						const trimmedDeliveryOptionId = deliveryOptionIdValue.trim();

						if (!trimmedDeliveryOptionId) {
							throw new NodeOperationError(
								this.getNode(),
								'Delivery option ID is required for the list shipping providers operation.',
								{ itemIndex },
							);
						}

						result = await logisticsService.listShippingProviders({
							deliveryOptionId: trimmedDeliveryOptionId,
							shopCipher: trimmedShopCipher,
							accessToken,
							proxy,
						});
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported logistics operation: ${operation}`,
							{ itemIndex },
						);
					}
				} else if (group === 'fulfillments') {
					const accessTokenValue = this.getNodeParameter(
						'accessToken',
						itemIndex,
						'',
					) as string;
					const accessToken = accessTokenValue?.trim() || undefined;

					const fulfillmentsService = new FulfillmentsService({
						appKey: trimmedAppKey,
						appSecret: trimmedAppSecret,
						accessToken,
						proxy,
					});

					if (operation === 'createPackages') {
						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the create packages operation.',
								{ itemIndex },
							);
						}

						const rawPayload = this.getNodeParameter(
							'packagePayload',
							itemIndex,
							{},
						) as IDataObject | string;

						let body: IDataObject | undefined;

						if (typeof rawPayload === 'string') {
							const trimmedPayload = rawPayload.trim();

							if (!trimmedPayload) {
								throw new NodeOperationError(
									this.getNode(),
									'Package payload must be provided as a non-empty JSON object.',
									{ itemIndex },
								);
							}

							try {
								const parsed = JSON.parse(trimmedPayload) as unknown;
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
									`Package payload must be valid JSON: ${
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
								'Package payload must include at least one field.',
								{ itemIndex },
							);
						}

						result = (await fulfillmentsService.createPackages({
							shopCipher: trimmedShopCipher,
							body,
							accessToken,
							proxy,
						})) as Record<string, unknown>;
					} else if (operation === 'shipPackage') {
						const packageIdValue = this.getNodeParameter(
							'packageId',
							itemIndex,
							'',
						) as string;
						const trimmedPackageId = packageIdValue.trim();

						if (!trimmedPackageId) {
							throw new NodeOperationError(
								this.getNode(),
								'Package ID is required for the ship package operation.',
								{ itemIndex },
							);
						}

						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the ship package operation.',
								{ itemIndex },
							);
						}

						const rawShipmentPayload = this.getNodeParameter(
							'shipmentPayload',
							itemIndex,
							{},
						) as IDataObject | string;

						let shipmentBody: IDataObject | undefined;

						if (typeof rawShipmentPayload === 'string') {
							const trimmedPayload = rawShipmentPayload.trim();

							if (!trimmedPayload) {
								throw new NodeOperationError(
									this.getNode(),
									'Shipment payload must be provided as a non-empty JSON object.',
									{ itemIndex },
								);
							}

							try {
								const parsed = JSON.parse(trimmedPayload) as unknown;
								if (
									!parsed ||
									typeof parsed !== 'object' ||
									Array.isArray(parsed)
								) {
									throw new Error('Payload must be a JSON object.');
								}

								shipmentBody = parsed as IDataObject;
							} catch (error) {
								throw new NodeOperationError(
									this.getNode(),
									`Shipment payload must be valid JSON: ${
										error instanceof Error ? error.message : 'Unknown error'
									}`,
									{ itemIndex },
								);
							}
						} else {
							shipmentBody = rawShipmentPayload as IDataObject;
						}

						if (
							!shipmentBody ||
							typeof shipmentBody !== 'object' ||
							Array.isArray(shipmentBody) ||
							Object.keys(shipmentBody).length === 0
						) {
							throw new NodeOperationError(
								this.getNode(),
								'Shipment payload must include at least one field.',
								{ itemIndex },
							);
						}

						result = (await fulfillmentsService.shipPackage({
							packageId: trimmedPackageId,
							shopCipher: trimmedShopCipher,
							body: shipmentBody,
							accessToken,
							proxy,
						})) as Record<string, unknown>;
					} else if (operation === 'getPackageShippingDocument') {
						const packageIdValue = this.getNodeParameter(
							'packageId',
							itemIndex,
							'',
						) as string;
						const trimmedPackageId = packageIdValue.trim();

						if (!trimmedPackageId) {
							throw new NodeOperationError(
								this.getNode(),
								'Package ID is required for the get package shipping document operation.',
								{ itemIndex },
							);
						}

						const shopCipherValue = this.getNodeParameter(
							'shopCipher',
							itemIndex,
							'',
						) as string;
						const trimmedShopCipher = shopCipherValue.trim();

						if (!trimmedShopCipher) {
							throw new NodeOperationError(
								this.getNode(),
								'Shop cipher is required for the get package shipping document operation.',
								{ itemIndex },
							);
						}

						const documentTypeValue = this.getNodeParameter(
							'documentType',
							itemIndex,
							'',
						) as string;
						const trimmedDocumentType = documentTypeValue.trim();

						if (
							trimmedDocumentType &&
							!SHIPPING_DOCUMENT_TYPES.includes(
								trimmedDocumentType as ShippingDocumentType,
							)
						) {
							throw new NodeOperationError(
								this.getNode(),
								`Document type must be one of: ${SHIPPING_DOCUMENT_TYPES.join(', ')}.`,
								{ itemIndex },
							);
						}

						result = (await fulfillmentsService.getPackageShippingDocument({
							packageId: trimmedPackageId,
							shopCipher: trimmedShopCipher,
							documentType: trimmedDocumentType
								? (trimmedDocumentType as ShippingDocumentType)
								: undefined,
							accessToken,
							proxy,
						})) as Record<string, unknown>;
					} else {
						throw new NodeOperationError(
							this.getNode(),
							`Unsupported fulfillments operation: ${operation}`,
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
				const logisticsError =
					error instanceof LogisticsServiceError ? error : undefined;
				const ordersError =
					error instanceof OrdersServiceError ? error : undefined;
				const financesError =
					error instanceof FinancesServiceError ? error : undefined;
				const fulfillmentsError =
					error instanceof FulfillmentsServiceError ? error : undefined;
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
						tokenError?.status ??
						sellerError?.status ??
						productError?.status ??
						ordersError?.status ??
						financesError?.status ??
						logisticsError?.status ??
						fulfillmentsError?.status;

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
