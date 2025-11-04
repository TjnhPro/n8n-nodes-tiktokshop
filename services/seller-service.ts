import {
	BaseService,
	BaseServiceError,
	type BaseServiceOptions,
	type BaseServiceRequestConfig,
} from './base-service';

export interface SellerServiceOptions extends BaseServiceOptions {}

export interface SellerRequestOptions
	extends Pick<
		BaseServiceRequestConfig,
		'query' | 'accessToken' | 'proxy' | 'headers'
	> {}

export class SellerServiceError extends BaseServiceError {
	constructor(message: string, details?: { status?: number; data?: unknown }) {
		super(message, details);
		this.name = 'SellerServiceError';
	}
}

export class SellerService extends BaseService {
	constructor(options: SellerServiceOptions) {
		super(options);
	}

	public async getActiveShops<T = unknown>(
		options: SellerRequestOptions = {},
	): Promise<T> {
		try {
			return await this.request<T>({
				path: '/seller/202309/shops',
				method: 'GET',
				query: options.query,
				headers: {
					'Content-Type': 'application/json',
					...(options.headers ?? {}),
				},
				accessToken: options.accessToken,
				proxy: options.proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getSellerPermissions<T = unknown>(
		options: SellerRequestOptions = {},
	): Promise<T> {
		try {
			return await this.request<T>({
				path: '/seller/202309/permissions',
				method: 'GET',
				query: options.query,
				headers: {
					'Content-Type': 'application/json',
					...(options.headers ?? {}),
				},
				accessToken: options.accessToken,
				proxy: options.proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	private wrapError(error: unknown): SellerServiceError {
		if (error instanceof SellerServiceError) {
			return error;
		}

		if (error instanceof BaseServiceError) {
			return new SellerServiceError(error.message, {
				status: error.status,
				data: error.data,
			});
		}

		if (error instanceof Error) {
			return new SellerServiceError(error.message);
		}

		return new SellerServiceError(
			'SellerService request failed with an unknown error.',
		);
	}
}
