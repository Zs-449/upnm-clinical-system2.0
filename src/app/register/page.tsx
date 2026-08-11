"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { GraduationCap, Stethoscope, UserCog, Eye, EyeOff, BookOpen } from "lucide-react";
import { saveSession, roleLabels, type Role } from "@/lib/session";
import { Toaster, toast } from "@/components/ui";

const ROLES: { key: Role; icon: typeof GraduationCap }[] = [
  { key: "student/lecturer", icon: GraduationCap },
  { key: "doctor", icon: Stethoscope },
  { key: "admin", icon: UserCog },
];

export default function RegisterPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student/lecturer");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [specialization, setSpecialization] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (!name.trim() || !email.trim() || !password) {
      setError("Please fill in all required fields.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, specialization }),
      });
      const data = await res.json();
      setLoading(false);
      if (!data.ok) {
        setError(data.error || "Registration failed.");
        return;
      }
      saveSession(data.user);
      toast(`Welcome, ${data.user.name.split(" ")[0]}!`, "success");
      setTimeout(() => {
        router.push(data.user.role === "student/lecturer" ? "/portal" : "/dashboard");
      }, 400);
    } catch {
      setLoading(false);
      setError("Network error. Please retry.");
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-[#f7f3ec] p-6 dark:bg-[#0f1f1a]">
      <Toaster />
      <div className="glass relative w-full max-w-md rounded-[28px] p-8 shadow-2xl">
        <div className="mb-6">
          <h3 className="font-[Poppins] text-3xl font-extrabold tracking-tight text-navy dark:text-white">
            Create account
          </h3>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Register for UPNM Smart Clinical System.
          </p>
        </div>

        <div className="mb-6">
          <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">
            I am a
          </label>
          <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-navy/10 bg-slate-50/60 p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
            {ROLES.map((r) => {
              const active = role === r.key;
              const Icon = r.icon;
              return (
                <button
                  key={r.key}
                  type="button"
                  onClick={() => setRole(r.key)}
                  className={`flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-4 transition-all duration-300 ${
                    active
                      ? "border-mint bg-white text-navy shadow-md shadow-mint/15 dark:bg-[#1a2b25] dark:text-white"
                      : "border-transparent bg-white/60 text-slate-500 hover:border-navy/20 dark:bg-white/[0.04] dark:text-slate-400"
                  }`}
                >
                  <Icon className="h-4.5 w-4.5" />
                  <div className="text-[11px] font-semibold">{roleLabels[r.key].split("/")[0].trim()}</div>
                </button>
              );
            })}
          </div>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <Input label="Full name" value={name} onChange={setName} />
          <Input label="Email address" type="email" value={email} onChange={setEmail} />
          {role === "doctor" && (
            <Input label="Specialization" value={specialization} onChange={setSpecialization} />
          )}
          <div className="relative">
            <Input label="Password" type={showPw ? "text" : "password"} value={password} onChange={setPassword} />
            <button
              type="button"
              onClick={() => setShowPw((s) => !s)}
              className="absolute right-3 top-5 text-slate-400 hover:text-navy dark:hover:text-white"
            >
              {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          <Input label="Confirm password" type={showPw ? "text" : "password"} value={confirm} onChange={setConfirm} />

          {error && (
            <div className="rounded-xl bg-danger/10 px-3 py-2.5 text-xs font-medium text-danger">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ripple flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-[#1a4a82] to-[#2d5551] bg-[length:200%_auto] py-3.5 font-semibold text-white shadow-xl shadow-navy/30 transition-all hover:bg-right disabled:opacity-70"
          >
            {loading ? (
              <>
                <span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" /> Creating
                account…
              </>
            ) : (
              "Create account"
            )}
          </button>
        </form>

        <p className="mt-5 text-center text-xs text-slate-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-mint hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

function Input({
  label,
  type = "text",
  value,
  onChange,
}: {
  label: string;
  type?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  const [focus, setFocus] = useState(false);
  const active = focus || value.length > 0;
  return (
    <div className="relative">
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocus(true)}
        onBlur={() => setFocus(false)}
        className="peer w-full rounded-xl border border-navy/15 bg-white/70 px-4 pt-5 pb-2.5 text-sm outline-none transition-all focus:border-mint focus:bg-white focus:ring-4 focus:ring-mint/10 dark:border-white/10 dark:bg-white/5 dark:text-white dark:focus:bg-white/10"
        required
      />
      <label
        className={`pointer-events-none absolute left-4 transition-all ${
          active ? "top-2 text-[10px] font-semibold tracking-wide text-mint" : "top-3.5 text-sm text-slate-400"
        }`}
      >
        {label}
      </label>
    </div>
  );
}
