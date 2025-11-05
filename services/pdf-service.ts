import axios, { type AxiosInstance, type AxiosResponse } from 'axios';
import { PDFDocument, type PDFEmbeddedPage } from 'pdf-lib';

const MM_PER_INCH = 25.4;
const POINTS_PER_INCH = 72;

export type PdfProcessingStage =
	| 'download'
	| 'validate'
	| 'resize'
	| 'output';

export interface PdfServiceOptions {
	httpClient?: AxiosInstance;
	timeoutMs?: number;
}

export interface PdfTargetPageSize {
	widthMm: number;
	heightMm: number;
}

export interface PdfResizeRequest {
	sourceUrl: string;
	targetPageSize?: PdfTargetPageSize;
	scale?: number;
	dpi?: number;
}

export interface PdfResizeMetadata {
	pageCount: number;
	finalPageSizeMm: PdfTargetPageSize;
	finalPageSizePoints: { width: number; height: number };
	dpi?: number;
	originalSizeBytes: number;
}

export interface PdfResizeResult {
	buffer: Buffer;
	metadata: PdfResizeMetadata;
}

export class PdfServiceError extends Error {
	public readonly stage: PdfProcessingStage;
	public readonly status?: number;

	constructor(
		message: string,
		stage: PdfProcessingStage,
		options: { cause?: unknown; status?: number } = {},
	) {
		super(message, { cause: options.cause });
		this.name = 'PdfServiceError';
		this.stage = stage;
		this.status = options.status;
	}
}

export class PdfService {
	private readonly httpClient: AxiosInstance;
	private readonly timeoutMs: number;

	constructor(options: PdfServiceOptions = {}) {
		const { httpClient, timeoutMs = 15000 } = options;
		this.httpClient =
			httpClient ??
			axios.create({
				timeout: timeoutMs,
				headers: { Accept: 'application/pdf' },
			});
		this.timeoutMs = timeoutMs;
	}

	public async resizeFromUrl(
		request: PdfResizeRequest,
	): Promise<PdfResizeResult> {
		const { sourceUrl, targetPageSize, scale, dpi } = request;

		this.assertValidRequest(request);

		const pdfBuffer = await this.downloadPdf(sourceUrl);

		const resized = await this.buildResizedPdf(pdfBuffer, {
			targetPageSize,
			scale,
			dpi,
		});

		return {
			buffer: resized.buffer,
			metadata: {
				...resized.metadata,
				dpi,
				originalSizeBytes: pdfBuffer.length,
			},
		};
	}

	private assertValidRequest(request: PdfResizeRequest): void {
		const { sourceUrl, targetPageSize, scale } = request;

		if (!sourceUrl || !sourceUrl.trim()) {
			throw new PdfServiceError(
				'PdfService requires a non-empty HTTPS sourceUrl.',
				'validate',
			);
		}

		let url: URL;
		try {
			url = new URL(sourceUrl);
		} catch (error) {
			throw new PdfServiceError(
				`PdfService received an invalid URL: ${sourceUrl}`,
				'validate',
				{ cause: error },
			);
		}

		if (url.protocol !== 'https:') {
			throw new PdfServiceError(
				'PdfService only supports HTTPS source URLs.',
				'validate',
			);
		}

		if (targetPageSize && scale !== undefined && scale !== null) {
			throw new PdfServiceError(
				'Provide either targetPageSize or scale, not both.',
				'validate',
			);
		}

		if (!targetPageSize && (scale === undefined || scale === null)) {
			throw new PdfServiceError(
				'PdfService requires either targetPageSize or scale to resize the document.',
				'validate',
			);
		}

		if (targetPageSize) {
			const { widthMm, heightMm } = targetPageSize;
			if (!isFinite(widthMm) || widthMm <= 0 || !isFinite(heightMm) || heightMm <= 0) {
				throw new PdfServiceError(
					'targetPageSize widthMm and heightMm must be positive numbers.',
					'validate',
				);
			}
		}

		if (scale !== undefined && scale !== null) {
			if (!isFinite(scale) || scale <= 0) {
				throw new PdfServiceError(
					'scale must be a positive number.',
					'validate',
				);
			}
		}
	}

	private async downloadPdf(sourceUrl: string): Promise<Buffer> {
		let response: AxiosResponse<ArrayBuffer>;
		try {
			response = await this.httpClient.get<ArrayBuffer>(sourceUrl, {
				responseType: 'arraybuffer',
				timeout: this.timeoutMs,
			});
		} catch (error) {
			throw new PdfServiceError(
				`Failed to download PDF from ${sourceUrl}.`,
				'download',
				{ cause: error },
			);
		}

		const { status, headers, data } = response;

		if (status < 200 || status >= 300) {
			throw new PdfServiceError(
				`PDF download failed with status ${status}.`,
				'download',
				{ status },
			);
		}

		const contentType = headers?.['content-type'] ?? headers?.['Content-Type'];
		if (contentType && !contentType.toLowerCase().includes('application/pdf')) {
			throw new PdfServiceError(
				`Expected application/pdf content-type but received ${contentType}.`,
				'validate',
			);
		}

		const buffer = Buffer.from(data);

		if (!this.isPdfSignature(buffer)) {
			throw new PdfServiceError(
				'Source document is not a valid PDF.',
				'validate',
			);
		}

		return buffer;
	}

