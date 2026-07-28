import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { name, email, password, role, specialization } = await req.json();

    if (!name || !email || !password || !role) {
      return Response.json(
        { ok: false, error: "Name, email, password and role are required." },
        { status: 400 }
      );
    }
    if (password.length < 6) {
      return Response.json(
        { ok: false, error: "Password must be at least 6 characters." },
        { status: 400 }
      );
    }
    if (!["student/lecturer", "doctor", "admin"].includes(role)) {
      return Response.json({ ok: false, error: "Invalid role." }, { status: 400 });
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing[0]) {
      return Response.json(
        { ok: false, error: "An account with this email already exists." },
        { status: 409 }
      );
    }

    const hashed = await bcrypt.hash(password, 10);

    const [created] = await db
      .insert(users)
      .values({
        name,
        email: normalizedEmail,
        password: hashed,
        role,
        specialization: specialization || null,
        avatarColor: "#1B3A6B",
        online: true,
      })
      .returning();

    return Response.json({
      ok: true,
      user: {
        id: created.id,
        name: created.name,
        email: created.email,
        role: created.role,
        avatarColor: created.avatarColor,
        specialization: created.specialization,
      },
    });
  } catch {
    return Response.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
