import { z } from "zod";
import { publicProcedure, router } from "./_core/trpc";
import { clearGenericTasks, createGenericTask, getDb, getGenericPreferences, getMachineCapacity, listGenericTasks, MACHINE_CATALOG, runMachineBatch, saveGenericPreferences, seedGenericTasks, setGenericTaskStatus } from "./db";

const installationKey = z.string().regex(/^[a-f0-9-]{16,64}$/i);
const templateKey = z.enum(["ronda_inicio", "prioridades", "material_generico", "pausa_segura", "comprobacion_apoyo", "bloque_profundo", "cierre_turno", "relevo_generico", "recuperacion", "revision_limites", "orden_entorno", "fin_bloque"]);

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
  machine: router({
    catalog: publicProcedure.query(() => MACHINE_CATALOG),
    capacity: publicProcedure.input(z.object({ installationKey })).query(({ input }) => getMachineCapacity(input.installationKey)),
    runBatch: publicProcedure.input(z.object({ installationKey, batch: z.enum(["inicio", "flujo", "cierre"]) })).mutation(({ input }) => runMachineBatch(input)),
  }),
});

export type AppRouter = typeof appRouter;
