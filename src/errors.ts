export class AuroraSdkError extends Error {
	constructor(
		message: string,
		readonly status: number,
		readonly body: unknown,
	) {
		super(message);
		this.name = "AuroraSdkError";
	}

	static async fromResponse(res: Response): Promise<AuroraSdkError> {
		let body: unknown;
		const text = await res.text();
		try {
			body = text ? JSON.parse(text) : null;
		} catch {
			body = text;
		}
		const msg =
			typeof body === "object" && body !== null && "error" in body
				? String((body as { error: unknown }).error)
				: res.statusText;
		return new AuroraSdkError(msg || `HTTP ${res.status}`, res.status, body);
	}
}