	private async buildResizedPdf(
		source: Buffer,
		options: {
			targetPageSize?: PdfTargetPageSize;
			scale?: number;
			dpi?: number;
		},
	): Promise<{ buffer: Buffer; metadata: PdfResizeMetadata }> {
		try {
			const originalDocument = await PDFDocument.load(source);
			const outputDocument = await PDFDocument.create();
			const pageCount = originalDocument.getPageCount();
			const pageIndices = Array.from({ length: pageCount }, (_, index) => index);
			const embeddedPages = await outputDocument.embedPdf(source, pageIndices);

			let resolvedPageSizePoints: { width: number; height: number } | undefined;

			for (let index = 0; index < pageCount; index++) {
				const originalPage = originalDocument.getPage(index);
				const embeddedPage = embeddedPages[index] as PDFEmbeddedPage;
				const { width, height } = originalPage.getSize();

				const { targetWidth, targetHeight, scaleFactor } =
					this.resolveDimensions(width, height, options);

				const page = outputDocument.addPage([targetWidth, targetHeight]);
				const scaled = embeddedPage.scale(scaleFactor);
				const offsetX = (targetWidth - scaled.width) / 2;
				const offsetY = (targetHeight - scaled.height) / 2;

				page.drawPage(embeddedPage, {
					x: offsetX,
					y: offsetY,
					width: scaled.width,
					height: scaled.height,
				});

				if (!resolvedPageSizePoints) {
					resolvedPageSizePoints = {
						width: targetWidth,
						height: targetHeight,
					};
				}
			}

			const finalBytes = await outputDocument.save();
			const buffer = Buffer.from(finalBytes);
			const finalPageSizePoints =
				resolvedPageSizePoints ?? this.pointsToTarget(options);

			return {
				buffer,
				metadata: {
					pageCount,
					finalPageSizePoints,
					finalPageSizeMm: {
						widthMm: this.pointsToMillimeters(finalPageSizePoints.width),
						heightMm: this.pointsToMillimeters(finalPageSizePoints.height),
					},
					originalSizeBytes: source.length,
				},
			};
		} catch (error) {
			if (error instanceof PdfServiceError) {
				throw error;
			}

			throw new PdfServiceError(
				'Failed to resize PDF document.',
				'resize',
				{ cause: error },
			);
		}
	}

	private resolveDimensions(
		originalWidth: number,
		originalHeight: number,
		options: {
			targetPageSize?: PdfTargetPageSize;
			scale?: number;
		},
	): { targetWidth: number; targetHeight: number; scaleFactor: number } {
		const { targetPageSize, scale } = options;

		if (scale !== undefined && scale !== null) {
			const targetWidth = originalWidth * scale;
			const targetHeight = originalHeight * scale;
			return { targetWidth, targetHeight, scaleFactor: scale };
		}

		if (!targetPageSize) {
			return {
				targetWidth: originalWidth,
				targetHeight: originalHeight,
				scaleFactor: 1,
			};
		}

		const targetWidth = this.millimetersToPoints(targetPageSize.widthMm);
		const targetHeight = this.millimetersToPoints(targetPageSize.heightMm);

		const scaleFactor = Math.min(
			targetWidth / originalWidth,
			targetHeight / originalHeight,
		);

		return { targetWidth, targetHeight, scaleFactor };
	}

	private pointsToTarget(options: {
		targetPageSize?: PdfTargetPageSize;
		scale?: number;
	}): { width: number; height: number } {
		if (options.targetPageSize) {
			return {
				width: this.millimetersToPoints(options.targetPageSize.widthMm),
				height: this.millimetersToPoints(options.targetPageSize.heightMm),
			};
		}

		return { width: 0, height: 0 };
	}

	private isPdfSignature(buffer: Buffer): boolean {
		if (buffer.byteLength < 4) {
			return false;
		}

		return buffer.subarray(0, 4).toString('ascii') === '%PDF';
	}

	private millimetersToPoints(mm: number): number {
		return (mm / MM_PER_INCH) * POINTS_PER_INCH;
	}

	private pointsToMillimeters(points: number): number {
		return (points / POINTS_PER_INCH) * MM_PER_INCH;
	}
}
