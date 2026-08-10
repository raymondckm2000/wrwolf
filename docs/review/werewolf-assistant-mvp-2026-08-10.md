# Moonlog Werewolf Assistant MVP — implementation review

Date: 2026-08-10
Branch: `codex/build-werewolf-assistant-mvp`

## Architecture

The application is a client-only React 18 and TypeScript Vite PWA. The rebuild deliberately removes the previous host/dealer architecture.

- `src/game/types.ts` defines setup, roles, phases, structured events, player projections, and analysis results.
- `src/game/engine.ts` owns game creation, event append/remove/Undo, phase transitions, vote correction, player derivation, and event formatting.
- `src/game/analysis.ts` is a pure deterministic rule engine. It has no network or AI dependency.
- `src/game/persistence.ts` owns the versioned localStorage boundary.
- `src/ui/` contains the setup wizard, game grid, bottom-sheet actions, voting mode, Timeline, Analysis, and app shell.

The event log is the source of truth. Player cards, live vote totals, Timeline, and Analysis are derived from the same structured events, preventing parallel state from drifting.

## Data model

`GameState` contains immutable setup, current phase/round, and an ordered event list. Every gameplay event carries an ID, sequence, timestamp, phase, and round.

The model preserves certainty boundaries:

- Public facts: elimination events and public phase state.
- Claims: role claims and public investigation results remain explicitly typed as claims.
- Private knowledge: the user's actual role, wolf teammates, and private Seer checks are stored separately and labeled private in analysis.
- Confirmed facts: `CONFIRM_ROLE` is an explicit user action and is never inferred from a role claim.

Vote correction appends a replacement vote. Current totals select the latest vote per voter in the current phase, while Timeline retains the correction history.

## Rule engine

The engine emits LOW, MEDIUM, or HIGH concern only; it never emits probabilities or determines a player's hidden role.

- Unique-role conflict: multiple distinct claimants for one configured special/wolf slot each receive medium concern. The engine does not choose a liar.
- Confirmed contradiction: a public GOOD/WOLF check contradicted by a later confirmed alignment adds substantial concern to the claimant.
- Support of a confirmed wolf: adds concern, but never confirms the supporter as wolf.
- Vote against a confirmed wolf: slightly reduces concern and is explicitly not proof of innocence.
- Repeated voting alignment: two players voting for the same target in at least two phases produces relationship evidence.
- Private information: the user's Seer checks and configured wolf teammates appear in a separate private-knowledge section.

Every visible rule result carries event IDs. The reason sheet resolves those IDs back to formatted Timeline entries. Setup-derived private teammate facts are labeled as derived from private setup.

## UX decisions

- Designed and browser-tested at 390 × 844, within the requested 375–430px primary range.
- Ten large numbered player cards use three columns and remain in one scrollable game surface.
- Blue outline, text labels, icons, and color work together so state never depends on color alone.
- Player actions stay in a bottom sheet. Common records require player → action → option/target.
- Voting has a dedicated voter → target surface with immediate totals and replacement votes.
- Undo remains adjacent to Voting mode on the main screen; older corrections live in Timeline.
- The main screen contains no dense table and keeps private role information behind Settings.
- Gameplay renders no input, textarea, or editable element; setup and play were completed using clicks only.

## Tests performed

Automated checks:

- `npm run typecheck`: passed.
- `npm test`: passed, 6 tests covering a 10-player setup, phase transitions, Undo, vote replacement, role conflict, contradiction/support/vote evidence, event-linked reasons, and private Seer knowledge.
- `npm run build`: passed; Vite production bundle and PWA service worker generated successfully.

Browser validation at 390 × 844:

1. Completed the default 10-player setup entirely by tapping controls.
2. Selected P3 as the user and Seer as the private real role.
3. Confirmed all ten player cards, YOU outline, and dominant player numbers render.
4. Recorded P2 and P5 Seer claims and observed the deterministic conflict.
5. Opened the conflict reason and verified it cited events #1 and #2.
6. Reloaded the page, resumed the saved 10-player game, and retained both events.
7. Used Undo and verified the latest claim and conflict disappeared.
8. Recorded P4 → P6, then corrected it to P4 → P7; the live total showed only P7.
9. Recorded the user's P3 private Seer check of P6 GOOD and verified it appeared only as private knowledge.
10. Advanced Night 1 → Day 1 → Vote 1.
11. Eliminated P9 as Voted Out and verified P9 remained visible as OUT/grey.
12. Opened Timeline and verified phase grouping plus older-event remove controls.
13. Confirmed zero keyboard-capable gameplay fields, no Vite error overlay, and no browser console warnings/errors.

## Known limitations

- State is intentionally device/browser-local; clearing site data removes the current game.
- There is one active game slot and no import/export in MVP.
- Confirmed facts depend on an explicit manual action; the app does not infer confirmations from moderator announcements.
- Voting relationship evidence starts after two aligned phases, so early-game analysis remains intentionally sparse.
- UI copy is English-only in this MVP.

## Recommended Phase 2

- Add Traditional Chinese localization while preserving tap-only gameplay.
- Add multiple local game archives and a structured JSON export/import.
- Add role-specific private action shortcuts for Witch, Guard, Hunter, and Knight.
- Add configurable role uniqueness and custom role packs without free-text during play.
- Add an optional compact landscape/tablet layout and richer accessibility testing.
- Introduce a storage adapter interface before any optional backend or cross-device sync; keep the event and analysis core unchanged.
