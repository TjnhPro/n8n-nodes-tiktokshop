import FormData from 'form-data';

import {
	BaseService,
	BaseServiceError,
	type BaseServiceOptions,
	type BaseServiceRequestConfig,
} from './base-service';

export type ProductServiceOptions = BaseServiceOptions;

export interface SearchProductsOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	shopCipher: string;
	pageSize?: number;
	pageToken?: string;
	body?: Record<string, unknown>;
}

export interface GetProductDetailOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	productId: string;
	shopCipher?: string;
}

export interface CreateProductOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	shopCipher: string;
	body: Record<string, unknown>;
}

export interface UploadProductImageOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	fileBuffer: Buffer;
	fileName: string;
	useCase: string;
	fileMimeType?: string;
}

export interface DeleteProductsOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	shopCipher: string;
	productIds: string[];
}

export class ProductServiceError extends BaseServiceError {
	constructor(message: string, details?: { status?: number; data?: unknown }) {
		super(message, details);
		this.name = 'ProductServiceError';
	}
}

export class ProductService extends BaseService {
	constructor(options: ProductServiceOptions) {
		super(options);
	}

	public async searchProducts<T = unknown>(
		options: SearchProductsOptions,
	): Promise<T> {
		const { shopCipher, pageSize, pageToken, body, accessToken, proxy, headers } =
			options;
		const trimmedShopCipher = shopCipher?.toString().trim();

		if (!trimmedShopCipher) {
			throw new ProductServiceError(
				'ProductService searchProducts requires a non-empty shopCipher.',
			);
		}
		const query: Record<string, unknown> = {};

		query.shop_cipher = trimmedShopCipher;

		if (typeof pageSize === 'number' && Number.isFinite(pageSize)) {
			query.page_size = pageSize;
		}

		if (pageToken && pageToken.toString().trim()) {
			query.page_token = pageToken.toString().trim();
		}

		try {
			return await this.request<T>({
				path: '/product/202502/products/search',
				method: 'POST',
				body: body ?? {},
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

	public async getProductDetail<T = unknown>(
		options: GetProductDetailOptions,
	): Promise<T> {
		const { productId, shopCipher, accessToken, proxy, headers } = options;
		const trimmedProductId = productId?.toString().trim();

		if (!trimmedProductId) {
			throw new ProductServiceError(
				'ProductService getProductDetail requires a non-empty productId.',
			);
		}

		const query: Record<string, unknown> = {};

		const trimmedShopCipher = shopCipher?.toString().trim();

		if (trimmedShopCipher) {
			query.shop_cipher = trimmedShopCipher;
		}

		try {
			return await this.request<T>({
				path: `/product/202309/products/${encodeURIComponent(trimmedProductId)}`,
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

	public async createProduct<T = unknown>(
		options: CreateProductOptions,
	): Promise<T> {
		const { shopCipher, body, accessToken, proxy, headers } = options;
		const trimmedShopCipher = shopCipher?.toString().trim();

		if (!trimmedShopCipher) {
			throw new ProductServiceError(
				'ProductService createProduct requires a non-empty shopCipher.',
			);
		}

		if (!body || Object.keys(body).length === 0) {
			throw new ProductServiceError(
				'ProductService createProduct requires a non-empty body payload.',
			);
		}

		try {
			return await this.request<T>({
				path: '/product/202309/products',
				method: 'POST',
				query: { shop_cipher: trimmedShopCipher },
				body,
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

	public async uploadProductImage<T = unknown>(
		options: UploadProductImageOptions,
	): Promise<T> {
		const { fileBuffer, fileName, useCase, fileMimeType, accessToken, proxy, headers } =
			options;

		if (!fileBuffer || fileBuffer.length === 0) {
			throw new ProductServiceError(
				'ProductService uploadProductImage requires a non-empty image buffer.',
			);
		}

		const trimmedUseCase = useCase?.toString().trim();

		if (!trimmedUseCase) {
			throw new ProductServiceError(
				'ProductService uploadProductImage requires a non-empty useCase value.',
			);
		}

		const form = new FormData();
		form.append('data', fileBuffer, {
			filename: fileName || 'image',
			contentType: fileMimeType,
		});
		form.append('use_case', trimmedUseCase);

		try {
			return await this.request<T>({
				path: '/product/202309/images/upload',
				method: 'POST',
				body: form,
				headers: {
					...(form.getHeaders() as Record<string, string>),
					...(headers ?? {}),
				},
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async deleteProducts<T = unknown>(
		options: DeleteProductsOptions,
	): Promise<T> {
		const { shopCipher, productIds, accessToken, proxy, headers } = options;

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (!trimmedShopCipher) {
			throw new ProductServiceError(
				'ProductService deleteProducts requires a non-empty shopCipher.',
			);
		}

		if (!Array.isArray(productIds) || productIds.length === 0) {
			throw new ProductServiceError(
				'ProductService deleteProducts requires at least one product ID.',
			);
		}

		if (productIds.length > 20) {
			throw new ProductServiceError(
				'ProductService deleteProducts supports a maximum of 20 product IDs per request.',
			);
		}

		const normalizedProductIds = productIds
			.map((id) => id?.toString().trim())
			.filter((id): id is string => Boolean(id));

		if (normalizedProductIds.length === 0) {
			throw new ProductServiceError(
				'ProductService deleteProducts requires at least one non-empty product ID.',
			);
		}

		try {
			return await this.request<T>({
				path: '/product/202309/products',
				method: 'DELETE',
				query: { shop_cipher: trimmedShopCipher },
				body: { product_ids: normalizedProductIds },
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

	private wrapError(error: unknown): ProductServiceError {
		if (error instanceof ProductServiceError) {
			return error;
		}

		if (error instanceof BaseServiceError) {
			return new ProductServiceError(error.message, {
				status: error.status,
				data: error.data,
			});
		}

		if (error instanceof Error) {
			return new ProductServiceError(error.message);
		}

		return new ProductServiceError(
			'ProductService request failed with an unknown error.',
		);
	}
}
