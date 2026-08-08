import { db } from "@/db";
import { prescriptions, activities } from "@/db/schema";

export interface MedicationInput {
  name: string;
  dose: string;
  freq: string;
  duration: string;
  quantity: number;
}

type ValidationResult =
  | { ok: true; medications: MedicationInput[] }
  | { ok: false; error: string };

// Same validation used by EMR-created prescriptions everywhere: every
// medication needs an explicit name/dose/freq/duration and a quantity > 0.
// Nothing is ever inferred from another field.
export function validateMedications(raw: unknown): ValidationResult {
  const rawMeds = Array.isArray(raw) ? raw : [];
  if (rawMeds.length === 0) {
    return { ok: false, error: "At least one medication is required." };
  }

  const medications: MedicationInput[] = [];
  for (const item of rawMeds) {
    const r = item as Record<string, unknown>;
    const name = typeof r?.name === "string" ? r.name.trim() : "";
    const dose = typeof r?.dose === "string" ? r.dose.trim() : "";
    const freq = typeof r?.freq === "string" ? r.freq.trim() : "";
    const duration = typeof r?.duration === "string" ? r.duration.trim() : "";
    const quantity = Number(r?.quantity);

    if (!name) return { ok: false, error: "Every medication needs a name." };
    if (!dose) return { ok: false, error: `Enter a dose for "${name}".` };
    if (!freq) return { ok: false, error: `Enter a frequency for "${name}".` };
    if (!duration) return { ok: false, error: `Enter a duration for "${name}".` };
    if (!Number.isFinite(quantity) || quantity <= 0) {
      return { ok: false, error: `Enter a valid quantity (greater than 0) for "${name}".` };
    }
    medications.push({ name, dose, freq, duration, quantity });
  }
  return { ok: true, medications };
}

// Drizzle's transaction-scoped db handle has the same query surface as
// `db` itself; typed structurally here so this helper works whether it's
// called with a plain `db` or an in-progress `tx`.
type DbOrTx = Pick<typeof db, "insert">;

// Inserts a prescription row + its "prescription created" activity log
// entry. Caller decides whether to run this inside a transaction (e.g. so
// it can be combined atomically with a medical-record insert) or on the
// plain `db` handle for a standalone prescription creation.
export async function insertPrescription(
  handle: DbOrTx,
  args: { patientId: number; patientName: string; doctorName: string; medications: MedicationInput[]; notes: string | null }
) {
  const [row] = await handle
    .insert(prescriptions)
    .values({
      patientId: args.patientId,
      patientName: args.patientName,
      doctorName: args.doctorName,
      medications: args.medications,
      notes: args.notes,
      // status defaults to "Pending" per the schema.
    })
    .returning();

  const medSummary = args.medications.map((m) => `${m.name} x${m.quantity}`).join(", ");
  // activities.action is varchar(200) — clamp defensively, same as the
  // dispensing log entries.
  const action = `prescription created for Rx #${row.id} — ${medSummary} (${args.doctorName})`.slice(0, 200);
  await handle.insert(activities).values({
    patientName: row.patientName,
    action,
    urgency: "normal",
  });

  return row;
}
