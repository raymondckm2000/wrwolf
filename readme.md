# Moonlog

Moonlog is a mobile-first, private Werewolf gameplay assistant. It records only structured taps, autosaves each action, and derives deterministic analysis with event-linked reasons. It has no backend, accounts, free-text gameplay input, or AI dependency.

## Local development

```sh
npm install
npm run dev
```

## Verification

```sh
npm run typecheck
npm test
npm run build
```

See [the MVP implementation review](docs/review/werewolf-assistant-mvp-2026-08-10.md) for architecture, rule behavior, UX choices, and validation coverage.
