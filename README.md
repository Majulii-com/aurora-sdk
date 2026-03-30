# `@majulii/aurora-sdk`

TypeScript client for the **Aurora / Majulii SDK backend**. Use it from **server-side** only so your **organization API key** and **LLM API key** stay secret.

- **Default backend:** hosted **Cloudflare Worker** (`AURORA_SDK_DEFAULT_BASE_URL`).
- **Also works with** **`majulii-sdk-backend`** (NestJS): set **`baseUrl`** to your gateway origin and **`authHeader: "X-Majulii-Api-Key"`** (same org API key value the gateway issued). The gateway must have **`DSL_KB_DIR`** pointing at **`aurora-ui/dsl-kb`** for `generate()`.

- **HTTP:** [axios](https://axios-http.com/) with [axios-retry](https://github.com/softonic/axios-retry) — exponential backoff on network errors, timeouts, **429**, and **5xx** (up to `maxRetries`, default **4**).
- **Timeouts:** default **120s** per request (LLM-heavy `generate`); shorter overrides for `usage` (30s) and `health` (15s).
- **Worker URL** is fixed (`AURORA_SDK_DEFAULT_BASE_URL`); pass **`apiKey`** and optional **`maxRetries` / `timeoutMs`**.
- **`generate()`** supports optional **`attachments`** (images: base64 + MIME or `https` URL; files: `name` + `text`) and **`memoryTokenBudget`** for long threads (see types).

Requires **Node 18+**.

## Install

```bash
npm install @majulii/aurora-sdk
```

## Usage

```ts
import { createAuroraClient } from "@majulii/aurora-sdk";

const sdk = createAuroraClient({
  apiKey: process.env.AURORA_SDK_API_KEY!,
  // optional tuning:
  // maxRetries: 6,
  // timeoutMs: 180_000,
});

const out = await sdk.generate({
  message: "Build a paginated table for my list API",
  threadId: sessionId,
  llm: {
    provider: "openai",
    apiKey: process.env.OPENAI_API_KEY!,
    model: "gpt-4o-mini",
  },
  context: {
    appData: { rows: [], page: 1 },
    hints: "Use GET /api/items?page=",
  },
});

// out.document — GenUIDocument for @majulii/aurora-ui
```

### Majulii API gateway (local or self-hosted)

```ts
const sdk = createAuroraClient({
  apiKey: process.env.MAJULII_SDK_API_KEY!,
  baseUrl: "http://127.0.0.1:3000",
  authHeader: "X-Majulii-Api-Key",
});
```

You can still send **`X-Aurora-Api-Key`** from raw HTTP; the gateway accepts it as an alias for the same key.

### API

| Method | Description |
|--------|-------------|
| `generate(req)` | `POST /v1/generate` |
| `usage()` | `GET /v1/usage` |
| `health()` | `GET /health` |

Failures throw **`AuroraSdkError`** (`status`, `body`). Network errors after retries use `status === 0`.

### Tests

Pass a custom **`axiosInstance`** (with your own adapter/mocks) via `createAuroraClient({ apiKey: "x", axiosInstance })`; `maxRetries` / `timeoutMs` are ignored in that case.

## Develop & publish

```bash
npm install
npm run build
npm publish --access public
```

Update `repository` / `homepage` in `package.json` if your Git remote differs from `github.com/majulii/aurora-sdk`.

## Related

- **Backend** (Worker, D1, R2) is a **separate private repo** — not on npm. Consumers only install this package.
