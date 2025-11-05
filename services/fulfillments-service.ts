import {
	BaseService,
	BaseServiceError,
	type BaseServiceOptions,
	type BaseServiceRequestConfig,
} from './base-service';

export type FulfillmentsServiceOptions = BaseServiceOptions;

export interface CreatePackagesOptions
	extends Pick<
		BaseServiceRequestConfig,
		'accessToken' | 'proxy' | 'headers'
	> {
	shopCipher: string;
	body: Record<string, unknown>;
}

export interface ShipPackageOptions
	extends Pick<
		BaseServiceRequestConfig,
		'accessToken' | 'proxy' | 'headers'
	> {
	packageId: string;
	shopCipher: string;
	body: Record<string, unknown>;
}

export const SHIPPING_DOCUMENT_TYPES = [
	'SHIPPING_LABEL',
	'PACKING_SLIP',
	'SHIPPING_LABEL_AND_PACKING_SLIP',
	'SHIPPING_LABEL_PICTURE',
	'HAZMAT_LABEL',
	'INVOICE_LABEL',
] as const;

export type ShippingDocumentType = (typeof SHIPPING_DOCUMENT_TYPES)[number];

export interface GetPackageShippingDocumentOptions
	extends Pick<
		BaseServiceRequestConfig,
		'accessToken' | 'proxy' | 'headers'
	> {
	packageId: string;
	shopCipher: string;
	documentType?: ShippingDocumentType;
}

export class FulfillmentsServiceError extends BaseServiceError {
	constructor(message: string, details?: { status?: number; data?: unknown }) {
		super(message, details);
		this.name = 'FulfillmentsServiceError';
	}
}

export class FulfillmentsService extends BaseService {
	constructor(options: FulfillmentsServiceOptions) {
		super(options);
	}

	public async createPackages<T = unknown>(
		options: CreatePackagesOptions,
	): Promise<T> {
		const { shopCipher, body, accessToken, proxy, headers } = options;

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (!trimmedShopCipher) {
			throw new FulfillmentsServiceError(
				'FulfillmentsService createPackages requires a non-empty shopCipher.',
			);
		}

		if (
			!body ||
			typeof body !== 'object' ||
			Array.isArray(body) ||
			Object.keys(body).length === 0
		) {
			throw new FulfillmentsServiceError(
				'FulfillmentsService createPackages requires a non-empty JSON body.',
			);
		}

		try {
			return await this.request<T>({
				path: '/fulfillment/202309/packages',
				method: 'POST',
				query: {
					shop_cipher: trimmedShopCipher,
				},
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				body,
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async shipPackage<T = unknown>(
		options: ShipPackageOptions,
	): Promise<T> {
		const { packageId, shopCipher, body, accessToken, proxy, headers } =
			options;

		const trimmedPackageId = packageId?.toString().trim();
		if (!trimmedPackageId) {
			throw new FulfillmentsServiceError(
				'FulfillmentsService shipPackage requires a non-empty packageId.',
			);
		}

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (!trimmedShopCipher) {
			throw new FulfillmentsServiceError(
				'FulfillmentsService shipPackage requires a non-empty shopCipher.',
			);
		}

		if (
			!body ||
			typeof body !== 'object' ||
			Array.isArray(body) ||
			Object.keys(body).length === 0
		) {
			throw new FulfillmentsServiceError(
				'FulfillmentsService shipPackage requires a non-empty JSON body.',
			);
		}

		try {
			return await this.request<T>({
				path: `/fulfillment/202309/packages/${encodeURIComponent(trimmedPackageId)}/ship`,
				method: 'POST',
				query: {
					shop_cipher: trimmedShopCipher,
				},
				headers: {
					'Content-Type': 'application/json',
					...(headers ?? {}),
				},
				body,
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getPackageShippingDocument<T = unknown>(
		options: GetPackageShippingDocumentOptions,
	): Promise<T> {
		const { packageId, shopCipher, documentType, accessToken, proxy, headers } =
			options;

		const trimmedPackageId = packageId?.toString().trim();
		if (!trimmedPackageId) {
			throw new FulfillmentsServiceError(
				'FulfillmentsService getPackageShippingDocument requires a non-empty packageId.',
			);
		}

		const trimmedShopCipher = shopCipher?.toString().trim();
		if (!trimmedShopCipher) {
			throw new FulfillmentsServiceError(
				'FulfillmentsService getPackageShippingDocument requires a non-empty shopCipher.',
			);
		}

		if (
			documentType &&
			!SHIPPING_DOCUMENT_TYPES.includes(documentType)
		) {
			throw new FulfillmentsServiceError(
				`FulfillmentsService getPackageShippingDocument received unsupported documentType '${documentType}'.`,
			);
		}

		try {
			return await this.request<T>({
				path: `/fulfillment/202309/packages/${encodeURIComponent(trimmedPackageId)}/shipping_documents`,
				method: 'GET',
				query: {
					shop_cipher: trimmedShopCipher,
					...(documentType ? { document_type: documentType } : {}),
				},
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

	private wrapError(error: unknown): FulfillmentsServiceError {
		if (error instanceof FulfillmentsServiceError) {
			return error;
		}

		if (error instanceof BaseServiceError) {
			return new FulfillmentsServiceError(error.message, {
				status: error.status,
				data: error.data,
			});
		}

		if (error instanceof Error) {
			return new FulfillmentsServiceError(error.message);
		}

		return new FulfillmentsServiceError(
			'FulfillmentsService request failed with an unknown error.',
		);
	}
}
