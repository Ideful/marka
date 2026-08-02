import { getApiBaseUrl } from "@/lib/api/config";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "invalid json" }, { status: 400 });
  }

  const base = getApiBaseUrl();
  const res = await fetch(`${base}/vacancy-applications`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  const text = await res.text();
  let payload: unknown = { ok: res.ok };
  if (text) {
    try {
      payload = JSON.parse(text);
    } catch {
      payload = { error: text };
    }
  }

  return Response.json(payload, { status: res.status });
}
