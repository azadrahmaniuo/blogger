
export const config = { runtime: "edge" };

export default async function handler(req) {
  const TARGET_BASE = (process.env.TARGET_DOMAIN || "").replace(/\/$/, "");
  
  if (!TARGET_BASE) {
    return new Response("Target Domain Not Set", { status: 500 });
  }

  try {
    const url = new URL(req.url);
    const targetUrl = `${TARGET_BASE}/shilan${url.search}`;

    const out = new Headers();
    req.headers.forEach((v, k) => {
      if (["host", "connection", "upgrade"].includes(k.toLowerCase()) || k.toLowerCase().startsWith("x-vercel-")) return;
      out.set(k, v);
    });

    return await fetch(targetUrl, {
      method: req.method,
      headers: out,
      body: req.body,
      duplex: "half",
      redirect: "manual",
    });
  } catch (err) {
    return new Response(err.message, { status: 502 });
  }
}
