import { db } from "@/db";
import { prescriptions } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(prescriptions)
    .orderBy(desc(prescriptions.createdAt));
  return Response.json({ prescriptions: rows });
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const [updated] = await db
      .update(prescriptions)
      .set({ status })
      .where(eq(prescriptions.id, Number(id)))
      .returning();
    return Response.json({ ok: true, prescription: updated });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
