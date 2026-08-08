import { db } from "@/db";
import { activities } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(50);
  return Response.json({ activities: rows });
}
