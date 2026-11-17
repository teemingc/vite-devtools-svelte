// Browser code the plugin serves from disk: the Svelte compiler imports the
// hooks by path (`experimental.devtools`), and the hooks import the runtime
// next to them. The build copies both next to the bundle, so the same
// relative URLs work from `src` and `dist`.
import { fileURLToPath } from 'node:url'

export { HOOKS_MODULE_ID, RUNTIME_MODULE_ID } from './ids.js'

// Variables, not literals: Vite's lib build would turn
// `new URL('./hooks.js', import.meta.url)` into an inlined asset.
const HOOKS_FILE_NAME = './hooks.js'
const RUNTIME_FILE_NAME = './client.js'

/**
 * Absolute path of `hooks.js`: subscribes the runtime to Svelte's devtools
 * events (`svelte/internal/devtools`).
 */
export const HOOKS_FILE: string = fileURLToPath(new URL(HOOKS_FILE_NAME, import.meta.url))

/** Absolute path of the runtime (`client.js`), installed once as `window.__SVELTE_DEVTOOLS__`. */
export const RUNTIME_FILE: string = fileURLToPath(new URL(RUNTIME_FILE_NAME, import.meta.url))
