/**
 * Re-exports the required methods and types from remote modules
 *
 * - Check for updates using `deno task update-deps`
 * - Always pin all imports to a specific version
 *
 *  @file deps.ts
 */

// cli
export { parse } from "https://deno.land/std@0.183.0/flags/mod.ts"
export type { Args } from "https://deno.land/std@0.183.0/flags/mod.ts"
export * as path from "https://deno.land/std@0.183.0/path/mod.ts"
// services
export { existsSync } from "https://deno.land/std@0.183.0/fs/mod.ts"
