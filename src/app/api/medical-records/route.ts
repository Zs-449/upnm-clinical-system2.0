import { db } from "@/db";
import { medicalRecords, patients, activities } from "@/db/schema";
import { desc, eq } from "drizzle-orm";
import { validateMedications, insertPrescription, type MedicationInput } from "@/lib/prescriptions";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const patientIdParam = searchParams.get("patientId");

  const rows = patientIdParam
    ? await db
        .select()
        .from(medicalRecords)
        .where(eq(medicalRecords.patientId, Number(patientIdParam)))
        .orderBy(desc(medicalRecords.createdAt))
    : await db.select().from(medicalRecords).orderBy(desc(medicalRecords.createdAt));

  return Response.json({ medicalRecords: rows });
}

// Persists a full EMR consultation (chief complaint, vitals, diagnosis,
// treatment plan) and, if medications were added, the linked prescription —
// both in one transaction, so "consultation saved / prescription failed"
// (or vice versa) can never happen.
export async function POST(req: Request) {
  let body: {
    patientId?: number | string;
    doctorName?: string;
    chiefComplaint?: string;
    vitals?: unknown;
    diagnosis?: string;
    treatmentPlan?: string;
    medications?: unknown;
  };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const patientId = Number(body.patientId);
  if (!patientId || !Number.isFinite(patientId)) {
    return Response.json({ ok: false, error: "A valid patientId is required." }, { status: 400 });
  }

  const doctorName = typeof body.doctorName === "string" ? body.doctorName.trim() : "";
  if (!doctorName) {
    return Response.json({ ok: false, error: "Doctor name is required." }, { status: 400 });
  }

  const chiefComplaint = typeof body.chiefComplaint === "string" ? body.chiefComplaint.trim() : "";
  const diagnosis = typeof body.diagnosis === "string" ? body.diagnosis.trim() : "";
  const treatmentPlan = typeof body.treatmentPlan === "string" ? body.treatmentPlan.trim() : "";
  const vitals = body.vitals && typeof body.vitals === "object" ? body.vitals : null;

  // Don't allow a completely empty consultation — that isn't a meaningful
  // clinical record. (Not overly strict: any one of these is enough, and
  // vitals are optional like the rest.)
  if (!chiefComplaint && !diagnosis && !treatmentPlan && !vitals) {
    return Response.json(
      { ok: false, error: "Enter at least a chief complaint, diagnosis, treatment plan, or vitals before saving." },
      { status: 400 }
    );
  }

  // Medications are optional for a consultation (not every visit ends in a
  // prescription) — but if any are provided, they go through the exact
  // same validation as a standalone prescription (BUG #4).
  let medications: MedicationInput[] = [];
  if (body.medications !== undefined) {
    const validated = validateMedications(body.medications);
    if (!validated.ok) {
      return Response.json({ ok: false, error: validated.error }, { status: 400 });
    }
    medications = validated.medications;
  }

  const [patientRow] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  if (!patientRow) {
    return Response.json({ ok: false, error: "Patient not found." }, { status: 404 });
  }

  try {
    const result = await db.transaction(async (tx) => {
      let prescriptionRow: Awaited<ReturnType<typeof insertPrescription>> | null = null;
      if (medications.length > 0) {
        prescriptionRow = await insertPrescription(tx, {
          patientId: patientRow.id,
          patientName: patientRow.name,
          doctorName,
          medications,
          notes: treatmentPlan || null,
        });
      }

      const [record] = await tx
        .insert(medicalRecords)
        .values({
          patientId: patientRow.id,
          patientName: patientRow.name,
          doctorName,
          chiefComplaint: chiefComplaint || null,
          vitals,
          diagnosis: diagnosis || null,
          treatmentPlan: treatmentPlan || null,
          prescriptionId: prescriptionRow?.id ?? null,
        })
        .returning();

      const action = `consultation recorded for ${patientRow.name} (${doctorName})${diagnosis ? ` — ${diagnosis}` : ""}`.slice(0, 200);
      await tx.insert(activities).values({
        patientName: patientRow.name,
        action,
        urgency: "normal",
      });

      return { record, prescription: prescriptionRow };
    });

    return Response.json({ ok: true, medicalRecord: result.record, prescription: result.prescription }, { status: 201 });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Failed to save consultation." }, { status: 500 });
  }
}
