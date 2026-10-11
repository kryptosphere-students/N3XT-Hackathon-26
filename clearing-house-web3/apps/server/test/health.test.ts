import { describe, expect, it } from "vitest";
import { testServer } from "./helpers.ts";

describe("GET /health", () => {
  it("answers ok with the engine version", async () => {
    const app = testServer();
    const res = await app.inject({ method: "GET", url: "/health" });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual({ ok: true, engine: "0.1.0" });
    await app.close();
  });
});
