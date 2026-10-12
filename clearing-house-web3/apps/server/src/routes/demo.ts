import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type { FastifyInstance } from "fastify";

// The three demo emails (S-044, S-028). Provisional texts until Louis writes his.
const EMAILS_DIR = resolve(import.meta.dirname, "../../demo/emails");
export const DEMO_EMAILS = ["clear", "ambiguous", "trapped"] as const;

export function demoEmails(): Record<(typeof DEMO_EMAILS)[number], string> {
  return Object.fromEntries(DEMO_EMAILS.map((name) => [name, readFileSync(resolve(EMAILS_DIR, `${name}.txt`), "utf8")])) as Record<
    (typeof DEMO_EMAILS)[number],
    string
  >;
}

export function registerDemoRoutes(app: FastifyInstance) {
  app.get("/demo/emails", async () => demoEmails());
}
