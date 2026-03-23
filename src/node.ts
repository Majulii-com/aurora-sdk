import { readFile } from "node:fs/promises";
import { basename } from "node:path";

import type { FileAttachmentBinary } from "./types.ts";

const MIME_BY_EXT: Record<string, string> = {
	".pdf": "application/pdf",
	".txt": "text/plain",
	".md": "text/markdown",
	".json": "application/json",
	".csv": "text/csv",
	".xml": "application/xml",
	".html": "text/html",
	".htm": "text/html",
	".js": "application/javascript",
	".mjs": "application/javascript",
	".cjs": "application/javascript",
	".ts": "text/typescript",
	".tsx": "text/typescript",
	".jsx": "text/javascript",
	".ndjson": "application/x-ndjson",
};

export function guessMimeFromPath(filePath: string): string {
	const lower = filePath.toLowerCase();
	for (const [ext, mime] of Object.entries(MIME_BY_EXT)) {
		if (lower.endsWith(ext)) return mime;
	}
	return "application/octet-stream";
}

/** Read a local file and return a binary attachment the backend can extract text from. */
export async function readLocalFileAsBinaryAttachment(
	filePath: string,
	mimeOverride?: string,
): Promise<FileAttachmentBinary> {
	const buf = await readFile(filePath);
	return {
		type: "file",
		name: basename(filePath),
		mimeType: mimeOverride ?? guessMimeFromPath(filePath),
		base64: buf.toString("base64"),
	};
}
