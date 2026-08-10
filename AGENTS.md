# Werewolf Assistant repository guide

## Product rules

- Build a mobile-first, one-handed live-game assistant for 375–430px screens.
- Gameplay must never require typing or free-text notes. Use buttons, player numbers, toggles, and selectors only.
- Keep public information, claims, private user knowledge, and confirmed facts distinct.
- All analysis is deterministic and explainable. Do not add AI calls or probability-like output.
- Persist the current game locally after every action and keep Undo immediately available.

## Architecture

- Keep domain types in `src/game/types.ts`.
- Keep event reduction and derived game state in `src/game/engine.ts`.
- Keep deterministic analysis in `src/game/analysis.ts`.
- Keep browser persistence in `src/game/persistence.ts`.
- Keep React UI in `src/ui/` and avoid putting rule logic in components.

## Verification

- Run `npm run typecheck`, `npm test`, and `npm run build`.
- Exercise setup, a 10-player game, voting, Undo, persistence, role conflicts, and analysis reasons at a mobile viewport.
- Update the implementation review under `docs/review/` when behavior changes materially.
