import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { resolveListenHost } from "./listenHost";

function isPortAvailable(port: number, host: string): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, host, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000, host: string = "127.0.0.1"): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port, host)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const host = resolveListenHost(process.env.HOST, process.env.ALLOW_NETWORK_BIND);
  const app = express();
  const server = createServer(app);
  // The API only accepts short, fixed synthetic identifiers: no file uploads or free text.
  app.use(express.json({ limit: "16kb" }));
  app.use(express.urlencoded({ limit: "16kb", extended: false }));
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort, host);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  if (!["127.0.0.1", "::1", "localhost"].includes(host)) {
    console.warn("CuidaMar is listening on a network interface without authentication. Never use sensitive data.");
  }
  server.listen(port, host, () => {
    const displayHost = host.includes(":") ? `[${host}]` : host;
    console.log(`Server running on http://${displayHost}:${port}/`);
  });
}

startServer().catch(console.error);
