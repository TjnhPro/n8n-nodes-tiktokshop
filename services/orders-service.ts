import {
	BaseService,
	BaseServiceError,
	type BaseServiceOptions,
	type BaseServiceRequestConfig,
} from './base-service';

export type OrdersServiceOptions = BaseServiceOptions;

export interface GetOrderListOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	shopCipher: string;
	pageSize?: number;
	pageToken?: string;
	body?: Record<string, unknown>;
}

export interface GetPriceDetailOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	orderId: string;
	shopCipher?: string;
}

export type ExternalOrderReference = Record<string, unknown>;

export interface AddExternalOrderReferencesOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	shopCipher: string;
	references: ExternalOrderReference[];
	platform?: string;
}

export interface GetExternalOrderReferencesOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	orderId: string;
	shopCipher?: string;
	platform?: string;
}

export interface SearchOrderByExternalReferenceOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	platform: string;
	externalOrderId: string;
	shopCipher?: string;
	body?: Record<string, unknown>;
}

export interface GetOrderDetailOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	ids: string[];
	shopCipher?: string;
}

export class OrdersServiceError extends BaseServiceError {
	constructor(message: string, details?: { status?: number; data?: unknown }) {
		super(message, details);
		this.name = 'OrdersServiceError';
	}
}

export class OrdersService extends BaseService {
	constructor(options: OrdersServiceOptions) {
		super(options);
	}

