import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { clearGenericTasks, createGenericTask, getDb, getGenericPreferences, listGenericTasks, saveGenericPreferences, seedGenericTasks, setGenericTaskStatus } from "./db";

const installationKey = z.string().regex(/^[a-f0-9-]{16,64}$/i);
const templateKey = z.enum(["ronda_inicio", "confort_material", "cierre_turno"]);

export const appRouter = router({
  genericTasks: router({
    status: publicProcedure.query(async () => ({ available: Boolean(await getDb()), mode: "generic-only" as const })),
    seed: publicProcedure.input(z.object({ installationKey })).mutation(({ input }) => seedGenericTasks(input.installationKey)),
    list: publicProcedure.input(z.object({ installationKey })).query(({ input }) => listGenericTasks(input.installationKey)),
    create: publicProcedure.input(z.object({ installationKey, templateKey, sortOrder: z.number().int().min(0).max(999) })).mutation(({ input }) => createGenericTask(input)),
    setStatus: publicProcedure.input(z.object({ installationKey, id: z.number().int().positive(), status: z.enum(["todo", "done"]) })).mutation(({ input }) => setGenericTaskStatus(input)),
    clear: publicProcedure.input(z.object({ installationKey })).mutation(({ input }) => clearGenericTasks(input.installationKey)),
  }),
  genericPreferences: router({
    get: publicProcedure.input(z.object({ installationKey })).query(({ input }) => getGenericPreferences(input.installationKey)),
    save: publicProcedure.input(z.object({ installationKey, reducedMotion: z.boolean(), privacyLock: z.boolean() })).mutation(({ input }) => saveGenericPreferences(input)),
  }),
});

export type AppRouter = typeof appRouter;
