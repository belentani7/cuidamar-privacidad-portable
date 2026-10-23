import assert from "node:assert/strict";
import test from "node:test";
import { createInstallationKeyProvider } from "../client/src/lib/installationKey.ts";

const UUID = "123e4567-e89b-42d3-a456-426614174000";
const OTHER_UUID = "123e4567-e89b-42d3-b456-426614174001";

function memoryStorage(value = null) {
  const data = new Map(value === null ? [] : [["cuidamar.installationKey", value]]);
  return {
    getItem(key) { return data.get(key) ?? null; },
    setItem(key, value) { data.set(key, value); },
    value() { return data.get("cuidamar.installationKey"); },
  };
}

test("reuses existing key without rotating saved template ownership", () => {
  const storage = memoryStorage(UUID);
  const getKey = createInstallationKeyProvider(() => storage, () => OTHER_UUID);
  assert.equal(getKey(), UUID);
  assert.equal(getKey(), UUID);
  assert.equal(storage.value(), UUID);
});

test("replaces malformed storage with a secure generated UUID", () => {
  const storage = memoryStorage("person@example.com");
  const getKey = createInstallationKeyProvider(() => storage, () => UUID);
  assert.equal(getKey(), UUID);
  assert.equal(storage.value(), UUID);
});

test("keeps a stable in-memory key when localStorage getter throws", () => {
  const getKey = createInstallationKeyProvider(() => { throw new Error("SecurityError"); }, () => UUID);
  assert.equal(getKey(), UUID);
  assert.equal(getKey(), UUID);
});

test("keeps a stable in-memory key when localStorage.getItem throws", () => {
  const getKey = createInstallationKeyProvider(() => ({
    getItem() { throw new Error("denied"); },
    setItem() { throw new Error("denied"); },
  }), () => UUID);
  assert.equal(getKey(), UUID);
  assert.equal(getKey(), UUID);
});

test("keeps the generated key when storage.setItem throws", () => {
  const getKey = createInstallationKeyProvider(() => ({
    getItem() { return null; },
    setItem() { throw new Error("QuotaExceededError"); },
  }), () => UUID);
  assert.equal(getKey(), UUID);
  assert.equal(getKey(), UUID);
});

test("does not accept insecure generated identifiers", () => {
  const getKey = createInstallationKeyProvider(() => null, () => "0000000000000000");
  assert.throws(() => getKey(), /secure random UUID/);
});

test("keeps the key in memory when no browser storage exists", () => {
  const getKey = createInstallationKeyProvider(() => null, () => UUID);
  assert.equal(getKey(), UUID);
  assert.equal(getKey(), UUID);
});
