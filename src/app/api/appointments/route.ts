import { db } from "@/db";
import { appointments, activities } from "@/db/schema";
import { desc, eq, sql } from "drizzle-orm";
import { buildAvailability, doctorByName, isBookableSlot, isClinicOpen, isValidDateString } from "@/lib/availability";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const rows = await db
    .select()
    .from(appointments)
    .orderBy(desc(appointments.date), appointments.time);

  const url = new URL(req.url);
  const date = url.searchParams.get("date");
  const department = url.searchParams.get("department") || undefined;
  const doctorName = url.searchParams.get("doctor") || undefined;
  const period = (url.searchParams.get("period") || "any") as "morning" | "afternoon" | "any";

  if (date) {
    return Response.json({
      appointments: rows,
      date,
      open: isClinicOpen(date),
      doctors: buildAvailability(date, rows, department, doctorName, period),
    });
  }

  return Response.json({ appointments: rows });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const today = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"})).toLocaleDateString('en-CA');

    // Auto-create patient if not exists: look up by patientName, or create new record
    const { patients: patientsTable, activities: act } = await import("@/db/schema");
    const { ilike } = await import("drizzle-orm");
    let patientId = Number(body.patientId) || 0;
    let patientName = body.patientName;

    if (!patientId && patientName) {
      const existing = await db
        .select()
        .from(patientsTable)
        .where(ilike(patientsTable.name, patientName))
        .limit(1);
      if (existing[0]) {
        patientId = existing[0].id;
        patientName = existing[0].name;
      } else {
        // auto-create patient record using appointment info
        const count = (await db.select().from(patientsTable)).length;
        const [newPatient] = await db
          .insert(patientsTable)
          .values({
            patientCode: `UPNM-${String(2024000 + count + 1).padStart(7, "0")}`,
            name: patientName,
            age: Number(body.patientAge) || 21,
            gender: body.patientGender || "Not specified",
            bloodType: body.patientBloodType || "Unknown",
            department: body.department || "General",
            status: "Active",
            phone: body.patientPhone || null,
            email: body.patientEmail || null,
            allergies: body.patientAllergies || "None",
            chronicConditions: "None",
            emergencyContact: null,
            healthScore: 80,
            lastVisit: today,
          })
          .returning();
        patientId = newPatient.id;
        patientName = newPatient.name;
        await db.insert(act).values({
          patientName,
          action: "registered automatically via appointment booking",
          urgency: "normal",
        });
      }
    }

    const doctor = doctorByName(String(body.doctorName || ""));
    if (!doctor || doctor.department !== body.department) {
      return Response.json({ ok: false, error: "Please choose a valid doctor for this department." }, { status: 400 });
    }
    if (!isValidDateString(body.date) || !isClinicOpen(body.date)) {
      return Response.json({ ok: false, error: "Appointments are available Monday to Friday. Please choose an open clinic date." }, { status: 400 });
    }

    // Prevent double-booking and keep all booking paths connected to the same availability rules.
    const currentAppointments = await db.select().from(appointments);
    if (!isBookableSlot(body.date, doctor.name, body.time, currentAppointments)) {
      return Response.json({ ok: false, error: `${doctor.name} is not available at ${body.time} on ${body.date}. Please choose another slot.` }, { status: 409 });
    }
    const clash = await db
      .select()
      .from(appointments)
      .where(
        sql`${appointments.doctorName} = ${body.doctorName} AND ${appointments.date} = ${body.date} AND ${appointments.time} = ${body.time} AND ${appointments.status} <> 'Cancelled'`
      )
      .limit(1);
    if (clash[0]) {
      return Response.json(
        {
          ok: false,
          error: `${body.doctorName} is already booked at ${body.time} on ${body.date}. Please choose another slot.`,
        },
        { status: 409 }
      );
    }

    let queueNumber: number | null = null;
    if (body.date === today) {
      const [max] = await db
        .select({ m: sql<number>`coalesce(max(queue_number),0)::int` })
        .from(appointments)
        .where(eq(appointments.date, today));
      queueNumber = (max?.m ?? 0) + 1;
    }
    const [created] = await db
      .insert(appointments)
      .values({
        patientId,
        patientName,
        doctorName: body.doctorName,
        department: body.department,
        date: body.date,
        time: body.time,
        status: body.date === today ? "Waiting" : "Scheduled",
        urgency: body.urgency || "Routine",
        symptoms: body.symptoms || "",
        queueNumber,
      })
      .returning();

    await db.insert(act).values({
      patientName: created.patientName,
      action: `booked ${created.department} appointment on ${created.date}`,
      urgency: created.urgency === "Emergency" ? "critical" : "normal",
    });

    return Response.json({ ok: true, appointment: created, patientId });
  } catch {
    return Response.json({ ok: false, error: "Failed" }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();
    const [updated] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, Number(id)))
      .returning();
    return Response.json({ ok: true, appointment: updated });
  } catch {
    return Response.json({ ok: false }, { status: 400 });
  }
}


