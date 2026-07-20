import { afterEach, describe, expect, it, vi } from "vitest";
import { readFile } from "node:fs/promises";

const originalEnvironment = { ...process.env };

afterEach(() => {
  process.env = { ...originalEnvironment };
  vi.resetModules();
});

describe("Railway control-plane platform resolution", () => {
  it("avoids non-portable BuildKit cache flags", async () => {
    const dockerfile = await readFile(new URL("../../Dockerfile", import.meta.url), "utf8");

    expect(dockerfile).not.toContain("--mount=type=cache");
  });

  it(
    "skips local infrastructure without enabling desktop authentication",
    async () => {
      process.env = {
        ...originalEnvironment,
        NODE_ENV: "test",
        DEPLOY_MODE: "docker",
        OPENSHIP_CONTROL_PLANE_ONLY: "true",
        INTERNAL_TOKEN: "test-internal-token-with-at-least-32-bytes",
        BETTER_AUTH_SECRET: "test-better-auth-secret-with-at-least-32-bytes",
      };
      vi.resetModules();

      const [{ env }, { resolvePlatformConfig }] = await Promise.all([
        import("../../src/config/env"),
        import("../../src/lib/controller-helpers"),
      ]);

      expect(env.DEPLOY_MODE).toBe("docker");
      expect(env.OPENSHIP_CONTROL_PLANE_ONLY).toBe(true);
      expect(resolvePlatformConfig()).toEqual({ target: "desktop" });
    },
    15_000,
  );

  it("uses the hosted proxy URL for auth callbacks and trusted origins", async () => {
    process.env = {
      ...originalEnvironment,
      NODE_ENV: "test",
      DEPLOY_MODE: "docker",
      INTERNAL_TOKEN: "test-internal-token-with-at-least-32-bytes",
      BETTER_AUTH_SECRET: "test-better-auth-secret-with-at-least-32-bytes",
      BETTER_AUTH_URL: "https://openship.example.com/api/proxy/",
    };
    vi.resetModules();

    const { betterAuthBaseUrl, trustedOrigins } = await import("../../src/config/env");

    expect(betterAuthBaseUrl).toBe("https://openship.example.com");
    expect(trustedOrigins).toContain("https://openship.example.com");
  });
});
