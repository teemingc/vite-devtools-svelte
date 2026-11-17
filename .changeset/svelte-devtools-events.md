---
'vite-devtools-svelte': minor
---

Track components, signals and effects through Svelte's devtools events (`svelte/internal/devtools`) instead of wrapping `svelte/internal/client`. The plugin adds its listener to the compiler's `experimental.devtools` option, so every client component imports it first. Requires a Svelte build with the devtools channel (not released yet).

`$state` changes are read when Svelte applies the batch that wrote them, instead of checking every 200 ms: several writes in one flush are one timeline entry, deep mutations of large values are no longer delayed by about 1 s, and an idle app does no work. The summary and timeline report `policy: 'per-flush'`.
