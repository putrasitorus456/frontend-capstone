export async function GET() {
  try {
    const r = await fetch(`${process.env.BACKEND_URL}/api/streetlights/stats`, {
      headers: {
        "x-api-key": process.env.API_KEY || "",
      },
      cache: "no-store",
    });

    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e) {
    return Response.json({ message: "Proxy error" }, { status: 500 });
  }
}