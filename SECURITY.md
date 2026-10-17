# Security policy

## Reporting a vulnerability

Please do not open a public issue for security problems. Use GitHub's private
reporting instead: **Security -> Report a vulnerability** on
<https://github.com/Venius24/duoduo>.

Include what you found, steps to reproduce, and the impact you see. You can
expect an acknowledgement within a few days; this is a hobby-scale project
maintained by one person, so there is no formal SLA.

## Scope and known trade-offs

Already documented, so no need to report them as new:

- Rate-limit counters are per process
  ([ADR 0005](docs/adr/0005-in-memory-rate-limiter.md)).
- Sessions are stateless JWTs and cannot be revoked individually
  ([ADR 0003](docs/adr/0003-stateless-jwt-and-fail-fast-secret.md)).
- Lesson results are reported by the client and not verified server-side.

## For operators

- Set a random `JWT_SECRET` of at least 24 characters (`npm run gen:secret`).
  The app will not start in production otherwise.
- Set `COOKIE_SECURE=1` when TLS is terminated by a proxy.
- Make your proxy overwrite `X-Forwarded-For`; the rate limiter trusts it.
- If you enable AI explanations, learner answers are sent to the configured
  provider.
