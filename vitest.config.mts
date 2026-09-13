import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

const repoRoot = dirname(fileURLToPath(import.meta.url));

/**
 * The content checks read plain data and never touch a DOM or the network, so
 * they run in Node. Adding jsdom would buy nothing and slow the build gate.
 * A test that renders one component with props is written as JSX, in a
 * `.tsx` file; the rest are plain TypeScript.
 */
export default defineConfig({
  test: {
    environment: "node",
    include: ["tests/**/*.test.{ts,tsx}"],
  },
  resolve: {
    alias: { "@": repoRoot },
  },
});
