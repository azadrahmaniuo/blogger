import { NextRequest } from 'next/server';

export const runtime = 'edge';

const TARGET_BASE = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");

// این تابع تمام متدهای ورودی را مدیریت می‌کند
async function proxyHandler(req: NextRequest) {
  if (!TARGET_BASE) {
    return new Response("Target Domain Not Set", { status: 500 });
  }

  try {
    const url = new URL(req.url);
    // ساخت آدرس مقصد (چون در پوشه shilan هستیم، مستقیم به /shilan می‌فرستیم)
    const targetUrl = `${TARGET_BASE}/shilan${url.search}`;

    const out = new Headers();
    const STRIP_HEADERS = ["host", "connection", "upgrade", "forwarded"];

    req.headers.forEach((v, k) => {
      if (STRIP_HEADERS.includes(k.toLowerCase()) || k.toLowerCase().startsWith("x-vercel-")) return;
      out.set(k, v);
    });

    const clientIp = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip");
    if (clientIp) out.set("x-forwarded-for", clientIp);

    const response = await fetch(targetUrl, {
      method: req.method,
      headers: out,
      body: req.body,
      // @ts-ignore
      duplex: "half",
      redirect: "manual",
    });

    return response;
  } catch (err: any) {
    return new Response(`Relay Error: ${err.message}`, { status: 502 });
  }
}

// صادر کردن متدها به صورت صریح برای Next.js
export const GET = proxyHandler;
export const POST = proxyHandler;
export const PUT = proxyHandler;
export const PATCH = proxyHandler;
export const DELETE = proxyHandler;
export const HEAD = proxyHandler;
