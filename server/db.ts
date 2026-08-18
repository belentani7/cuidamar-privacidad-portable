import { and, asc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { genericPreferences, genericTasks, type GenericPreferences, type GenericTask } from "../drizzle/schema";

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

const installationKeyPattern = /^[a-f0-9-]{16,64}$/i;
export function assertInstallationKey(value: string) {
  if (!installationKeyPattern.test(value)) throw new Error("Invalid installation key");
  return value;
}

const templateKeys = ["ronda_inicio", "confort_material", "cierre_turno"] as const;
export type TemplateKey = (typeof templateKeys)[number];
export function assertTemplateKey(value: string): TemplateKey {
  if (!templateKeys.includes(value as TemplateKey)) throw new Error("Invalid generic template");
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
  const safeKey = assertInstallationKey(input.installationKey);
  const safeTemplate = assertTemplateKey(input.templateKey);
  await db.insert(genericTasks).values({ installationKey: safeKey, templateKey: safeTemplate, sortOrder: input.sortOrder, status: "todo" });
  const rows = await db.select().from(genericTasks).where(and(eq(genericTasks.installationKey, safeKey), eq(genericTasks.templateKey, safeTemplate))).orderBy(asc(genericTasks.id)).limit(1);
  return rows[0] ?? null;
}

export async function setGenericTaskStatus(input: { installationKey: string; id: number; status: "todo" | "done" }) {
  const db = await getDb();
  if (!db) return null;
  const safeKey = assertInstallationKey(input.installationKey);
  await db.update(genericTasks).set({ status: input.status, updatedAt: new Date() }).where(and(eq(genericTasks.installationKey, safeKey), eq(genericTasks.id, input.id)));
  const rows = await db.select().from(genericTasks).where(and(eq(genericTasks.installationKey, safeKey), eq(genericTasks.id, input.id))).limit(1);
  return rows[0] ?? null;
}

export async function seedGenericTasks(installationKey: string) {
  const db = await getDb();
  if (!db) return { seeded: 0, available: false };
  const safeKey = assertInstallationKey(installationKey);
  const existing = await listGenericTasks(safeKey);
  if (existing.length > 0) return { seeded: 0, available: true };
  await db.insert(genericTasks).values(templateKeys.map((templateKey, index) => ({ installationKey: safeKey, templateKey, sortOrder: index, status: "todo" as const })));
  return { seeded: templateKeys.length, available: true };
}

export async function clearGenericTasks(installationKey: string) {
  const db = await getDb();
  if (!db) return { cleared: 0 };
  const safeKey = assertInstallationKey(installationKey);
  const existing = await listGenericTasks(safeKey);
  if (existing.length > 0) await db.delete(genericTasks).where(eq(genericTasks.installationKey, safeKey));
  return { cleared: existing.length };
}

export async function getGenericPreferences(installationKey: string): Promise<GenericPreferences | null> {
  const db = await getDb();
  if (!db) return null;
  const safeKey = assertInstallationKey(installationKey);
  const rows = await db.select().from(genericPreferences).where(eq(genericPreferences.installationKey, safeKey)).limit(1);
  return rows[0] ?? null;
}

export async function saveGenericPreferences(input: { installationKey: string; reducedMotion: boolean; privacyLock: boolean }) {
  const db = await getDb();
  if (!db) return null;
  const safeKey = assertInstallationKey(input.installationKey);
  await db.insert(genericPreferences).values({ installationKey: safeKey, reducedMotion: input.reducedMotion, privacyLock: input.privacyLock }).onDuplicateKeyUpdate({ set: { reducedMotion: input.reducedMotion, privacyLock: input.privacyLock, updatedAt: new Date() } });
  return getGenericPreferences(safeKey);
}
