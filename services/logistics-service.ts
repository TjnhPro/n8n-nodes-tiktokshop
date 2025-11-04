import {
	BaseService,
	BaseServiceError,
	type BaseServiceOptions,
	type BaseServiceRequestConfig,
} from './base-service';

export type LogisticsServiceOptions = BaseServiceOptions;

export interface ListWarehousesOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	shopCipher: string;
	query?: Record<string, unknown>;
}

export interface ListGlobalWarehousesOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	query?: Record<string, unknown>;
}

export interface ListWarehouseDeliveryOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	warehouseId: string;
	shopCipher: string;
	query?: Record<string, unknown>;
}

export interface ListShippingProvidersOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	deliveryOptionId: string;
	shopCipher: string;
	query?: Record<string, unknown>;
}

export class LogisticsServiceError extends BaseServiceError {
	constructor(message: string, details?: { status?: number; data?: unknown }) {
		super(message, details);
		this.name = 'LogisticsServiceError';
	}
}

export class LogisticsService extends BaseService {
	constructor(options: LogisticsServiceOptions) {
		super(options);
	}

	public async listWarehouses<T = unknown>(
		options: ListWarehousesOptions,
	): Promise<T> {
		const { shopCipher, query, accessToken, proxy, headers } = options;
		const trimmedShopCipher = shopCipher?.toString().trim();

		if (!trimmedShopCipher) {
			throw new LogisticsServiceError(
				'LogisticsService listWarehouses requires a non-empty shopCipher.',
			);
		}

		const normalizedQuery: Record<string, unknown> = {
			...(query ?? {}),
			shop_cipher: trimmedShopCipher,
		};

		try {
			return await this.request<T>({
				path: '/logistics/202309/warehouses',
				method: 'GET',
				query: normalizedQuery,
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

	public async listGlobalWarehouses<T = unknown>(
		options: ListGlobalWarehousesOptions = {},
	): Promise<T> {
		const { query, accessToken, proxy, headers } = options;

		try {
			return await this.request<T>({
				path: '/logistics/202309/global_warehouses',
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

	public async listWarehouseDeliveryOptions<T = unknown>(
		options: ListWarehouseDeliveryOptions,
	): Promise<T> {
		const { warehouseId, shopCipher, query, accessToken, proxy, headers } =
			options;

		const trimmedWarehouseId = warehouseId?.toString().trim();
		if (!trimmedWarehouseId) {
			throw new LogisticsServiceError(
				'LogisticsService listWarehouseDeliveryOptions requires a non-empty warehouseId.',
			);
		}

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (!trimmedShopCipher) {
			throw new LogisticsServiceError(
				'LogisticsService listWarehouseDeliveryOptions requires a non-empty shopCipher.',
			);
		}

		const normalizedQuery: Record<string, unknown> = {
			...(query ?? {}),
			shop_cipher: trimmedShopCipher,
		};

		try {
			return await this.request<T>({
				path: `/logistics/202309/warehouses/${encodeURIComponent(trimmedWarehouseId)}/delivery_options`,
				method: 'GET',
				query: normalizedQuery,
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

	public async listShippingProviders<T = unknown>(
		options: ListShippingProvidersOptions,
	): Promise<T> {
		const { deliveryOptionId, shopCipher, query, accessToken, proxy, headers } =
			options;

		const trimmedDeliveryOptionId = deliveryOptionId?.toString().trim();
		if (!trimmedDeliveryOptionId) {
			throw new LogisticsServiceError(
				'LogisticsService listShippingProviders requires a non-empty deliveryOptionId.',
			);
		}

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (!trimmedShopCipher) {
			throw new LogisticsServiceError(
				'LogisticsService listShippingProviders requires a non-empty shopCipher.',
			);
		}

		const normalizedQuery: Record<string, unknown> = {
			...(query ?? {}),
			shop_cipher: trimmedShopCipher,
		};

		try {
			return await this.request<T>({
				path: `/logistics/202309/delivery_options/${encodeURIComponent(trimmedDeliveryOptionId)}/shipping_providers`,
				method: 'GET',
				query: normalizedQuery,
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

	private wrapError(error: unknown): LogisticsServiceError {
		if (error instanceof LogisticsServiceError) {
			return error;
		}

		if (error instanceof BaseServiceError) {
			return new LogisticsServiceError(error.message, {
				status: error.status,
				data: error.data,
			});
		}

		if (error instanceof Error) {
			return new LogisticsServiceError(error.message);
		}

		return new LogisticsServiceError(
			'LogisticsService request failed with an unknown error.',
		);
	}
}
