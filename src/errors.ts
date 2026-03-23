import { isAxiosError, type AxiosError } from "axios";

export class AuroraSdkError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly body: unknown,
	) {
		super(message);
		this.name = "AuroraSdkError";
	}

	/** Map axios failures (HTTP or network) into a stable SDK error. */
	static fromAxiosError(err: unknown): AuroraSdkError {
		if (!isAxiosError(err)) {
			if (err instanceof Error) return new AuroraSdkError(err.message, 0, null);
			return new AuroraSdkError(String(err), 0, null);
		}

		const ax = err as AxiosError<unknown>;

		if (ax.response) {
			const { status, data } = ax.response;
			const msg =
				typeof data === "object" && data !== null && "error" in data
					? String((data as { error: unknown }).error)
					: ax.response.statusText || `HTTP ${status}`;
			return new AuroraSdkError(msg || `HTTP ${status}`, status, data);
		}

		const code = ax.code ? ` (${ax.code})` : "";
		return new AuroraSdkError(`${ax.message}${code}`, 0, { code: ax.code });
	}
}
