import { describe, expect, it } from "vitest";
import { appRouter } from "./routers";
import type { TrpcContext } from "./_core/context";

function createContext(): TrpcContext {
  return {
    user: null,
    req: {} as TrpcContext["req"],
    res: {} as TrpcContext["res"],
  };
}

describe("genericTasks portable contract", () => {
  it("rejects an installation key that could carry arbitrary personal data", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.genericTasks.list({ installationKey: "invalid-installation-key" })).rejects.toThrow();
  });

  it("rejects templates outside the fixed generic allowlist", async () => {
    const caller = appRouter.createCaller(createContext());
    await expect(caller.genericTasks.create({
      installationKey: "00000000-0000-0000-0000-000000000001",
      templateKey: "patient_note" as never,
      sortOrder: 0,
    })).rejects.toThrow();
  });

  it("accepts only the three synthetic templates", async () => {
    const caller = appRouter.createCaller(createContext());
    const result = await caller.genericTasks.status();
    expect(result.mode).toBe("generic-only");
    expect(result).toHaveProperty("available");
  });
});
