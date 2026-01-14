# Environment setup

## Environment list

| Environment | Trigger | Scope | Notes |
| --- | --- | --- | --- |
| Production | `main` branch | Public, end-user facing | Debug UI disabled, minimal logging |
| Preview | Any non-`main` branch | Testing, QA, debugging | Debug UI enabled, higher logging |
| Development (Local) | Local machine | `.env.local` only | Debug UI enabled |

## Required environment variables (Vercel)

Define these in **Vercel Dashboard → Project → Settings → Environment Variables**.

| Key | Production | Preview | Development |
| --- | --- | --- | --- |
| `APP_ENV` | `production` | `preview` | `development` |
| `NEXT_PUBLIC_APP_ENV` | `production` | `preview` | `development` |
| `NEXT_PUBLIC_DEBUG_ENABLED` | `false` | `true` | `true` |
| `NEXT_PUBLIC_API_BASE` | `prod API` | `preview API` | `local API` |

> **Warning:** Never expose secrets in `NEXT_PUBLIC_*` variables. These are bundled into the client. 

## Local environment file

Create a local-only file named `.env.local` (not committed):

```
APP_ENV=development
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_DEBUG_ENABLED=true
NEXT_PUBLIC_API_BASE=http://localhost:3000
```

## Environment detection (code rule)

Only use environment variables (no hostname parsing or `NODE_ENV` alone):

```ts
const isProd = process.env.NEXT_PUBLIC_APP_ENV === "production";
const isPreview = process.env.NEXT_PUBLIC_APP_ENV === "preview";
const isDev = process.env.NEXT_PUBLIC_APP_ENV === "development";
```

## Feature gating rules

- Debug pages/raw data/diagnostic UI: **enabled** in preview & development, **disabled** in production.
- Logging verbosity: **high** in preview/development, **minimal** in production.
- Experimental logic: **preview only** unless explicitly approved for production.

## Rules for adding new environment variables

1. Decide if the variable must be client-accessible. Only use `NEXT_PUBLIC_*` when the value is safe for public exposure.
2. Add the variable to Vercel for **Production**, **Preview**, and **Development** with appropriate values.
3. Document the variable in this file and update `.env.local` if it’s needed locally.
4. Never hard-code environment values in code.

## Verification checklist

- Environment variables exist in Vercel dashboard for all three environments.
- `.env.local` works locally and stays out of git.
- Preview and Production behavior differ as expected.
- Debug UI is inaccessible in production.
- No secrets are exposed client-side.
