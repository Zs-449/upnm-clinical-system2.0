import { db } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

/**
 * POST /api/auth/reset-password
 * Body: { token: string, newPassword: string }
 *
 * Validates the reset token (expiry + single-use), updates the user's
 * password, and marks the token as used.
 */
export async function POST(req: Request) {
  try {
    const { token, newPassword } = await req.json();

    if (!token || !newPassword) {
      return Response.json(
        { ok: false, error: "Reset token and new password are required." },
        { status: 400 }
      );
    }

    if (String(newPassword).length < 6) {
      return Response.json(
        { ok: false, error: "New password must be at least 6 characters." },
        { status: 400 }
      );
    }

    // Find the token record
    let found;
    try {
      found = await db
        .select()
        .from(passwordResetTokens)
        .where(eq(passwordResetTokens.token, String(token)))
        .limit(1);
    } catch {
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

    // Hash the new password
    const hashed = await bcrypt.hash(newPassword, 10);

    // Update the user's password
    await db
      .update(users)
      .set({ password: hashed })
      .where(eq(users.id, record.userId));

    // Mark token as used (single-use enforcement)
    await db
      .update(passwordResetTokens)
      .set({ used: true })
      .where(eq(passwordResetTokens.id, record.id));

    return Response.json({ ok: true });
  } catch (err) {
    console.error("Reset password error:", err);
    return Response.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}
