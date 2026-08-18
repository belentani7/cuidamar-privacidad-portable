export const ENV = {
  databaseUrl: process.env.DATABASE_URL ?? "",
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: process.env.PORT ?? "3000",
} as const;
