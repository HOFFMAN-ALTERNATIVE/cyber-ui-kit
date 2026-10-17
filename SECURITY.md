# Security policy

## Reporting
Use GitHub "Report a vulnerability" on this repository to open a private advisory.
Please do not open public issues for security problems. First answer within 5 working days.

## Supported versions
Only `main` receives fixes.

## Threat model
- Asset: pages that embed the kit, and their visitors.
- Entry points: element text, `data-text`, `data-lines`, `data-seconds`, `data-value`
  and arguments passed to the exported functions.
- Risks and mitigations:
  - XSS: the library never assigns `innerHTML`; text is written with `textContent` or
    text nodes. `data-text` is rendered through CSS `attr()`, which cannot execute.
  - Invalid input: meter values are clamped to 0-100; countdown targets that are not
    finite throw a `TypeError`; a bad `data-seconds` falls back to 60.
  - Timer leaks: every timer-based function returns `stop()`, and `autoInit()` skips
    elements it already initialised.
  - Third-party requests: the demo self-hosts its fonts and ships a CSP
    (`default-src 'self'`, no inline scripts, `object-src 'none'`, `base-uri 'none'`).
- Supply chain: zero runtime dependencies. Dev dependencies are locked; CI runs
  `npm audit --audit-level=moderate` on every push.
