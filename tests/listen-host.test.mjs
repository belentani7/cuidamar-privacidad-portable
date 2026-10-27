import assert from "node:assert/strict";
import { createServer } from "node:net";
import { readFileSync } from "node:fs";
import test from "node:test";
import { resolveListenHost } from "../server/_core/listenHost.ts";

test("binds to IPv4 loopback by default, including when HOST is empty", () => {
  assert.equal(resolveListenHost(), "127.0.0.1");
  assert.equal(resolveListenHost("  "), "127.0.0.1");
});

test("allows explicit IPv4 and IPv6 loopback without a network opt-in", () => {
  assert.equal(resolveListenHost("127.0.0.1"), "127.0.0.1");
  assert.equal(resolveListenHost("::1"), "::1");
  assert.equal(resolveListenHost("localhost"), "localhost");
});

test("rejects wildcard, LAN and DNS binds without an explicit network opt-in", () => {
  for (const host of ["0.0.0.0", "::", "192.168.1.2", "example.com", "127.0.0.2"]) {
    assert.throws(() => resolveListenHost(host), /ALLOW_NETWORK_BIND=true/, host);
  }
});

test("allows an explicit network IP opt-in but not arbitrary hostnames", () => {
  assert.equal(resolveListenHost("0.0.0.0", "true"), "0.0.0.0");
  assert.equal(resolveListenHost("::", "true"), "::");
  assert.equal(resolveListenHost("192.168.1.2", "true"), "192.168.1.2");
  assert.throws(() => resolveListenHost("example.com", "true"), /valid IP address/);
  assert.throws(() => resolveListenHost("0.0.0.0", "TRUE"), /ALLOW_NETWORK_BIND=true/);
});

test("an actual TCP listener is restricted to loopback by default", async () => {
  const server = createServer();
  try {
    await new Promise((resolve, reject) => {
      server.once("error", reject);
      server.listen(0, resolveListenHost(), resolve);
    });
    assert.equal(server.address()?.address, "127.0.0.1");
  } finally {
    await new Promise(resolve => server.close(resolve));
  }
});

test("Express binds both port probing and HTTP listener to the resolved host", () => {
  const source = readFileSync(new URL("../server/_core/index.ts", import.meta.url), "utf8");
  assert.match(source, /server\.listen\(port, host,/);
  assert.match(source, /findAvailablePort\(preferredPort, host\)/);
});

test("Vite middleware does not bypass built-in allowed-host checks", () => {
  const source = readFileSync(new URL("../server/_core/vite.ts", import.meta.url), "utf8");
  assert.doesNotMatch(source, /allowedHosts\s*:\s*true/);
});
