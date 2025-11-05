import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import type { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { PDFDocument } from 'pdf-lib';

import {
	PdfService,
	PdfServiceError,
	type PdfResizeResult,
} from '../pdf-service';

const SOURCE_URL = 'https://cdn.example.com/sample.pdf';

function createHttpClientStub(
	responseFactory: (
		url: string,
		config?: AxiosRequestConfig,
	) => Promise<AxiosResponse<ArrayBuffer>>,
): AxiosInstance {
	return {
		get: (url: string, config?: AxiosRequestConfig) =>
			responseFactory(url, config),
	} as unknown as AxiosInstance;
}

async function createSamplePdfBuffer(
	width = 400,
	height = 600,
): Promise<Buffer> {
	const document = await PDFDocument.create();
	const page = document.addPage([width, height]);
	page.drawText('Sample PDF content');
	const bytes = await document.save();
	return Buffer.from(bytes);
}

function bufferToArrayBuffer(buffer: Buffer): ArrayBuffer {
	return buffer.buffer.slice(
		buffer.byteOffset,
		buffer.byteOffset + buffer.byteLength,
	);
}

function millimetersToPoints(mm: number): number {
	return (mm / 25.4) * 72;
}

describe('PdfService', () => {
	it('resizes a PDF to explicit dimensions', async () => {
		const originalBuffer = await createSamplePdfBuffer();

		const httpClient = createHttpClientStub(async () => ({
			data: bufferToArrayBuffer(originalBuffer),
			status: 200,
			statusText: 'OK',
			headers: { 'content-type': 'application/pdf' },
			config: {},
		}));

		const service = new PdfService({ httpClient });
		const result = (await service.resizeFromUrl({
			sourceUrl: SOURCE_URL,
			targetPageSize: { widthMm: 210, heightMm: 297 },
			dpi: 300,
		})) as PdfResizeResult;

		assert.equal(result.metadata.pageCount, 1);
		assert.equal(result.metadata.dpi, 300);
		assert.equal(result.metadata.originalSizeBytes, originalBuffer.length);
		assert.ok(
			Math.abs(result.metadata.finalPageSizeMm.widthMm - 210) < 0.05,
		);
		assert.ok(
			Math.abs(result.metadata.finalPageSizeMm.heightMm - 297) < 0.05,
		);

		const outputDocument = await PDFDocument.load(result.buffer);
		const page = outputDocument.getPage(0);
		assert.ok(
			Math.abs(page.getWidth() - millimetersToPoints(210)) < 0.5,
		);
		assert.ok(
			Math.abs(page.getHeight() - millimetersToPoints(297)) < 0.5,
		);
	});

	it('resizes a PDF by percentage', async () => {
		const originalWidth = 500;
		const originalHeight = 400;
		const originalBuffer = await createSamplePdfBuffer(
			originalWidth,
			originalHeight,
		);

		const httpClient = createHttpClientStub(async () => ({
			data: bufferToArrayBuffer(originalBuffer),
			status: 200,
			statusText: 'OK',
			headers: { 'content-type': 'application/pdf' },
			config: {},
		}));

		const service = new PdfService({ httpClient });
		const result = await service.resizeFromUrl({
			sourceUrl: SOURCE_URL,
			scale: 0.5,
		});

		assert.equal(result.metadata.pageCount, 1);
		assert.ok(result.buffer.byteLength > 0);
		assert.ok(
			Math.abs(result.metadata.finalPageSizePoints.width - 250) < 0.5,
		);
		assert.ok(
			Math.abs(result.metadata.finalPageSizePoints.height - 200) < 0.5,
		);
	});

	it('requires exactly one resize strategy', async () => {
		const service = new PdfService({
			httpClient: createHttpClientStub(async () => {
				throw new Error('should not download');
			}),
		});

		await assert.rejects(
			() =>
				service.resizeFromUrl({
					sourceUrl: SOURCE_URL,
					targetPageSize: { widthMm: 210, heightMm: 297 },
					scale: 0.5,
				}),
			(error: unknown) => {
				assert.ok(error instanceof PdfServiceError);
				assert.equal(error.stage, 'validate');
				assert.match(error.message, /either targetPageSize or scale/i);
				return true;
			},
		);
	});

	it('rejects non-PDF content sources', async () => {
		const httpClient = createHttpClientStub(async () => ({
			data: bufferToArrayBuffer(Buffer.from('not pdf')),
			status: 200,
			statusText: 'OK',
			headers: { 'content-type': 'text/plain' },
			config: {},
		}));

		const service = new PdfService({ httpClient });

		await assert.rejects(
			() =>
				service.resizeFromUrl({
					sourceUrl: SOURCE_URL,
					scale: 0.5,
				}),
			(error: unknown) => {
				assert.ok(error instanceof PdfServiceError);
				assert.equal(error.stage, 'validate');
				assert.match(
					error.message,
					/Expected application\/pdf content-type/i,
				);
				return true;
			},
		);
	});

	it('maps download failures to download stage', async () => {
		const httpClient = createHttpClientStub(async () => {
			throw new Error('network down');
		});

		const service = new PdfService({ httpClient });

		await assert.rejects(
			() =>
				service.resizeFromUrl({
					sourceUrl: SOURCE_URL,
					scale: 0.5,
				}),
			(error: unknown) => {
				assert.ok(error instanceof PdfServiceError);
				assert.equal(error.stage, 'download');
				assert.match(error.message, /Failed to download PDF/i);
				return true;
			},
		);
	});

	it('requires HTTPS source URLs', async () => {
		const service = new PdfService({
			httpClient: createHttpClientStub(async () => {
				throw new Error('should not reach');
			}),
		});

		await assert.rejects(
			() =>
				service.resizeFromUrl({
					sourceUrl: 'http://insecure.example.com/file.pdf',
					scale: 0.5,
				}),
			(error: unknown) => {
				assert.ok(error instanceof PdfServiceError);
				assert.equal(error.stage, 'validate');
				assert.match(error.message, /only supports HTTPS/i);
				return true;
			},
		);
	});
});
