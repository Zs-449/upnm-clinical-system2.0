import { db } from "@/db";
import bcrypt from "bcryptjs";
import { doctorAvailability, users } from "@/db/schema";
import { asc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"] as const;
type Day = (typeof DAYS)[number];
type AvailabilityState = "available" | "limited" | "unavailable" | "not_scheduled";

export interface AvailabilityDay {
  state: AvailabilityState;
  start: string;
  end: string;
}

function defaultWeek(): Record<Day, AvailabilityDay> {
  return Object.fromEntries(DAYS.map((day) => [day, { state: day === "Sunday" ? "not_scheduled" : "available", start: "09:00", end: day === "Friday" ? "15:00" : "17:00" }])) as Record<Day, AvailabilityDay>;
}

async function ensureTable() {
  await db.execute(sql`CREATE TABLE IF NOT EXISTS doctor_availability (id serial PRIMARY KEY, doctor_user_id integer NOT NULL UNIQUE, weekly jsonb NOT NULL, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`);
}

export async function GET() {
  await ensureTable();
  const rows = await db.select({
    id: users.id,
    name: users.name,
    email: users.email,
    specialization: users.specialization,
    online: users.online,
    availabilityId: doctorAvailability.id,
    weekly: doctorAvailability.weekly,
  }).from(users).leftJoin(doctorAvailability, eq(users.id, doctorAvailability.doctorUserId)).where(eq(users.role, "doctor")).orderBy(asc(users.name));

  return Response.json({ doctors: rows.map((doctor) => ({ ...doctor, weekly: (doctor.weekly as Record<Day, AvailabilityDay> | null) ?? defaultWeek() })) });
}

export async function POST(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const name = String(body.name ?? "").trim();
    const email = String(body.email ?? "").trim().toLowerCase();
    const specialization = String(body.specialization ?? "General Medicine").trim();
    if (!name || !email) return Response.json({ ok: false, error: "Full name and email are required." }, { status: 400 });

    const [created] = await db.insert(users).values({
      name,
      email,
      password: await bcrypt.hash(String(body.password ?? "password123"), 10),
      role: "doctor",
      specialization,
      avatarColor: "#7a9e7e",
      online: body.status !== "Inactive",
    }).returning({ id: users.id, name: users.name, email: users.email, specialization: users.specialization, online: users.online });
    await db.insert(doctorAvailability).values({ doctorUserId: created.id, weekly: body.weekly ?? defaultWeek() });
    return Response.json({ ok: true, doctor: { ...created, weekly: body.weekly ?? defaultWeek() } });
  } catch (error) {
    const message = error instanceof Error && error.message.includes("duplicate") ? "A doctor with this email already exists." : "Unable to create doctor.";
    return Response.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function PATCH(req: Request) {
  try {
    await ensureTable();
    const body = await req.json();
    const doctorUserId = Number(body.doctorUserId);
    if (!doctorUserId || !body.weekly) return Response.json({ ok: false, error: "Doctor and weekly availability are required." }, { status: 400 });
    const existing = await db.select({ id: doctorAvailability.id }).from(doctorAvailability).where(eq(doctorAvailability.doctorUserId, doctorUserId)).limit(1);
    if (existing[0]) {
      await db.update(doctorAvailability).set({ weekly: body.weekly, updatedAt: new Date() }).where(eq(doctorAvailability.doctorUserId, doctorUserId));
    } else {
      await db.insert(doctorAvailability).values({ doctorUserId, weekly: body.weekly });
    }
    if (typeof body.status === "string") await db.update(users).set({ online: body.status !== "Inactive" }).where(eq(users.id, doctorUserId));
    return Response.json({ ok: true });
  } catch {
    return Response.json({ ok: false, error: "Unable to update availability." }, { status: 400 });
  }
}

export function getDayName(date: string) {
  return new Intl.DateTimeFormat("en-US", { weekday: "long", timeZone: "Asia/Kuala_Lumpur" }).format(new Date(`${date}T12:00:00`)) as Day;
}

export { DAYS, defaultWeek };

