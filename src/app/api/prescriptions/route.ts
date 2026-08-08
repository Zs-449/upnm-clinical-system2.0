import { db } from "@/db";
import { prescriptions, inventory, activities, patients } from "@/db/schema";
import { desc, eq, and, sql } from "drizzle-orm";
import { validateMedications, insertPrescription } from "@/lib/prescriptions";

export const dynamic = "force-dynamic";

interface Medication {
  name: string;
  dose: string;
  freq: string;
  duration: string;
  quantity?: number;
}

export async function GET() {
  const rows = await db
    .select()
    .from(prescriptions)
    .orderBy(desc(prescriptions.createdAt));
  return Response.json({ prescriptions: rows });
}

// Creates a real prescription (EMR "Save Record"). Every medication must
// carry a full, explicitly-provided name/dose/freq/duration/quantity — the
// server never infers quantity (or any other field) from another field.
export async function POST(req: Request) {
  let body: {
    patientId?: number | string;
    doctorName?: string;
    notes?: string;
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

  const validated = validateMedications(body.medications);
  if (!validated.ok) {
    return Response.json({ ok: false, error: validated.error }, { status: 400 });
  }

  // patientId is the source of truth — look the patient up rather than
  // trusting a client-supplied name, so the record is genuinely linked.
  const [patientRow] = await db.select().from(patients).where(eq(patients.id, patientId)).limit(1);
  if (!patientRow) {
    return Response.json({ ok: false, error: "Patient not found." }, { status: 404 });
  }

  const notes = typeof body.notes === "string" && body.notes.trim() ? body.notes.trim() : null;

  try {
    const created = await db.transaction(async (tx) =>
      insertPrescription(tx, {
        patientId: patientRow.id,
        patientName: patientRow.name,
        doctorName,
        medications: validated.medications,
        notes,
      })
    );

    return Response.json({ ok: true, prescription: created }, { status: 201 });
  } catch {
    return Response.json({ ok: false, error: "Failed to save prescription." }, { status: 500 });
  }
}

// Dispensing state machine. The server never trusts the status a client
// claims a prescription is currently in — every transition is re-checked
// against the database row itself (see the `where` guards below), so
// double-clicks, retried requests, or direct API calls can't double-apply
// an inventory deduction or skip a step.
const ALLOWED_TRANSITIONS: Record<string, string> = {
  Dispensing: "Pending",
  Collected: "Dispensing",
};

export async function PATCH(req: Request) {
  let body: { id?: number | string; status?: string };
  try {
    body = await req.json();
  } catch {
    return Response.json({ ok: false, error: "Invalid request body." }, { status: 400 });
  }

  const id = Number(body.id);
  const nextStatus = body.status;
  if (!id || !nextStatus) {
    return Response.json({ ok: false, error: "Missing prescription id or status." }, { status: 400 });
  }

  const requiredFromStatus = ALLOWED_TRANSITIONS[nextStatus];
  if (!requiredFromStatus) {
    return Response.json({ ok: false, error: `Unsupported status transition to "${nextStatus}".` }, { status: 400 });
  }

  const [current] = await db.select().from(prescriptions).where(eq(prescriptions.id, id)).limit(1);
  if (!current) {
    return Response.json({ ok: false, error: "Prescription not found." }, { status: 404 });
  }
  if (current.status !== requiredFromStatus) {
    return Response.json(
      {
        ok: false,
        error: `Prescription #${id} is already "${current.status}" — it can't be moved to "${nextStatus}" again.`,
      },
      { status: 409 }
    );
  }

  try {
    if (nextStatus === "Dispensing") {
      // Starting dispensing is the moment inventory is consumed. Validate
      // everything up front so we never partially deduct stock.
      const meds = (current.medications as Medication[]) ?? [];
      if (meds.length === 0) {
        return Response.json({ ok: false, error: "This prescription has no medications to dispense." }, { status: 400 });
      }

      for (const m of meds) {
        if (typeof m.quantity !== "number" || !Number.isFinite(m.quantity) || m.quantity <= 0) {
          return Response.json(
            {
              ok: false,
              error: `Cannot dispense: "${m.name}" has no valid quantity recorded on this prescription.`,
            },
            { status: 400 }
          );
        }
      }

      const invRows = await db.select().from(inventory);
      const invByName = new Map(invRows.map((i) => [i.name.trim().toLowerCase(), i]));

      for (const m of meds) {
        const match = invByName.get(m.name.trim().toLowerCase());
        if (!match) {
          return Response.json({ ok: false, error: `Medicine "${m.name}" is not available in inventory.` }, { status: 400 });
        }
        if (match.stock < (m.quantity as number)) {
          return Response.json(
            {
              ok: false,
              error: `Insufficient stock for "${m.name}". Required ${m.quantity}, only ${match.stock} available.`,
            },
            { status: 409 }
          );
        }
      }

      const result = await db.transaction(async (tx) => {
        for (const m of meds) {
          const match = invByName.get(m.name.trim().toLowerCase())!;
          const qty = m.quantity as number;
          // Guard the deduction with a stock >= qty condition so a
          // concurrent dispense of the same medicine can't push stock
          // negative even if two requests race past the check above.
          const [deducted] = await tx
            .update(inventory)
            .set({ stock: sql`${inventory.stock} - ${qty}` })
            .where(and(eq(inventory.id, match.id), sql`${inventory.stock} >= ${qty}`))
            .returning();
          if (!deducted) {
            throw new Error(`Insufficient stock for "${m.name}". Please retry.`);
          }
        }

        // Re-assert the Pending -> Dispensing transition inside the
        // transaction to close the race window between the check above
        // and this write (duplicate-dispense protection).
        const [updated] = await tx
          .update(prescriptions)
          .set({ status: "Dispensing" })
          .where(and(eq(prescriptions.id, id), eq(prescriptions.status, "Pending")))
          .returning();
        if (!updated) {
          throw new Error(`Prescription #${id} is no longer Pending — it may have just been dispensed.`);
        }

        const medSummary = meds.map((m) => `${m.name} x${m.quantity}`).join(", ");
        // activities.action is varchar(200) — clamp so a prescription with
        // many/long medication names can't overflow the column and fail
        // the transaction after inventory has already been deducted.
        const action = `medication dispensing started for Rx #${id} — ${medSummary} (${current.doctorName})`.slice(0, 200);
        await tx.insert(activities).values({
          patientName: current.patientName,
          action,
          urgency: "normal",
        });

        return updated;
      });

      return Response.json({ ok: true, prescription: result });
    }

    // Dispensing -> Collected: status + audit log only. Inventory was
    // already deducted when dispensing started, so it must not move again.
    const result = await db.transaction(async (tx) => {
      const [updated] = await tx
        .update(prescriptions)
        .set({ status: "Collected" })
        .where(and(eq(prescriptions.id, id), eq(prescriptions.status, "Dispensing")))
        .returning();
      if (!updated) {
        throw new Error(`Prescription #${id} is no longer in Dispensing — it may have just been collected.`);
      }

      await tx.insert(activities).values({
        patientName: current.patientName,
        action: `medication collected by patient for Rx #${id}`,
        urgency: "normal",
      });

      return updated;
    });

    return Response.json({ ok: true, prescription: result });
  } catch (err) {
    return Response.json({ ok: false, error: err instanceof Error ? err.message : "Failed to update prescription." }, { status: 409 });
  }
}
