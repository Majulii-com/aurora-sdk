import axios, { type AxiosInstance, isCancel } from "axios";
import axiosRetry from "axios-retry";

export const DEFAULT_TIMEOUT_MS = 120_000;
export const DEFAULT_MAX_RETRIES = 4;

function isTransientStatus(status: number | undefined): boolean {
	if (status == null) return false;
	if (status === 408 || status === 425 || status === 429) return true;
	return status >= 500 && status <= 504;
}

export type AuroraHttpAuthHeader = "X-Aurora-Api-Key" | "X-Majulii-Api-Key";

/**
 * Shared axios instance: JSON, auth header, timeouts, exponential backoff retries.
 */
export function createAuroraHttpClient(
	baseURL: string,
	apiKey: string,
	opts?: {
		maxRetries?: number;
		timeoutMs?: number;
		/** Default `X-Aurora-Api-Key` (Cloudflare Worker). Use `X-Majulii-Api-Key` for `majulii-sdk-backend`. */
		authHeader?: AuroraHttpAuthHeader;
	},
): AxiosInstance {
	const timeout = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const maxRetries = opts?.maxRetries ?? DEFAULT_MAX_RETRIES;
	const authHeader = opts?.authHeader ?? "X-Aurora-Api-Key";

	const client = axios.create({
		baseURL,
		timeout,
		headers: {
			"Content-Type": "application/json",
			[authHeader]: apiKey,
		},
	});

	axiosRetry(client, {
		retries: maxRetries,
		retryDelay: axiosRetry.exponentialDelay,
		retryCondition: (error) => {
			if (isCancel(error)) return false;
			// No response → network / timeout: always retry (within retries cap)
			if (axiosRetry.isNetworkError(error)) return true;
			const status = error.response?.status;
			return isTransientStatus(status);
		},
		shouldResetTimeout: true,
	});

	return client;
}
