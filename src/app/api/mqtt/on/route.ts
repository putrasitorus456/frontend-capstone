export async function POST(req: Request) {
  try {
    const body = await req.json();

    const r = await fetch(`${process.env.BACKEND_URL}/api/mqtt/on`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.API_KEY || "",
      },
      body: JSON.stringify(body),
    });

    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e) {
    return Response.json({ message: "Proxy error" }, { status: 500 });
  }
}