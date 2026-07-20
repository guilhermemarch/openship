import type { NextRequest } from "next/server";

// Hop-by-hop headers must not be forwarded by a proxy. Fetch recomputes
// framing headers for the body it actually sends upstream.
const HOP_BY_HOP_HEADERS = new Set([
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "host",
  "content-length",
]);

// Never relay client-controlled forwarding metadata verbatim. Railway's edge
// appends the actual peer to X-Forwarded-For; the final entry is therefore the
// trusted edge observation, while earlier entries may be attacker supplied.
const FORWARDED_REQUEST_HEADERS = new Set([
  "x-forwarded-for",
  "x-real-ip",
  "x-forwarded-proto",
  "x-forwarded-host",
]);

export function buildForwardedHeaders(req: NextRequest, upstream: URL): Headers {
  const out = new Headers();
  for (const [name, value] of req.headers) {
    const normalizedName = name.toLowerCase();
    if (
      HOP_BY_HOP_HEADERS.has(normalizedName) ||
      FORWARDED_REQUEST_HEADERS.has(normalizedName)
    ) {
      continue;
    }
    out.set(name, value);
  }

  const edgeForwardedFor = req.headers
    .get("x-forwarded-for")
    ?.split(",")
    .at(-1)
    ?.trim();
  const clientIp = edgeForwardedFor ?? (req as unknown as { ip?: string }).ip ?? "";
  if (clientIp) {
    out.set("x-forwarded-for", clientIp);
    out.set("x-real-ip", clientIp);
  }

  const publicUrl = new URL(req.url);
  out.set("x-forwarded-proto", publicUrl.protocol.replace(":", ""));
  out.set("x-forwarded-host", publicUrl.host);
  out.set("host", upstream.host);
  return out;
}
