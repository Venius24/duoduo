# 0009. Revocable sessions through a per-user token version

Status: Accepted. Amends [0003](0003-stateless-jwt-and-fail-fast-secret.md).

## Context

ADR 0003 accepted that a 30-day JWT cannot be revoked: the only remedy was
rotating `JWT_SECRET`, which signs everyone out. A user who loses a device had no
way to end its session.

## Decision

Add `User.tokenVersion` (default `0`). Tokens carry it as the `v` claim.
`userFromToken` accepts a token only when `v` equals the row's current value;
tokens issued before the column existed have no `v` and count as `0`.
`POST /api/auth/logout-all` increments the column and clears the cookie, and
Settings exposes it as "Sign out on all devices".

The stateless design stays: there is still no session table, and the check costs
nothing extra because `getSessionUser` already loads the user row.

## Consequences

- Revocation is per user and immediate for API calls and data.
- Edge middleware still verifies only the signature (it cannot reach the
  database), so a revoked token can load a protected *page shell* until the first
  API call returns `401`. No data is exposed, and the client then redirects to
  the login page.
- Revoking a single device rather than all of them would need per-token ids and
  a table; that is deliberately out of scope.
