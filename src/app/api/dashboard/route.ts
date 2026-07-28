import { db } from "@/db";
import {
  patients,
  appointments,
  labResults,
  activities,
} from "@/db/schema";
import { sql, eq, desc } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  const today = new Date().toISOString().slice(0, 10);

  const [patientCount] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(patients)
    .where(eq(patients.status, "Active"));

  const [todayAppts] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(appointments)
    .where(eq(appointments.date, today));

  const [pendingLabs] = await db
    .select({ c: sql<number>`count(*)::int` })
    .from(labResults);

  const queue = await db
    .select()
    .from(appointments)
    .where(eq(appointments.date, today))
    .orderBy(appointments.queueNumber);

  const recent = await db
    .select()
    .from(activities)
    .orderBy(desc(activities.createdAt))
    .limit(8);

  // 30-day visits trend
  const trend = await db
    .select({
      day: sql<string>`to_char(date, 'MM-DD')`,
      count: sql<number>`count(*)::int`,
    })
    .from(appointments)
    .groupBy(sql`date`)
    .orderBy(sql`date`);

  // department distribution
  const byDept = await db
    .select({
      department: appointments.department,
      count: sql<number>`count(*)::int`,
    })
    .from(appointments)
    .groupBy(appointments.department);

  const criticalLabs = await db
    .select()
    .from(labResults)
    .where(sql`flag != 'Normal'`)
    .limit(5);

  return Response.json({
    stats: {
      todayAppointments: todayAppts?.c ?? 0,
      activePatients: patientCount?.c ?? 0,
      availableDoctors: 4,
      pendingLabs: pendingLabs?.c ?? 0,
    },
    queue,
    recent,
    trend,
    byDept,
    criticalLabs,
  });
}
