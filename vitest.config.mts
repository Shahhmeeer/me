import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const repoRoot = dirname(fileURLToPath(import.meta.url));

/**
 * The content checks read plain data and never touch a DOM or the network, so
 * they run in Node. Adding jsdom would buy nothing and slow the build gate.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.ts"],
  },
  resolve: {
    alias: { "@": repoRoot },
  },
});
