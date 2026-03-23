# `@majulii/aurora-sdk`

Small **TypeScript client** for the Aurora SDK **backend** (hosted Cloudflare Worker). Use it from **server-side** code so your **organization API key** and **LLM API key** are never exposed in the browser.

- **Worker URL** is fixed in the package (`AURORA_SDK_DEFAULT_BASE_URL`); only `apiKey` (and optional `fetch` for tests) is passed to `createAuroraClient`.
- Requires **Node 18+** (or any runtime with global `fetch`).

## Install

```bash
npm install @majulii/aurora-sdk
```

## Usage

```ts
import { createAuroraClient } from "@majulii/aurora-sdk";

const sdk = createAuroraClient({
  apiKey: process.env.AURORA_SDK_API_KEY!,
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

### API

| Method | Description |
|--------|-------------|
| `generate(req)` | `POST /v1/generate` |
| `usage()` | `GET /v1/usage` |
| `health()` | `GET /health` |

Errors throw `AuroraSdkError` with `status` and `body`.

## Develop & publish

```bash
npm install
npm run build
npm publish --access public
```

Update `repository` / `homepage` in `package.json` if your Git remote differs from `github.com/majulii/aurora-sdk`.

## Related

- **Backend service** (Worker, D1, R2) is a **separate private repo** — not published on npm. Consumers only need this package.
