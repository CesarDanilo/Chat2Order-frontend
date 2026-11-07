import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig, devices } from "@playwright/test";

// Credenciais de teste: variáveis de ambiente ou .env.e2e (não versionado).
const envFile = fileURLToPath(new URL("./.env.e2e", import.meta.url));
if (existsSync(envFile)) process.loadEnvFile(envFile);

// Os servidores (frontend e API) já estão rodando; o Playwright não sobe nenhum.
export default defineConfig({
  testDir: "e2e",
  workers: 1,
  fullyParallel: false,
  reporter: "list",
  use: {
    baseURL: "http://localhost:5173",
    trace: "off",
  },
  projects: [
    {
      name: "setup",
      testMatch: /auth\.setup\.ts/,
    },
    {
      name: "chromium",
      testIgnore: /auth\.setup\.ts/,
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
  ],
});
