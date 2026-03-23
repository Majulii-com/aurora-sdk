export type LlmProvider = "openai" | "anthropic" | "google";

/** Credentials for the upstream LLM; sent to the SDK backend only (never embed in browser bundles). */
export type LlmCredentials = {
	provider: LlmProvider;
	apiKey: string;
	model?: string;
};

/** Routes the host exposes; pass in `context.apiEndpoints` so the model wires `API_CALL` to real paths. */
export type ApiEndpointRef = {
	id?: string;
	method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
	path: string;
	description?: string;
};

export type GenerateContext = {
	appData?: unknown;
	hints?: string;
	apiEndpoints?: ApiEndpointRef[];
};

/** Image as raw base64 (no `data:` prefix) + MIME type. */
export type ImageAttachmentBase64 = {
	type: "image";
	mimeType: "image/png" | "image/jpeg" | "image/jpg" | "image/webp" | "image/gif" | string;
	base64: string;
	name?: string;
};

/** Public HTTPS image URL (passed through to the model). */
export type ImageAttachmentUrl = {
	type: "image";
	url: string;
	name?: string;
};

/** Plain-text file body (e.g. extracted text, CSV snippet, markdown). */
export type FileAttachmentText = {
	type: "file";
	name: string;
	mimeType?: string;
	text: string;
};

/**
 * Raw file bytes as base64 (no `data:` prefix). The backend extracts text for PDFs and common text MIME types.
 */
export type FileAttachmentBinary = {
	type: "file";
	name: string;
	mimeType: string;
	base64: string;
};

export type GenerateAttachment =
	| ImageAttachmentBase64
	| ImageAttachmentUrl
	| FileAttachmentText
	| FileAttachmentBinary;

export type GenerateRequest = {
	message: string;
	threadId?: string;
	llm: LlmCredentials;
	context?: GenerateContext;
	/** Optional images and text files sent to the multimodal model with `message`. */
	attachments?: GenerateAttachment[];
	/** Prior-turn token budget for LangChain memory trimming (default ~14000 on server). */
	memoryTokenBudget?: number;
};

export type DocumentValidation =
	| { validDsl: true; apiPathWarnings?: string[] }
	| { validDsl: false; zodIssues: string[] };

export type GenerateResponse = {
	content: string;
	schema?: Record<string, unknown>;
	initialState?: Record<string, unknown>;
	document?: Record<string, unknown>;
	/** Present when the model returned a `document` shape (even if stripped for invalid DSL). */
	documentValidation?: DocumentValidation;
	threadId: string;
};

export type UsageResponse = {
	orgId: string;
	total: number;
	byRoute: Record<string, number>;
};
