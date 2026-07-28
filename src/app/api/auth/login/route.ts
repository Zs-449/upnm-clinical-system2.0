import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const { email, password, role } = await req.json();
    if (!email || !password) {
      return Response.json(
        { ok: false, error: "Email and password are required." },
        { status: 400 }
      );
    }
    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, String(email).toLowerCase().trim()))
      .limit(1);

    const user = found[0];
    if (!user) {
      return Response.json(
        { ok: false, error: "No account found for this email." },
        { status: 401 }
      );
    }
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return Response.json(
        { ok: false, error: "Incorrect password. Try again." },
        { status: 401 }
      );
    }
    if (role && role !== user.role) {
      return Response.json(
        {
          ok: false,
          error: `This account is registered as "${user.role}", not "${role}".`,
        },
        { status: 403 }
      );
    }
    return Response.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatarColor: user.avatarColor,
        specialization: user.specialization,
      },
    });
  } catch {
    return Response.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
