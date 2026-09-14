import { db } from "@/db";
import { sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await db.execute(sql`select 1`);
    
    const upstoxConfigured = !!(
      process.env.UPSTOX_API_KEY &&
      process.env.UPSTOX_API_SECRET &&
      process.env.UPSTOX_ACCESS_TOKEN
    );
    
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
  } catch (error) {
    return Response.json({ 
      ok: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