	public async getOrderList<T = unknown>(
		options: GetOrderListOptions,
	): Promise<T> {
		const { shopCipher, pageSize, pageToken, body, accessToken, proxy, headers } =
			options;

		const trimmedShopCipher = shopCipher?.toString().trim();

		if (!trimmedShopCipher) {
			throw new OrdersServiceError(
				'OrdersService getOrderList requires a non-empty shopCipher.',
			);
		}

		const query: Record<string, unknown> = {
			shop_cipher: trimmedShopCipher,
		};

		if (
			pageSize !== undefined &&
			Number.isFinite(pageSize) &&
			Number(pageSize) > 0
		) {
			query.page_size = Number(pageSize);
		}

		const trimmedPageToken = pageToken?.toString().trim();
		if (trimmedPageToken) {
			query.page_token = trimmedPageToken;
		}

		try {
			return await this.request<T>({
				path: '/order/202309/orders/search',
				method: 'POST',
				query,
				body: body ?? {},
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getPriceDetail<T = unknown>(
		options: GetPriceDetailOptions,
	): Promise<T> {
		const { orderId, shopCipher, accessToken, proxy, headers } = options;
		const trimmedOrderId = orderId?.toString().trim();

		if (!trimmedOrderId) {
			throw new OrdersServiceError(
				'OrdersService getPriceDetail requires a non-empty orderId.',
			);
		}

		const query: Record<string, unknown> = {};

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (trimmedShopCipher) {
			query.shop_cipher = trimmedShopCipher;
		}

		try {
			return await this.request<T>({
				path: `/order/202407/orders/${encodeURIComponent(trimmedOrderId)}/price_detail`,
				method: 'GET',
				query,
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async addExternalOrderReferences<T = unknown>(
		options: AddExternalOrderReferencesOptions,
	): Promise<T> {
		const { shopCipher, references, platform, accessToken, proxy, headers } =
			options;

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (!trimmedShopCipher) {
			throw new OrdersServiceError(
				'OrdersService addExternalOrderReferences requires a non-empty shopCipher.',
			);
		}

		if (!Array.isArray(references)) {
			throw new OrdersServiceError(
				'OrdersService addExternalOrderReferences requires an array of reference objects.',
			);
		}

		if (references.length === 0) {
			throw new OrdersServiceError(
				'OrdersService addExternalOrderReferences requires at least one external reference.',
			);
		}

		if (references.length > 100) {
			throw new OrdersServiceError(
				'OrdersService addExternalOrderReferences supports a maximum of 100 external references per request.',
			);
		}

		const normalizedReferences = references.map((reference, index) => {
			if (
				!reference ||
				typeof reference !== 'object' ||
				Array.isArray(reference)
			) {
				throw new OrdersServiceError(
					`OrdersService addExternalOrderReferences requires each reference to be an object. Invalid reference at index ${index}.`,
				);
			}

			return reference as Record<string, unknown>;
		});

		const query: Record<string, unknown> = {
			shop_cipher: trimmedShopCipher,
		};

		const trimmedPlatform = platform?.toString().trim();
		if (trimmedPlatform) {
			query.platform = trimmedPlatform;
		}

		try {
			return await this.request<T>({
				path: '/order/202406/orders/external_orders',
				method: 'POST',
				query,
				body: normalizedReferences,
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getExternalOrderReferences<T = unknown>(
		options: GetExternalOrderReferencesOptions,
	): Promise<T> {
		const { orderId, shopCipher, platform, accessToken, proxy, headers } =
			options;

		const trimmedOrderId = orderId?.toString().trim();
		if (!trimmedOrderId) {
			throw new OrdersServiceError(
				'OrdersService getExternalOrderReferences requires a non-empty orderId.',
			);
		}

		const query: Record<string, unknown> = {};

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (trimmedShopCipher) {
			query.shop_cipher = trimmedShopCipher;
		}

		const trimmedPlatform = platform?.toString().trim();
		if (trimmedPlatform) {
			query.platform = trimmedPlatform;
		}

		try {
			return await this.request<T>({
				path: `/order/202406/orders/${encodeURIComponent(trimmedOrderId)}/external_orders`,
				method: 'GET',
				query,
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async searchOrderByExternalReference<T = unknown>(
		options: SearchOrderByExternalReferenceOptions,
	): Promise<T> {
		const {
			platform,
			externalOrderId,
			shopCipher,
			body,
			accessToken,
			proxy,
			headers,
		} = options;

		const trimmedPlatform = platform?.toString().trim();
		if (!trimmedPlatform) {
			throw new OrdersServiceError(
				'OrdersService searchOrderByExternalReference requires a non-empty platform.',
			);
		}

		const trimmedExternalOrderId = externalOrderId?.toString().trim();
		if (!trimmedExternalOrderId) {
			throw new OrdersServiceError(
				'OrdersService searchOrderByExternalReference requires a non-empty externalOrderId.',
			);
		}

		const query: Record<string, unknown> = {
			platform: trimmedPlatform,
			external_order_id: trimmedExternalOrderId,
		};

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (trimmedShopCipher) {
			query.shop_cipher = trimmedShopCipher;
		}

		try {
			return await this.request<T>({
				path: '/order/202406/orders/external_order_search',
				method: 'POST',
				query,
				body: body ?? {},
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getOrderDetail<T = unknown>(
		options: GetOrderDetailOptions,
	): Promise<T> {
		const { ids, shopCipher, accessToken, proxy, headers } = options;

		if (!Array.isArray(ids)) {
			throw new OrdersServiceError(
				'OrdersService getOrderDetail requires an array of order IDs.',
			);
		}

		const normalizedIds = ids
			.map((id) => id?.toString().trim())
			.filter((id): id is string => Boolean(id));

		if (normalizedIds.length === 0) {
			throw new OrdersServiceError(
				'OrdersService getOrderDetail requires at least one non-empty order ID.',
			);
		}

		if (normalizedIds.length > 50) {
			throw new OrdersServiceError(
				'OrdersService getOrderDetail supports a maximum of 50 order IDs per request.',
			);
		}

		const query: Record<string, unknown> = {
			ids: normalizedIds.join(','),
		};

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (trimmedShopCipher) {
			query.shop_cipher = trimmedShopCipher;
		}

		try {
			return await this.request<T>({
				path: '/order/202507/orders',
				method: 'GET',
				query,
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	private wrapError(error: unknown): OrdersServiceError {
		if (error instanceof OrdersServiceError) {
			return error;
		}

		if (error instanceof BaseServiceError) {
			return new OrdersServiceError(error.message, {
				status: error.status,
				data: error.data,
			});
		}

		if (error instanceof Error) {
			return new OrdersServiceError(error.message);
		}

		return new OrdersServiceError(
			'OrdersService request failed with an unknown error.',
		);
	}
}
