"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Eye, EyeOff, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { Toaster, toast } from "@/components/ui";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [status, setStatus] = useState<"loading" | "valid" | "invalid" | "success">("loading");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [invalidMsg, setInvalidMsg] = useState("");

  // Validate the token on mount
  useEffect(() => {
    if (!token) {
      setStatus("invalid");
      setInvalidMsg("No reset token found. Please request a new password reset link.");
      return;
    }

    fetch(`/api/auth/verify-reset-token?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.ok) {
          setUserEmail(data.email);
          setUserName(data.name);
          setStatus("valid");
        } else {
          setStatus("invalid");
          setInvalidMsg(data.error || "This reset link is invalid or has expired.");
        }
      })
      .catch(() => {
        setStatus("invalid");
        setInvalidMsg("Unable to verify the reset link. Please try again.");
      });
  }, [token]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");

    if (newPassword.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setErrorMsg("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, newPassword }),
      });
      const data = await res.json();
      setSubmitting(false);

      if (!data.ok) {
        setErrorMsg(data.error || "Failed to reset password.");
        return;
      }

      setStatus("success");
      toast("Password updated successfully!", "success");
    } catch {
      setSubmitting(false);
      setErrorMsg("Network error. Please try again.");
    }
  }

  // Password strength indicator
  const strength = (() => {
    if (!newPassword) return 0;
    let s = 0;
    if (newPassword.length >= 6) s++;
    if (newPassword.length >= 10) s++;
    if (/[A-Z]/.test(newPassword)) s++;
    if (/[0-9]/.test(newPassword)) s++;
    if (/[^A-Za-z0-9]/.test(newPassword)) s++;
    return s;
  })();

  const strengthLabel = ["", "Weak", "Fair", "Good", "Strong", "Very Strong"][strength];
  const strengthColor = ["", "#ef4444", "#f59e0b", "#3b82f6", "#22c55e", "#2ECC8F"][strength];

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f7f3ec] p-6 dark:bg-[#0f1f1a]">
      <Toaster />

      {/* Background blobs */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="blob absolute left-[-10%] top-[-10%] h-[400px] w-[400px] bg-cyan/20" />
        <div className="blob absolute right-[-10%] bottom-[-10%] h-[350px] w-[350px] bg-mint/15" style={{ animationDelay: "-7s" }} />
      </div>

      <div className="glass relative w-full max-w-md rounded-[28px] p-8 shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-navy to-[#2d5551] shadow-lg">
            <ShieldCheck className="h-8 w-8 text-white" />
          </div>
          <h1 className="font-[Poppins] text-2xl font-extrabold tracking-tight text-navy dark:text-white">
            Reset Password
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            UPNM Smart Clinical System
          </p>
        </div>

        {/* Loading state */}
        {status === "loading" && (
          <div className="flex flex-col items-center gap-4 py-8">
            <Loader2 className="h-10 w-10 animate-spin text-mint" />
            <p className="text-sm text-slate-500">Verifying your reset link…</p>
          </div>
        )}

        {/* Invalid token state */}
        {status === "invalid" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-danger/10">
              <AlertCircle className="h-8 w-8 text-danger" />
            </div>
            <div className="text-center">
              <h2 className="font-semibold text-navy dark:text-white">Link Invalid or Expired</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{invalidMsg}</p>
            </div>
            <Link
              href="/login"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-navy py-3 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
            >
              Back to Sign In
            </Link>
            <p className="text-center text-xs text-slate-400">
              Need a new link?{" "}
              <Link href="/login" className="font-semibold text-mint hover:underline">
                Request password reset
              </Link>
            </p>
          </div>
        )}

        {/* Success state */}
        {status === "success" && (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mint/10">
              <CheckCircle2 className="h-8 w-8 text-mint" />
            </div>
            <div className="text-center">
              <h2 className="font-semibold text-navy dark:text-white">Password Updated!</h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Your password has been successfully reset. You can now sign in with your new password.
              </p>
            </div>
            <Link
              href="/login"
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-[#1a4a82] to-[#2d5551] py-3 text-sm font-semibold text-white shadow-xl shadow-navy/30 transition hover:brightness-110"
            >
              Sign In Now
            </Link>
          </div>
        )}

        {/* Valid token — show reset form */}
        {status === "valid" && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="rounded-xl border border-navy/10 bg-slate-50/80 px-4 py-3 dark:border-white/10 dark:bg-white/5">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Resetting password for</p>
              <p className="mt-0.5 text-sm font-semibold text-navy dark:text-white">{userName}</p>
              <p className="text-xs text-slate-400">{userEmail}</p>
            </div>

            {/* New password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">New Password</label>
              <div className="relative">
                <input
                  type={showPw ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Enter new password"
                  required
                  minLength={6}
                  className="w-full rounded-xl border border-navy/15 bg-white/70 px-4 py-3 pr-10 text-sm outline-none transition-all focus:border-mint focus:bg-white focus:ring-4 focus:ring-mint/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((s) => !s)}
                  className="absolute right-3 top-3 text-slate-400 hover:text-navy dark:hover:text-white"
                >
                  {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {/* Strength bar */}
              {newPassword && (
                <div className="space-y-1">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <div
                        key={i}
                        className="h-1 flex-1 rounded-full transition-all duration-300"
                        style={{ background: i <= strength ? strengthColor : "#e2e8f0" }}
                      />
                    ))}
                  </div>
                  <p className="text-[11px] font-medium" style={{ color: strengthColor }}>
                    {strengthLabel}
                  </p>
                </div>
              )}
            </div>

            {/* Confirm password */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Confirm Password</label>
              <input
                type={showPw ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                required
                minLength={6}
                className={`w-full rounded-xl border bg-white/70 px-4 py-3 text-sm outline-none transition-all focus:ring-4 dark:bg-white/5 dark:text-white ${
                  confirmPassword && confirmPassword !== newPassword
                    ? "border-danger/50 focus:border-danger focus:ring-danger/10"
                    : confirmPassword && confirmPassword === newPassword
                    ? "border-mint/50 focus:border-mint focus:ring-mint/10"
                    : "border-navy/15 focus:border-mint focus:ring-mint/10 dark:border-white/10"
                }`}
              />
              {confirmPassword && confirmPassword !== newPassword && (
                <p className="text-[11px] text-danger">Passwords do not match</p>
              )}
              {confirmPassword && confirmPassword === newPassword && (
                <p className="text-[11px] text-mint">Passwords match ✓</p>
              )}
            </div>

            {errorMsg && (
              <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-xs font-medium text-danger">
                <AlertCircle className="h-4 w-4 shrink-0" /> {errorMsg}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="ripple flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-[#1a4a82] to-[#2d5551] bg-[length:200%_auto] py-3.5 font-semibold text-white shadow-xl shadow-navy/30 transition-all hover:bg-right hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 animated-gradient"
            >
              {submitting ? (
                <>
                  <span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
                  Updating password…
                </>
              ) : (
                "Set New Password"
              )}
            </button>

            <p className="text-center text-xs text-slate-400">
              Remember your password?{" "}
              <Link href="/login" className="font-semibold text-mint hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        )}
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-[#f7f3ec] dark:bg-[#0f1f1a]">
        <div className="spinner h-10 w-10 rounded-full border-4 border-navy/20 border-t-navy" />
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
