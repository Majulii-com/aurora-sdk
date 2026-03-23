import { AuroraSdkError } from "./errors.ts";
import type { GenerateRequest, GenerateResponse, UsageResponse } from "./types.ts";

/** Production Worker — consuming apps usually omit `baseUrl` and only pass `apiKey`. */
export const AURORA_SDK_DEFAULT_BASE_URL = "https://aurora-sdk-backend.tech-826.workers.dev";

export type AuroraClientOptions = {
	/**
	 * Override Worker origin (local wrangler, staging, or custom domain).
	 * If omitted, uses {@link AURORA_SDK_DEFAULT_BASE_URL}.
	 */
	baseUrl?: string;
	/** Organization SDK API key (from admin / seed). */
	apiKey: string;
	/** Optional override for fetch (testing). */
	fetch?: typeof fetch;
};

function normalizeBaseUrl(url: string): string {
	return url.replace(/\/$/, "");
}

function resolveBaseUrl(explicit?: string): string {
	if (explicit?.trim()) {
		return normalizeBaseUrl(explicit.trim());
	}
	return normalizeBaseUrl(AURORA_SDK_DEFAULT_BASE_URL);
}

/**
 * Typed client for the Aurora SDK **backend** (Cloudflare Worker).
 * Use this from your **server** (Node, Edge, etc.) so both the org API key and LLM API key stay off public clients.
 */
export class AuroraClient {
	private readonly baseUrl: string;
	private readonly apiKey: string;
	private readonly fetchFn: typeof fetch;

	constructor(opts: AuroraClientOptions) {
		this.baseUrl = resolveBaseUrl(opts.baseUrl);
		this.apiKey = opts.apiKey;
		this.fetchFn = opts.fetch ?? globalThis.fetch.bind(globalThis);
	}

	private headers(): HeadersInit {
		return {
			"Content-Type": "application/json",
			"X-Aurora-Api-Key": this.apiKey,
		};
	}

	async generate(req: GenerateRequest): Promise<GenerateResponse> {
		const res = await this.fetchFn(`${this.baseUrl}/v1/generate`, {
			method: "POST",
			headers: this.headers(),
			body: JSON.stringify(req),
		});
		if (!res.ok) throw await AuroraSdkError.fromResponse(res);
		return (await res.json()) as GenerateResponse;
	}

	async usage(): Promise<UsageResponse> {
		const res = await this.fetchFn(`${this.baseUrl}/v1/usage`, {
			method: "GET",
			headers: this.headers(),
		});
		if (!res.ok) throw await AuroraSdkError.fromResponse(res);
		return (await res.json()) as UsageResponse;
	}

	async health(): Promise<{ status: string; service: string }> {
		const res = await this.fetchFn(`${this.baseUrl}/health`, { method: "GET" });
		if (!res.ok) throw await AuroraSdkError.fromResponse(res);
		return (await res.json()) as { status: string; service: string };
	}
}

export function createAuroraClient(opts: AuroraClientOptions): AuroraClient {
	return new AuroraClient(opts);
}
