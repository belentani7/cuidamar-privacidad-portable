/** A random identifier for synthetic templates, never a login or access-control token. */
import { isInstallationKey } from "../../../shared/installationKey.ts";
type KeyStorage = Pick<Storage, "getItem" | "setItem">;
const STORAGE_KEY = "cuidamar.installationKey";
const UUID_V4_PATTERN = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;

/** Dependency injection makes blocked browser storage testable without a DOM. */
export function createInstallationKeyProvider(
  readStorage: () => KeyStorage | null,
  generateUuid: () => string,
): () => string {
  let sessionKey: string | undefined;
  return () => {
    if (sessionKey) return sessionKey;

    let storage: KeyStorage | null = null;
    try {
      storage = readStorage();
      const stored = storage?.getItem(STORAGE_KEY);
      // Preserve identifiers issued by older versions instead of losing saved templates.
      if (isInstallationKey(stored)) {
        sessionKey = stored;
        return stored;
      }
    } catch {
      // Storage may be disabled by browser privacy settings; continue in memory.
      storage = null;
    }

    const generated = generateUuid();
    if (!UUID_V4_PATTERN.test(generated)) {
      throw new Error("A secure random UUID is required for a local installation");
    }
    sessionKey = generated;
    try {
      storage?.setItem(STORAGE_KEY, generated);
    } catch {
      // In-memory session remains usable when persistence is denied or full.
    }
    return generated;
  };
}

export const getOrCreateInstallationKey = createInstallationKeyProvider(
  () => (typeof window === "undefined" ? null : window.localStorage),
  () => globalThis.crypto.randomUUID(),
);
