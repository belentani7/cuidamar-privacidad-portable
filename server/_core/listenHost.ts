import { isIP } from "node:net";

/** A local-only demo must not listen on public interfaces by accident. */
export function resolveListenHost(configuredHost?: string, allowNetworkBind?: string): string {
  const host = configuredHost?.trim() || "127.0.0.1";
  if (host === "127.0.0.1" || host === "::1" || host === "localhost") return host;

  // Network exposure is deliberately a two-step opt-in, never inferred from NODE_ENV.
  if (allowNetworkBind === "true" && isIP(host) !== 0) return host;
  throw new Error(
    "Non-loopback HOST requires ALLOW_NETWORK_BIND=true and a valid IP address. " +
    "This demo has no authentication; do not expose it with sensitive data.",
  );
}
