import { db } from "@/db";
import { medicalCertificates } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db
    .select()
    .from(medicalCertificates)
    .orderBy(desc(medicalCertificates.createdAt));
  return Response.json({ certificates: rows });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = (await db.select().from(medicalCertificates)).length;
    const [created] = await db
      .insert(medicalCertificates)
      .values({
        patientId: Number(body.patientId) || 0,
        patientName: body.patientName,
        patientCode: body.patientCode || "UPNM-0000000",
        doctorName: body.doctorName || "Dr. Aisyah Karim",
        diagnosis: body.diagnosis,
        reason: body.reason || "Recommended rest due to medical condition.",
        startDate: body.startDate,
        endDate: body.endDate,
        days: Number(body.days) || 1,
        status: "Active",
        certificateNo: `UPNM/MC/${new Date().getFullYear()}/${String(1000 + count + 1)}`,
        notes: body.notes || null,
      })
      .returning();
    return Response.json({ ok: true, certificate: created });
  } catch {
    return Response.json({ ok: false, error: "Failed" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const [updated] = await db
      .update(medicalCertificates)
      .set({ status })
      .where(eq(medicalCertificates.id, Number(id)))
      .returning();
    return Response.json({ ok: true, certificate: updated });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}
