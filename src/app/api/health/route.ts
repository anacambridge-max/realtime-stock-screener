export const dynamic = "force-dynamic";

export async function GET() {
  const upstoxConfigured = !!process.env.UPSTOX_ACCESS_TOKEN;

  return Response.json({
    ok: true,
    timestamp: new Date().toISOString(),
    upstox: {
      configured: upstoxConfigured,
      hasApiKey: !!process.env.UPSTOX_API_KEY,
      hasApiSecret: !!process.env.UPSTOX_API_SECRET,
      hasAccessToken: !!process.env.UPSTOX_ACCESS_TOKEN,
    },
  });
}
