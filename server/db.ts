import { and, asc, eq } from "drizzle-orm";
import { isInstallationKey } from "../shared/installationKey";
import { drizzle } from "drizzle-orm/mysql2";
import { genericPreferences, genericTasks, type GenericPreferences, type GenericTask } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try { _db = drizzle(process.env.DATABASE_URL); } catch { _db = null; }
  }
  return _db;
}

export function assertInstallationKey(value: string) {
  if (!isInstallationKey(value)) throw new Error("Invalid installation key");
  return value;
}

export const MACHINE_CATALOG = [
  "ronda_inicio", "prioridades", "material_generico", "pausa_segura",
  "comprobacion_apoyo", "bloque_profundo", "cierre_turno", "relevo_generico",
  "recuperacion", "revision_limites", "orden_entorno", "fin_bloque",
] as const;
export type TemplateKey = (typeof MACHINE_CATALOG)[number];
export function assertTemplateKey(value: string): TemplateKey {
  if (!MACHINE_CATALOG.includes(value as TemplateKey)) throw new Error("Invalid generic template");
  return value as TemplateKey;
}

export async function listGenericTasks(installationKey: string): Promise<GenericTask[]> {
  const db = await getDb();
  if (!db) return [];
  const safeKey = assertInstallationKey(installationKey);
  return db.select().from(genericTasks).where(eq(genericTasks.installationKey, safeKey)).orderBy(asc(genericTasks.sortOrder), asc(genericTasks.id));
}

export async function createGenericTask(input: { installationKey: string; templateKey: string; sortOrder: number }) {
  const db = await getDb();
  if (!db) return null;
  const installationKey = assertInstallationKey(input.installationKey);
  const templateKey = assertTemplateKey(input.templateKey);
  await db.insert(genericTasks).values({ installationKey, templateKey, sortOrder: input.sortOrder, status: "todo" });
  const rows = await db.select().from(genericTasks).where(and(eq(genericTasks.installationKey, installationKey), eq(genericTasks.templateKey, templateKey))).orderBy(asc(genericTasks.id)).limit(1);
  return rows[0] ?? null;
}

export async function setGenericTaskStatus(input: { installationKey: string; id: number; status: "todo" | "done" }) {
  const db = await getDb();
  if (!db) return null;
  const installationKey = assertInstallationKey(input.installationKey);
  await db.update(genericTasks).set({ status: input.status, updatedAt: new Date() }).where(and(eq(genericTasks.installationKey, installationKey), eq(genericTasks.id, input.id)));
  const rows = await db.select().from(genericTasks).where(and(eq(genericTasks.installationKey, installationKey), eq(genericTasks.id, input.id))).limit(1);
  return rows[0] ?? null;
}

export async function seedGenericTasks(installationKey: string) {
  const db = await getDb();
  if (!db) return { seeded: 0, available: false };
  const safeKey = assertInstallationKey(installationKey);
  const existing = await listGenericTasks(safeKey);
  if (existing.length > 0) return { seeded: 0, available: true };
  const initial = ["ronda_inicio", "material_generico", "cierre_turno"] as const;
  await db.insert(genericTasks).values(initial.map((templateKey, index) => ({ installationKey: safeKey, templateKey, sortOrder: index, status: "todo" as const })));
  return { seeded: initial.length, available: true };
}

export async function clearGenericTasks(installationKey: string) {
  const db = await getDb();
  if (!db) return { cleared: 0 };
  const safeKey = assertInstallationKey(installationKey);
  const existing = await listGenericTasks(safeKey);
  if (existing.length) await db.delete(genericTasks).where(eq(genericTasks.installationKey, safeKey));
  return { cleared: existing.length };
}

const MACHINE_BATCHES = {
  inicio: ["ronda_inicio", "prioridades", "material_generico", "pausa_segura"],
  flujo: ["comprobacion_apoyo", "bloque_profundo", "orden_entorno", "revision_limites"],
  cierre: ["cierre_turno", "relevo_generico", "recuperacion", "fin_bloque"],
} as const satisfies Record<string, readonly TemplateKey[]>;
export type MachineBatch = keyof typeof MACHINE_BATCHES;

export async function getMachineCapacity(installationKey: string) {
  const tasks = await listGenericTasks(installationKey);
  const completed = tasks.filter(task => task.status === "done").length;
  const capacity = 48;
  return { capacity, used: tasks.length, remaining: Math.max(0, capacity - tasks.length), pending: tasks.length - completed, completed, catalogSize: MACHINE_CATALOG.length };
}

export async function runMachineBatch(input: { installationKey: string; batch: MachineBatch }) {
  const db = await getDb();
  if (!db) return { inserted: 0, available: false, capacity: await getMachineCapacity(input.installationKey) };
  const installationKey = assertInstallationKey(input.installationKey);
  const templates = MACHINE_BATCHES[input.batch];
  const capacity = await getMachineCapacity(installationKey);
  if (capacity.remaining < templates.length) throw new Error("Machine capacity reached");
  await db.insert(genericTasks).values(templates.map((templateKey, index) => ({ installationKey, templateKey, sortOrder: capacity.used + index, status: "todo" as const })));
  return { inserted: templates.length, available: true, capacity: await getMachineCapacity(installationKey) };
}

export async function getGenericPreferences(installationKey: string): Promise<GenericPreferences | null> {
  const db = await getDb();
  if (!db) return null;
  const rows = await db.select().from(genericPreferences).where(eq(genericPreferences.installationKey, assertInstallationKey(installationKey))).limit(1);
  return rows[0] ?? null;
}

export async function saveGenericPreferences(input: { installationKey: string; reducedMotion: boolean; privacyLock: boolean }) {
  const db = await getDb();
  if (!db) return null;
  const installationKey = assertInstallationKey(input.installationKey);
  await db.insert(genericPreferences).values({ installationKey, reducedMotion: input.reducedMotion, privacyLock: input.privacyLock }).onDuplicateKeyUpdate({ set: { reducedMotion: input.reducedMotion, privacyLock: input.privacyLock, updatedAt: new Date() } });
  return getGenericPreferences(installationKey);
}
