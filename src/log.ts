import fs from "node:fs/promises";
import path from "node:path";

export async function logError(err: unknown): Promise<void> {
  await fs.appendFile(
    path.resolve(import.meta.dirname, "../error.log"),
    (err instanceof Error ? (err.stack ?? err.message) : String(err)) + "\n",
  );
}
