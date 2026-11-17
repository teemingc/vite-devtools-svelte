import fs from 'node:fs'
import vm from 'node:vm'

import * as devtools from 'svelte/internal/devtools'
import { describe, it, expect } from 'vitest'

import {
  HOOKS_FILE,
  HOOKS_MODULE_ID,
  RUNTIME_FILE,
  RUNTIME_MODULE_ID,
} from '../src/runtime/index.js'

// Behaviour of the runtime and the hooks is covered by test/perf (the
// runtime in a fake browser) and test/reactivity (real Svelte components
// through the hooks). This file pins the module contract the plugin serves.

describe('module ids', () => {
  it.each([
    ['RUNTIME_MODULE_ID', RUNTIME_MODULE_ID, 'virtual:svelte-devtools-runtime'],
    ['HOOKS_MODULE_ID', HOOKS_MODULE_ID, 'virtual:svelte-devtools-hooks'],
  ])('%s', (_, actual, expected) => {
    expect(actual).toBe(expected)
  })
})

describe('runtime file', () => {
  it('is a self-contained script (no imports) that parses', () => {
    // `import.meta` is only valid in modules; the runtime uses nothing else.
    const script = fs.readFileSync(RUNTIME_FILE, 'utf8').replaceAll('import.meta.hot', 'undefined')
    expect(script).not.toMatch(/^\s*(import|export)\b/m)
    expect(() => new vm.Script(script)).not.toThrow()
  })
})

// The hooks are the only code that talks to Svelte: they must import the
// runtime first, then only what svelte/internal/devtools exports.
describe('hooks file', () => {
  const source = fs.readFileSync(HOOKS_FILE, 'utf8')
  const imports = [...source.matchAll(/^import\s+(?:\{([^}]*)\}\s+from\s+)?'([^']+)'/gm)]

  it('imports the runtime next to it (a real file), then svelte/internal/devtools, and nothing else', () => {
    // no virtual module: a dependency prebundle may carry the hooks
    expect(imports.map(m => m[2])).toEqual(['./client.js', 'svelte/internal/devtools'])
  })

  it('uses only names svelte/internal/devtools exports (as functions)', () => {
    const names = imports[1]![1]!
      .split(',')
      .map(name => name.trim())
      .filter(name => name !== '')
    expect(names.length).toBeGreaterThan(5)
    const exported = devtools as Record<string, unknown>
    expect(names.filter(name => typeof exported[name] !== 'function')).toEqual([])
  })

  it('exports nothing (a side-effect module the compiler imports)', () => {
    expect(source).not.toMatch(/^export\b/m)
  })
})
