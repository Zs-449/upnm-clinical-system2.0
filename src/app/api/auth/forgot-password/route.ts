import { db, pool } from "@/db";
import { users, passwordResetTokens } from "@/db/schema";
import { eq } from "drizzle-orm";
import crypto from "crypto";

export const dynamic = "force-dynamic";

// Ensure the password_reset_tokens table exists (idempotent)
async function ensureTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL,
        token VARCHAR(128) NOT NULL UNIQUE,
        expires_at TIMESTAMP NOT NULL,
        used BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT NOW() NOT NULL
      )
    `);
  } catch {
    // Table likely already exists — safe to ignore
  }
}

export async function POST(req: Request) {
  try {
    await ensureTable();

    const { email } = await req.json();

    if (!email || !String(email).includes("@")) {
      return Response.json(
        { ok: false, error: "A valid email address is required." },
        { status: 400 }
      );
    }

    const normalizedEmail = String(email).toLowerCase().trim();

    // Look up the user
    const found = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    // Always return success to prevent email enumeration
    if (!found[0]) {
      return Response.json({
        ok: true,
        message: "If an account exists for this email, a reset link has been sent.",
      });
    }

    const user = found[0];

    // Generate a secure random token
    const token = crypto.randomBytes(48).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing unused tokens for this user
    await pool.query(
      `UPDATE password_reset_tokens SET used = TRUE WHERE user_id = $1 AND used = FALSE`,
      [user.id]
    );

    // Insert new token
    await db.insert(passwordResetTokens).values({
      userId: user.id,
      token,
      expiresAt,
      used: false,
    });

    // Build the reset URL
    const host = req.headers.get("host") || "localhost:3000";
    const proto = req.headers.get("x-forwarded-proto") || "http";
    const origin = `${proto}://${host}`;
    const resetUrl = `${origin}/reset-password?token=${token}`;

    // Try to send the email
    const emailSent = await sendResetEmail(user.email, user.name, resetUrl);

    const isDev = process.env.NODE_ENV !== "production";

    return Response.json({
      ok: true,
      message: "If an account exists for this email, a reset link has been sent.",
      // Expose the URL in non-production for testing (no real email service configured)
      ...(isDev && !emailSent ? { devResetUrl: resetUrl } : {}),
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return Response.json({ ok: false, error: "Server error." }, { status: 500 });
  }
}

async function sendResetEmail(
  toEmail: string,
  toName: string,
  resetUrl: string
): Promise<boolean> {
  try {
    // Try nodemailer with SMTP env vars
    const smtpHost = process.env.SMTP_HOST;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;
    const smtpPort = parseInt(process.env.SMTP_PORT || "587");
    const fromEmail = process.env.SMTP_FROM || "noreply@upnm.edu.my";

    if (smtpHost && smtpUser && smtpPass) {
      const nodemailer = await import("nodemailer").catch(() => null);
      if (nodemailer) {
        const transporter = nodemailer.default.createTransport({
          host: smtpHost,
          port: smtpPort,
          secure: smtpPort === 465,
          auth: { user: smtpUser, pass: smtpPass },
        });
        await transporter.sendMail({
          from: `"UPNM Smart Clinical System" <${fromEmail}>`,
          to: toEmail,
          subject: "Reset Your UPNM SCS Password",
          html: buildEmailHtml(toName, resetUrl),
          text: buildEmailText(toName, resetUrl),
        });
        return true;
      }
    }

    // Try SendGrid if configured
    const sendgridKey = process.env.SENDGRID_API_KEY;
    if (sendgridKey) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${sendgridKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email: toEmail, name: toName }] }],
          from: { email: "noreply@upnm.edu.my", name: "UPNM Smart Clinical System" },
          subject: "Reset Your UPNM SCS Password",
          content: [
            { type: "text/plain", value: buildEmailText(toName, resetUrl) },
            { type: "text/html", value: buildEmailHtml(toName, resetUrl) },
          ],
        }),
      });
      return res.ok;
    }

    return false;
  } catch (err) {
    console.error("Email send error:", err);
    return false;
  }
}

function buildEmailHtml(name: string, resetUrl: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 20px;">
    <tr><td align="center">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:20px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">
        <tr>
          <td style="background:linear-gradient(135deg,#1B3A6B,#2d5551);padding:32px 40px;text-align:center;">
            <h1 style="margin:0;color:#ffffff;font-size:22px;font-weight:800;letter-spacing:-0.5px;">
              UPNM <span style="color:#2ECC8F;">Smart Clinical</span>
            </h1>
            <p style="margin:6px 0 0;color:rgba(255,255,255,0.6);font-size:12px;letter-spacing:2px;text-transform:uppercase;">Password Reset Request</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px;">
            <p style="margin:0 0 16px;color:#374151;font-size:16px;">Hi <strong>${name}</strong>,</p>
            <p style="margin:0 0 24px;color:#6B7280;font-size:14px;line-height:1.6;">
              We received a request to reset the password for your UPNM Smart Clinical System account.
              Click the button below to set a new password. This link is valid for <strong>1 hour</strong> and can only be used once.
            </p>
            <div style="text-align:center;margin:32px 0;">
              <a href="${resetUrl}"
                style="display:inline-block;background:linear-gradient(135deg,#1B3A6B,#2d5551);color:#ffffff;text-decoration:none;padding:14px 36px;border-radius:12px;font-size:15px;font-weight:700;letter-spacing:0.3px;">
                Reset My Password
              </a>
            </div>
            <p style="margin:0 0 8px;color:#9CA3AF;font-size:12px;">Or copy and paste this link into your browser:</p>
            <p style="margin:0 0 24px;word-break:break-all;">
              <a href="${resetUrl}" style="color:#2ECC8F;font-size:12px;">${resetUrl}</a>
            </p>
            <div style="border-top:1px solid #E5E7EB;padding-top:20px;margin-top:8px;">
              <p style="margin:0;color:#9CA3AF;font-size:12px;line-height:1.6;">
                If you did not request a password reset, you can safely ignore this email — your password will not be changed.<br><br>
                For security, this link expires in 1 hour and can only be used once.
              </p>
            </div>
          </td>
        </tr>
        <tr>
          <td style="background:#F9FAFB;padding:20px 40px;text-align:center;border-top:1px solid #E5E7EB;">
            <p style="margin:0;color:#9CA3AF;font-size:11px;">
              © UPNM Health Centre — Kem Sungai Besi<br>
              This is an automated message, please do not reply.
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;
}

function buildEmailText(name: string, resetUrl: string): string {
  return `Hi ${name},

We received a request to reset your UPNM Smart Clinical System password.

Click the link below to reset your password (valid for 1 hour, single-use):
${resetUrl}

If you did not request a password reset, please ignore this email — your password will not be changed.

© UPNM Health Centre — Kem Sungai Besi`;
}
