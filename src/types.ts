export type LlmProvider = "openai" | "anthropic" | "google";

/** Credentials for the upstream LLM; sent to the SDK backend only (never embed in browser bundles). */
export type LlmCredentials = {
	provider: LlmProvider;
	apiKey: string;
	model?: string;
};

export type GenerateContext = {
	appData?: unknown;
	hints?: string;
};

export type GenerateRequest = {
	message: string;
	threadId?: string;
	llm: LlmCredentials;
	context?: GenerateContext;
};

export type GenerateResponse = {
	content: string;
	schema?: Record<string, unknown>;
	initialState?: Record<string, unknown>;
	document?: Record<string, unknown>;
	threadId: string;
};

export type UsageResponse = {
	orgId: string;
	total: number;
	byRoute: Record<string, number>;
};
