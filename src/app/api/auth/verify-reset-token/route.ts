import { db } from "@/db";
import { passwordResetTokens, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return Response.json(
        { ok: false, error: "Reset token is required." },
        { status: 400 }
      );
    }

    // Find the token record
    let found;
    try {
      found = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, token))
        .limit(1);
    } catch {
      // Table might not exist yet
      return Response.json(
        { ok: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 404 }
      );
    }

    const record = found[0];

    if (!record) {
      return Response.json(
        { ok: false, error: "Invalid or expired reset link. Please request a new one." },
        { status: 404 }
      );
    }

    if (record.used) {
      return Response.json(
        { ok: false, error: "This reset link has already been used. Please request a new one." },
        { status: 410 }
      );
    }

    if (new Date() > new Date(record.expiresAt)) {
      return Response.json(
        { ok: false, error: "This reset link has expired. Please request a new one." },
        { status: 410 }
      );
    }

    // Get the user's info for display
    const userFound = await db
      .select({ email: users.email, name: users.name })
      .from(users)
      .where(eq(users.id, record.userId))
      .limit(1);

    const user = userFound[0];
    if (!user) {
      return Response.json(
        { ok: false, error: "Account not found." },
        { status: 404 }
      );
    }

    return Response.json({
      ok: true,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    console.error("Verify token error:", err);
    return Response.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
