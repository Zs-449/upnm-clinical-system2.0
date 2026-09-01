import { db } from "@/db";
import { inventory } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(inventory).orderBy(asc(inventory.name));
  return Response.json({ inventory: rows });
}

export async function PATCH(req: Request) {
  try {
    const { id, add } = await req.json();
    const amount = Number(add);
    if (!Number.isInteger(Number(id)) || !Number.isInteger(amount) || amount <= 0) {
      return Response.json({ ok: false, error: "Enter a positive whole-number quantity." }, { status: 400 });
    }
    const [updated] = await db.update(inventory)
      .set({ stock: sql`${inventory.stock} + ${amount}` })
      .where(eq(inventory.id, Number(id)))
      .returning();
    if (!updated) return Response.json({ ok: false, error: "Medicine not found." }, { status: 404 });
    return Response.json({ ok: true, inventory: updated });
  } catch {
    return Response.json({ ok: false, error: "Unable to update stock." }, { status: 400 });
  }
}
