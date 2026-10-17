# 0003. Stateless JWT sessions and a fail-fast secret check

Status: Accepted

## Context

The app needs login without an external identity provider, and must run on a
single VPS as well as on serverless hosting. An early version silently replaced
a missing `JWT_SECRET` with a hard-coded string. Anyone who knew that string
could mint a token for any user on a deployment where the variable had been
forgotten. That is the failure mode this decision exists to remove.

## Decision

- Sessions are HS256 JWTs (`jose`) carrying only `sub`, stored in an
  `httpOnly`, `SameSite=Lax` cookie with a 30-day lifetime. Passwords are hashed
  with bcrypt.
- `src/server/env.ts` is the single place that reads the secret. In production
  it throws when the secret is missing, shorter than 24 characters, or still the
  template value (`change-me`). Outside production a clearly named dev
  fallback is allowed.
- `src/instrumentation.ts` runs that check when the server starts, so a
  misconfigured deploy crashes immediately and visibly instead of failing on the
  first authenticated request. `docker/entrypoint.sh` repeats the check for the
  container.
- `middleware.ts` resolves the key outside its `try` block: a configuration
  error must not be indistinguishable from an expired token and quietly
  redirect everyone to the login page.
- The `Secure` cookie flag follows the request scheme, or the explicit
  `COOKIE_SECURE` override. It is deliberately not tied to `NODE_ENV`: that
  would break login on a plain-http `docker compose` install, and behind a
  TLS-terminating proxy the app only sees http anyway.

## Consequences

- No session table, no extra read per request beyond loading the user.
- A token cannot be revoked before it expires. Rotating `JWT_SECRET` logs
  everyone out; per-user revocation would need a token version column.
- Edge middleware only verifies the signature. Authorisation decisions that
  matter are re-checked against the database in `getSessionUser`.
