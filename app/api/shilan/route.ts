export const runtime = "edge";

const TARGET_BASE = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");

export async function ALL(req) {
  if (!TARGET_BASE) {
    return new Response("Target Domain is not set in Environment Variables", { status: 500 });
  }

  try {
    // در این ساختار، چون فایل مستقیماً در پوشه shilan است، 
    // مستقیماً آدرس مقصد را می‌سازیم
    const url = new URL(req.url);
    const targetUrl = `${TARGET_BASE}/shilan${url.search}`;

    const out = new Headers();
    const STRIP_HEADERS = ["host", "connection", "upgrade", "forwarded"];

    for (const [k, v] of req.headers) {
      if (STRIP_HEADERS.includes(k.toLowerCase()) || k.toLowerCase().startsWith("x-vercel-")) continue;
      out.set(k, v);
    }

    // تنظیم IP واقعی کلاینت
    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    if (clientIp) out.set("x-forwarded-for", clientIp);

    const hasBody = !["GET", "HEAD"].includes(req.method);

    return await fetch(targetUrl, {
      method: req.method,
      headers: out,
      body: hasBody ? req.body : undefined,
      duplex: "half",
      redirect: "manual",
    });
  } catch (err) {
    return new Response(`Relay Error: ${err.message}`, { status: 502 });
  }
}

// برای اینکه تمام متدها را ساپورت کند
export const GET = ALL;
export const POST = ALL;
export const PUT = ALL;
export const PATCH = ALL;
export const DELETE = ALL;
export const HEAD = ALL;
export const OPTIONS = ALL;
