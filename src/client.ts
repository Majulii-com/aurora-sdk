import type { AxiosInstance } from "axios";
import { AuroraSdkError } from "./errors.ts";
import {
	createAuroraHttpClient,
	type AuroraHttpAuthHeader,
	DEFAULT_MAX_RETRIES,
	DEFAULT_TIMEOUT_MS,
} from "./http.ts";
import type { GenerateRequest, GenerateResponse, UsageResponse } from "./types.ts";

/** Default hosted Worker origin when `baseUrl` is omitted. */
export const AURORA_SDK_DEFAULT_BASE_URL = "https://aurora-sdk-backend.tech-826.workers.dev";

function normalizeBaseUrl(url: string): string {
	return url.replace(/\/$/, "");
}

export type AuroraClientOptions = {
	/** Organization SDK API key (from admin / seed). */
	apiKey: string;
	/**
	 * Backend origin (no trailing slash). For local dev: `http://127.0.0.1:8787` after `wrangler dev`.
	 * Defaults to {@link AURORA_SDK_DEFAULT_BASE_URL}.
	 */
	baseUrl?: string;
	/**
	 * Max retries for transient failures (network, timeout, 429, 5xx).
	 * Default {@link DEFAULT_MAX_RETRIES}.
	 */
	maxRetries?: number;
	/**
	 * Per-request timeout in ms (LLM calls can be slow).
	 * Default {@link DEFAULT_TIMEOUT_MS}.
	 */
	timeoutMs?: number;
	/**
	 * Inject a pre-built axios instance (e.g. tests). When set, `maxRetries` / `timeoutMs` are ignored.
	 */
	axiosInstance?: AxiosInstance;
	/**
	 * API key header name. Use **`X-Majulii-Api-Key`** when `baseUrl` points at **majulii-sdk-backend** (Nest).
	 * Default **`X-Aurora-Api-Key`** for the hosted Cloudflare Worker.
	 */
	authHeader?: AuroraHttpAuthHeader;
};

export { DEFAULT_MAX_RETRIES, DEFAULT_TIMEOUT_MS };

/**
 * Typed client for the Aurora SDK **backend** (Cloudflare Worker).
 * Uses **axios** with exponential backoff retries on transient errors.
 */
export class AuroraClient {
	private readonly http: AxiosInstance;

	constructor(opts: AuroraClientOptions) {
		const baseURL = normalizeBaseUrl(opts.baseUrl ?? AURORA_SDK_DEFAULT_BASE_URL);
		this.http =
			opts.axiosInstance ??
			createAuroraHttpClient(baseURL, opts.apiKey, {
				maxRetries: opts.maxRetries,
				timeoutMs: opts.timeoutMs,
				authHeader: opts.authHeader,
			});
	}

	async generate(req: GenerateRequest): Promise<GenerateResponse> {
		try {
			const res = await this.http.post<GenerateResponse>("/v1/generate", req);
			return res.data;
		} catch (e) {
			throw AuroraSdkError.fromAxiosError(e);
		}
	}

	async usage(): Promise<UsageResponse> {
		try {
			const res = await this.http.get<UsageResponse>("/v1/usage", { timeout: 30_000 });
			return res.data;
		} catch (e) {
			throw AuroraSdkError.fromAxiosError(e);
		}
	}

	async health(): Promise<{ status: string; service: string }> {
		try {
			const res = await this.http.get<{ status: string; service: string }>("/health", {
				timeout: 15_000,
			});
			return res.data;
		} catch (e) {
			throw AuroraSdkError.fromAxiosError(e);
		}
	}
}

export function createAuroraClient(opts: AuroraClientOptions): AuroraClient {
	return new AuroraClient(opts);
}
