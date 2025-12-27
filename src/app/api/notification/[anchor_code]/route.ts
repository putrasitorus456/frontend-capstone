export async function GET(
  req: Request,
  { params }: { params: { anchor_code: string } }
) {
  try {
    const { anchor_code } = params;

    const r = await fetch(
      `${process.env.BACKEND_URL}/api/notification/${anchor_code}`,
      {
        headers: {
          "x-api-key": process.env.API_KEY || "",
        },
        cache: "no-store",
      }
    );

    const data = await r.json();
    return Response.json(data, { status: r.status });
  } catch (e) {
    return Response.json({ message: "Proxy error" }, { status: 500 });
  }
}