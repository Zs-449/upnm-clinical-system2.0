import { db } from "@/db";
import { appointments, activities, doctorAvailability, users } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("available") === "1") {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS doctor_availability (id serial PRIMARY KEY, doctor_user_id integer NOT NULL UNIQUE, weekly jsonb NOT NULL, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`);
    const date = url.searchParams.get("date") ?? "";
    const department = url.searchParams.get("department") ?? "";
    const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(`${date}T12:00:00`));
    const doctors = await db.select({ id: users.id, name: users.name, specialization: users.specialization, weekly: doctorAvailability.weekly }).from(users).leftJoin(doctorAvailability, eq(users.id, doctorAvailability.doctorUserId)).where(eq(users.role, "doctor")).orderBy(asc(users.name));
    const appointmentsOnDate = await db.select({ doctorName: appointments.doctorName, time: appointments.time }).from(appointments).where(eq(appointments.date, date));
    const slotLabels = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "15:30", "16:00"];
    const available = doctors.filter((doctor) => { const schedule = (doctor.weekly as Record<string, { state: string; start: string; end: string }> | null)?.[weekday]; return (!department || (doctor.specialization ?? "").toLowerCase().includes(department.toLowerCase()) || !doctor.specialization) && (!schedule || (schedule.state !== "unavailable" && schedule.state !== "not_scheduled")); }).map((doctor) => { const schedule = (doctor.weekly as Record<string, { state: string; start: string; end: string }> | null)?.[weekday]; const slots = slotLabels.filter((slot) => (!schedule || (slot >= schedule.start && slot < schedule.end)) && !appointmentsOnDate.some((booked) => booked.doctorName === doctor.name && booked.time === slot)); return { ...doctor, slots }; });
    return Response.json({ doctors: available });
  }
  const rows = await db.select().from(appointments).orderBy(desc(appointments.date), appointments.time);
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

    // Enforce the persisted weekly schedule when the selected doctor has one.
    const doctorSchedule = await db.select({ weekly: doctorAvailability.weekly }).from(users).leftJoin(doctorAvailability, eq(users.id, doctorAvailability.doctorUserId)).where(sql`${users.role} = 'doctor' AND ${users.name} = ${body.doctorName}`).limit(1);
    if (doctorSchedule[0]?.weekly) {
      const weekday = new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(`${body.date}T12:00:00`));
      const schedule = (doctorSchedule[0].weekly as Record<string, { state: string; start: string; end: string }>)[weekday];
      if (!schedule || schedule.state === "unavailable" || schedule.state === "not_scheduled" || body.time < schedule.start || body.time >= schedule.end) {
        return Response.json({ ok: false, error: `${body.doctorName} is not available at ${body.time} on ${body.date}. Please choose an available slot.` }, { status: 409 });
      }
    }

    // Prevent double-booking: the same doctor cannot have two appointments
    // at the same date + time (unless the earlier one was cancelled).
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


