import { db } from "@/db";
import { labResults } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(labResults)
    .orderBy(desc(labResults.createdAt));
  return Response.json({ labResults: rows });
}
