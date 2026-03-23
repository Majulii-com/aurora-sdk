import axios, { type AxiosInstance, isCancel } from "axios";
import axiosRetry from "axios-retry";

export const DEFAULT_TIMEOUT_MS = 120_000;
export const DEFAULT_MAX_RETRIES = 4;

function isTransientStatus(status: number | undefined): boolean {
	if (status == null) return false;
	if (status === 408 || status === 425 || status === 429) return true;
	return status >= 500 && status <= 504;
}

/**
 * Shared axios instance: JSON, auth header, timeouts, exponential backoff retries.
 */
export function createAuroraHttpClient(
	baseURL: string,
	apiKey: string,
	opts?: { maxRetries?: number; timeoutMs?: number },
): AxiosInstance {
	const timeout = opts?.timeoutMs ?? DEFAULT_TIMEOUT_MS;
	const maxRetries = opts?.maxRetries ?? DEFAULT_MAX_RETRIES;

	const client = axios.create({
		baseURL,
		timeout,
		headers: {
			"Content-Type": "application/json",
			"X-Aurora-Api-Key": apiKey,
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
