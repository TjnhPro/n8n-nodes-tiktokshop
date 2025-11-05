import {
	BaseService,
	BaseServiceError,
	type BaseServiceOptions,
	type BaseServiceRequestConfig,
} from './base-service';

export type FinancesServiceOptions = BaseServiceOptions;

export type SortOrder = 'ASC' | 'DESC';

export type WithdrawalType =
	| 'WITHDRAW'
	| 'SETTLE'
	| 'TRANSFER'
	| 'REVERSE';

interface BasePagedOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	shopCipher: string;
	pageSize?: number;
	pageToken?: string;
	sortField?: string;
	sortOrder?: SortOrder | string;
}

export interface GetStatementsOptions extends BasePagedOptions {}

export interface GetPaymentsOptions extends BasePagedOptions {}

export interface GetWithdrawalsOptions
	extends Pick<BasePagedOptions, 'accessToken' | 'proxy' | 'headers' | 'shopCipher' | 'pageSize' | 'pageToken'> {
	types?: WithdrawalType[];
}

export interface GetStatementTransactionsByOrderOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	orderId: string;
	shopCipher: string;
}

export interface GetStatementTransactionsByStatementOptions
	extends Pick<BaseServiceRequestConfig, 'accessToken' | 'proxy' | 'headers'> {
	statementId: string;
	shopCipher: string;
	pageSize?: number;
	pageToken?: string;
	sortField?: string;
	sortOrder?: SortOrder | string;
}

export interface GetUnsettledTransactionsOptions
	extends BasePagedOptions {}

export class FinancesServiceError extends BaseServiceError {
	constructor(message: string, details?: { status?: number; data?: unknown }) {
		super(message, details);
		this.name = 'FinancesServiceError';
	}
}

export class FinancesService extends BaseService {
	constructor(options: FinancesServiceOptions) {
		super(options);
	}

