import { db } from "@/db";
import { appointments, doctorAvailability, inventory, prescriptions, users } from "@/db/schema";
import { asc, desc, eq, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

const today = () => new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })).toLocaleDateString("en-CA");

export async function POST(req: Request) {
  try {
    await db.execute(sql`CREATE TABLE IF NOT EXISTS doctor_availability (id serial PRIMARY KEY, doctor_user_id integer NOT NULL UNIQUE, weekly jsonb NOT NULL, created_at timestamp NOT NULL DEFAULT now(), updated_at timestamp NOT NULL DEFAULT now())`);
    const body = await req.json();
    const query = String(body.query ?? "").trim().toLowerCase();
    if (!query) return Response.json({ ok: false, error: "Ask me an operational question." }, { status: 400 });

    if (query.includes("low") || query.includes("stock") || query.includes("medication")) {
      const rows = await db.select().from(inventory).orderBy(asc(inventory.name));
      const match = rows.find((row) => query.includes(row.name.toLowerCase()));
      if (match && (query.includes(match.name.toLowerCase()) || query.includes("check"))) {
        return Response.json({ ok: true, kind: "stock", text: `${match.name}\n\nCurrent stock: ${match.stock} ${match.unit ?? "units"}\nMinimum threshold: ${match.minStock} ${match.unit ?? "units"}\n\n${match.stock < match.minStock ? "Stock is below the recommended threshold." : "Stock is currently healthy."}\n\nWould you like to add stock?`, action: { type: "add-stock", item: match } });
      }
      const low = rows.filter((row) => row.stock < row.minStock);
      return Response.json({ ok: true, kind: "low-stock", text: low.length ? `Here are the medicines currently below the stock threshold:\n\n${low.map((row) => `${row.stock < row.minStock / 2 ? "URGENT" : "LOW"}  ${row.name} — ${row.stock} ${row.unit ?? "units"}`).join("\n")}` : "All medicines are currently above their minimum stock thresholds." });
    }

    if (query.includes("prescription")) {
      const rows = await db.select().from(prescriptions).where(eq(prescriptions.status, "Pending")).orderBy(desc(prescriptions.createdAt));
      return Response.json({ ok: true, kind: "prescriptions", text: rows.length ? `${rows.length} prescription${rows.length === 1 ? " is" : "s are"} waiting for dispensing.\n\n${rows.slice(0, 5).map((row) => `Rx #${row.id} — ${row.patientName} · ${row.doctorName}`).join("\n")}` : "There are no prescriptions waiting for dispensing." });
    }

    if (query.includes("appointment")) {
      const rows = await db.select().from(appointments).where(eq(appointments.date, today())).orderBy(appointments.time);
      return Response.json({ ok: true, kind: "appointments", text: rows.length ? `${rows.length} appointment${rows.length === 1 ? " is" : "s are"} scheduled today.\n\n${rows.slice(0, 6).map((row) => `${row.time} — ${row.patientName} · ${row.doctorName}`).join("\n")}` : "There are no appointments scheduled today." });
    }

    if (query.includes("waiting") || query.includes("patient")) {
      const [row] = await db.select({ count: sql<number>`count(*)::int` }).from(appointments).where(sql`${appointments.date} = ${today()} AND ${appointments.status} = 'Waiting'`);
      return Response.json({ ok: true, kind: "queue", text: `${row?.count ?? 0} patient${(row?.count ?? 0) === 1 ? " is" : "s are"} currently waiting in the live queue.` });
    }

    if (query.includes("doctor") || query.includes("available")) {
      const rows = await db.select({ name: users.name, specialization: users.specialization, weekly: doctorAvailability.weekly }).from(users).leftJoin(doctorAvailability, eq(users.id, doctorAvailability.doctorUserId)).where(eq(users.role, "doctor")).orderBy(asc(users.name));
      return Response.json({ ok: true, kind: "doctors", text: rows.length ? rows.map((row) => `${row.name} · ${row.specialization ?? "Medical Officer"}`).join("\n") : "No doctor profiles are available yet." });
    }

    return Response.json({ ok: true, kind: "help", text: "I can help with low stock, medication operations, pending prescriptions, today's appointments, doctor availability, and the waiting queue." });
  } catch {
    return Response.json({ ok: false, error: "CareOps could not reach the clinic data right now." }, { status: 500 });
  }
}

