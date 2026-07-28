import { db } from "@/db";
import { patients, activities } from "@/db/schema";
import { desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const rows = await db.select().from(patients).orderBy(desc(patients.createdAt));
  return Response.json({ patients: rows });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const count = (await db.select().from(patients)).length;
    const [created] = await db
      .insert(patients)
      .values({
        patientCode: `UPNM-${String(2024000 + count + 1).padStart(7, "0")}`,
        name: body.name,
        age: Number(body.age),
        gender: body.gender,
        bloodType: body.bloodType,
        department: body.department,
        status: body.status || "Active",
        phone: body.phone,
        email: body.email,
        allergies: body.allergies || "None",
        chronicConditions: body.chronicConditions || "None",
        emergencyContact: body.emergencyContact,
        healthScore: 80,
        lastVisit: new Date().toISOString().slice(0, 10),
      })
      .returning();

    await db.insert(activities).values({
      patientName: created.name,
      action: "registered as new patient",
      urgency: "normal",
    });

    return Response.json({ ok: true, patient: created });
  } catch {
    return Response.json({ ok: false, error: "Failed to create patient" }, { status: 400 });
  }
}