	public async getStatements<T = unknown>(
		options: GetStatementsOptions,
	): Promise<T> {
		const {
			shopCipher,
			pageSize,
			pageToken,
			sortField,
			sortOrder,
			accessToken,
			proxy,
			headers,
		} = options;

		const query = this.buildPagedQuery({
			shopCipher,
			pageSize,
			pageToken,
			defaultSortField: 'statement_time',
			sortField,
			sortOrder,
		});

		try {
			return await this.request<T>({
				path: '/finance/202309/statements',
				method: 'GET',
				query,
				headers: this.mergeJsonHeader(headers),
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getPayments<T = unknown>(
		options: GetPaymentsOptions,
	): Promise<T> {
		const {
			shopCipher,
			pageSize,
			pageToken,
			sortField,
			sortOrder,
			accessToken,
			proxy,
			headers,
		} = options;

		const query = this.buildPagedQuery({
			shopCipher,
			pageSize,
			pageToken,
			sortField,
			sortOrder,
		});

		try {
			return await this.request<T>({
				path: '/finance/202309/payments',
				method: 'GET',
				query,
				headers: this.mergeJsonHeader(headers),
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getWithdrawals<T = unknown>(
		options: GetWithdrawalsOptions,
	): Promise<T> {
		const {
			shopCipher,
			pageSize,
			pageToken,
			types,
			accessToken,
			proxy,
			headers,
		} = options;

		const query = this.buildPagedQuery({
			shopCipher,
			pageSize,
			pageToken,
		});

		if (types && types.length > 0) {
			const normalized = this.normalizeWithdrawalTypes(types);
			if (normalized.length > 0) {
				query.types = normalized.join(',');
			}
		}

		try {
			return await this.request<T>({
				path: '/finance/202309/withdrawals',
				method: 'GET',
				query,
				headers: this.mergeJsonHeader(headers),
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getStatementTransactionsByOrder<T = unknown>(
		options: GetStatementTransactionsByOrderOptions,
	): Promise<T> {
		const { orderId, shopCipher, accessToken, proxy, headers } = options;
		const trimmedOrderId = orderId?.toString().trim();

		if (!trimmedOrderId) {
			throw new FinancesServiceError(
				'FinancesService getStatementTransactionsByOrder requires a non-empty orderId.',
			);
		}

		const trimmedShopCipher = shopCipher?.toString().trim();

		if (!trimmedShopCipher) {
			throw new FinancesServiceError(
				'FinancesService getStatementTransactionsByOrder requires a non-empty shopCipher.',
			);
		}

		const query: Record<string, unknown> = {
			shop_cipher: trimmedShopCipher,
		};

		try {
			return await this.request<T>({
				path: `/finance/202501/orders/${encodeURIComponent(trimmedOrderId)}/statement_transactions`,
				method: 'GET',
				query,
				headers: this.mergeJsonHeader(headers),
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getStatementTransactionsByStatement<T = unknown>(
		options: GetStatementTransactionsByStatementOptions,
	): Promise<T> {
		const {
			statementId,
			shopCipher,
			pageSize,
			pageToken,
			sortField,
			sortOrder,
			accessToken,
			proxy,
			headers,
		} = options;
		const trimmedStatementId = statementId?.toString().trim();

		if (!trimmedStatementId) {
			throw new FinancesServiceError(
				'FinancesService getStatementTransactionsByStatement requires a non-empty statementId.',
			);
		}

		const query = this.buildPagedQuery({
			shopCipher,
			pageSize,
			pageToken,
			defaultSortField: 'order_create_time',
			sortField,
			sortOrder,
		});

		try {
			return await this.request<T>({
				path: `/finance/202501/statements/${encodeURIComponent(trimmedStatementId)}/statement_transactions`,
				method: 'GET',
				query,
				headers: this.mergeJsonHeader(headers),
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	public async getUnsettledTransactions<T = unknown>(
		options: GetUnsettledTransactionsOptions,
	): Promise<T> {
		const {
			shopCipher,
			pageSize,
			pageToken,
			sortField,
			sortOrder,
			accessToken,
			proxy,
			headers,
		} = options;

		const query = this.buildPagedQuery({
			shopCipher,
			pageSize,
			pageToken,
			defaultSortField: 'order_create_time',
			sortField,
			sortOrder,
		});

		try {
			return await this.request<T>({
				path: '/finance/202507/orders/unsettled',
				method: 'GET',
				query,
				headers: this.mergeJsonHeader(headers),
				accessToken,
				proxy,
			});
		} catch (error) {
			throw this.wrapError(error);
		}
	}

	private buildPagedQuery(input: {
		shopCipher: string;
		pageSize?: number;
		pageToken?: string;
		defaultSortField?: string;
		sortField?: string;
		sortOrder?: SortOrder | string;
	}): Record<string, unknown> {
		const {
			shopCipher,
			pageSize,
			pageToken,
			defaultSortField,
			sortField,
			sortOrder,
		} = input;

		const trimmedShopCipher = shopCipher?.toString().trim();

		if (!trimmedShopCipher) {
			throw new FinancesServiceError(
				'FinancesService operations require a non-empty shopCipher.',
			);
		}

		const query: Record<string, unknown> = {
			shop_cipher: trimmedShopCipher,
		};

		const resolvedPageSize = this.resolvePageSize(pageSize);
		if (resolvedPageSize !== undefined) {
			query.page_size = resolvedPageSize;
		}

		const trimmedPageToken = pageToken?.toString().trim();
		if (trimmedPageToken) {
			query.page_token = trimmedPageToken;
		}

		const resolvedSortField = (sortField ?? defaultSortField)?.toString().trim();
		if (resolvedSortField) {
			query.sort_field = resolvedSortField;
		}

		if (sortOrder) {
			query.sort_order = this.normalizeSortOrder(sortOrder);
		}

		return query;
	}

	private resolvePageSize(pageSize?: number): number | undefined {
		if (pageSize === undefined) {
			return 20;
		}

		if (!Number.isFinite(pageSize)) {
			throw new FinancesServiceError(
				'FinancesService pageSize must be a finite number.',
			);
		}

		const numeric = Number(pageSize);

		if (numeric < 1 || numeric > 100) {
			throw new FinancesServiceError(
				'FinancesService pageSize must be between 1 and 100.',
			);
		}

		return Math.floor(numeric);
	}

	private normalizeSortOrder(sortOrder: SortOrder | string): SortOrder {
		const upper = sortOrder.toString().toUpperCase();

		if (upper !== 'ASC' && upper !== 'DESC') {
			throw new FinancesServiceError(
				"FinancesService sortOrder must be either 'ASC' or 'DESC'.",
			);
		}

		return upper as SortOrder;
	}

	private normalizeWithdrawalTypes(types: WithdrawalType[]): WithdrawalType[] {
		const allowed: WithdrawalType[] = [
			'WITHDRAW',
			'SETTLE',
			'TRANSFER',
			'REVERSE',
		];

		const normalized = types
			.map((type) =>
				type ? (type.toString().trim().toUpperCase() as WithdrawalType) : undefined,
			)
			.filter((type): type is WithdrawalType => Boolean(type));

		for (const type of normalized) {
			if (!allowed.includes(type)) {
				throw new FinancesServiceError(
					'FinancesService getWithdrawals supports types WITHDRAW, SETTLE, TRANSFER, or REVERSE.',
				);
			}
		}

		return normalized;
	}

	private mergeJsonHeader(
		headers?: Record<string, string>,
	): Record<string, string> {
		return {
			'Content-Type': 'application/json',
			...(headers ?? {}),
		};
	}

	private wrapError(error: unknown): FinancesServiceError {
		if (error instanceof FinancesServiceError) {
			return error;
		}

		if (error instanceof BaseServiceError) {
			return new FinancesServiceError(error.message, {
				status: error.status,
				data: error.data,
			});
		}

		if (error instanceof Error) {
			return new FinancesServiceError(error.message);
		}

		return new FinancesServiceError(
			'FinancesService request failed with an unknown error.',
		);
	}
}
