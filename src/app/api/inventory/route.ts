import { db } from "@/db";
import { inventory } from "@/db/schema";
import { asc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(inventory).orderBy(asc(inventory.name));
  return Response.json({ inventory: rows });
}
