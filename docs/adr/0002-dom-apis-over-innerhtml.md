# 0002. Build DOM with node APIs, never innerHTML

Status: accepted
Date: 2026-10-17

## Context
The first version rendered nixie digits with `innerHTML`. The values were digits we
generated, so it was not exploitable, but the pattern is fragile: one future change that
interpolates `data-*` content turns a UI kit into an XSS sink on every site using it.
It also conflicts with Trusted Types policies that strict sites enable.

## Options
1. Keep `innerHTML` and escape every interpolated value.
2. Use `textContent`, `createElement` and `replaceChildren` only.

## Decision
Option 2. Escaping relies on every contributor remembering it; node APIs make
injection impossible by construction.

## Consequences
- The library works under `require-trusted-types-for 'script'` and a CSP without
  `unsafe-inline`.
- Slightly more verbose rendering code.
- `style.setProperty` (CSSOM) is still used for meter values; CSP allows it.
