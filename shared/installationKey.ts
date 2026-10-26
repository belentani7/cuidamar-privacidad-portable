/**
 * Legacy installation keys may be hexadecimal without UUID separators.
 * Require at least 16 hexadecimal digits so a run of dashes is never a key.
 * This identifier is not authentication or authorization.
 */
export function isInstallationKey(value: unknown): value is string {
  return typeof value === "string" &&
    /^[a-f0-9-]{16,64}$/i.test(value) &&
    (value.match(/[a-f0-9]/gi)?.length ?? 0) >= 16;
}
