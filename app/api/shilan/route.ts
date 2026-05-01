export const runtime = "edge";

const TARGET_BASE = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");

const STRIP_HEADERS = new Set([
  "host",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "transfer-encoding",
  "upgrade",
  "forwarded",
  "x-forwarded-host",
  "x-forwarded-proto",
  "x-forwarded-port",
]);

async function handler(req) {
  if (!TARGET_BASE) {
    return new Response("Misconfigured: TARGET_DOMAIN is not set", { status: 500 });
  }

  try {
    const url = new URL(req.url);
    // این خط تمام مسیر بعد از دامنه ورسل را استخراج می‌کند (مثلاً /api/shilan)
    const pathStart = req.url.indexOf("/", 8);
    const targetUrl = pathStart === -1 ? TARGET_BASE + "/" : TARGET_BASE + req.url.slice(pathStart);

    const out = new Headers();
    let clientIp = null;

    for (const [k, v] of req.headers) {
      const lowerK = k.toLowerCase();
      if (STRIP_HEADERS.has(lowerK)) continue;
      if (lowerK.startsWith("x-vercel-")) continue;
      if (lowerK === "x-real-ip") {
        clientIp = v;
        continue;
      }
      if (lowerK === "x-forwarded-for") {
        if (!clientIp) clientIp = v;
        continue;
      }
      out.set(k, v);
    }
    if (clientIp) out.set("x-forwarded-for", clientIp);

    const method = req.method;
    const hasBody = method !== "GET" && method !== "HEAD";

    return await fetch(targetUrl, {
      method,
      headers: out,
      body: hasBody ? req.body : undefined,
      duplex: "half",
      redirect: "manual",
    });
  } catch (err) {
    console.error("relay error:", err);
    return new Response("Bad Gateway: Tunnel Failed", { status: 502 });
  }
}

// در Next.js باید متدها را صادر کنید
export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
export const HEAD = handler;
