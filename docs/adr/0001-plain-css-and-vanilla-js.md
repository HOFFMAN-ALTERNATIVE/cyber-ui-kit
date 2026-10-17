# 0001. Plain CSS and a vanilla ES module, no framework

Status: accepted
Date: 2026-10-17

## Context
The components are mostly visual (glitch, scanlines, panels) with small behaviours
(typing, countdown, CRT animation). Target users build with static HTML, React, Vue or
Svelte. Shipping a package per framework multiplies maintenance for a kit of this size.

## Options
1. React components (plus ports for other frameworks): typed props and native
   lifecycle, but one codebase per framework and a runtime dependency.
2. Web Components: framework-neutral, but shadow DOM blocks global theming and SSR is
   awkward.
3. One CSS file plus an ES module that only manipulates classes, attributes and text.

## Decision
Option 3. It works everywhere with one implementation and keeps the JavaScript around
2 kB gzip.

## Consequences
- Theming is plain CSS custom properties on `:root` or any ancestor.
- Framework users wire `stop()` into their unmount hook by hand.
- No type checking for callers until `.d.ts` files are added.
- Revisit if most usage turns out to be from a single framework.
