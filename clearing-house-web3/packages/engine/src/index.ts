// Pure settlement engine: no network, no file access.
// Modules land here story by story: netting (S-015), coverage (S-016), nav (S-041).
export const ENGINE_VERSION = "0.1.0";

export * from "./types.ts";
export * from "./netting.ts";
export * from "./coverage.ts";
export * from "./lot-hash.ts";
