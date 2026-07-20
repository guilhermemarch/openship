import { describe, expect, it } from "vitest";

import { buildForwardedHeaders } from "./forwarded-headers";

describe("dashboard API proxy forwarding headers", () => {
  it("uses the edge-appended client IP and discards spoofable forwarded values", () => {
    const request = new Request("https://openship.example.com/api/proxy/api/health", {
      headers: {
        "x-forwarded-for": "198.51.100.77, 203.0.113.9",
        "x-real-ip": "198.51.100.77",
        "x-forwarded-proto": "http",
        "x-forwarded-host": "attacker.example",
      },
    });

    const headers = buildForwardedHeaders(
      request as never,
      new URL("http://api.railway.internal:4000/api/health"),
    );

    expect(headers.get("x-forwarded-for")).toBe("203.0.113.9");
    expect(headers.get("x-real-ip")).toBe("203.0.113.9");
    expect(headers.get("x-forwarded-proto")).toBe("https");
    expect(headers.get("x-forwarded-host")).toBe("openship.example.com");
    expect(headers.get("host")).toBe("api.railway.internal:4000");
  });
});
