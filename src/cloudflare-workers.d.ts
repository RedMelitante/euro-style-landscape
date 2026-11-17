// The Workers runtime env (bindings, vars and secrets set in Cloudflare), read by /api/lead for
// TURNSTILE_SECRET_KEY. The Cloudflare adapter provides the module at runtime; this only types it.
declare module 'cloudflare:workers' {
  export const env: Record<string, unknown>;
}
