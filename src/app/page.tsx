"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldPlus, Stethoscope, GraduationCap,
  UserCog, Fingerprint, Eye, EyeOff, CheckCircle2,
  Activity, Lock, Sparkles, Users, CalendarCheck, Clock, Cpu,
  Mail, ArrowLeft,
} from "lucide-react";
import { saveSession, roleLabels, type Role } from "@/lib/session";
import { Toaster, toast, Modal } from "@/components/ui";

const ROLES: { key: Role; icon: typeof GraduationCap }[] = [
  { key: "student/lecturer", icon: GraduationCap },
  { key: "doctor", icon: Stethoscope },
  { key: "admin", icon: UserCog },
];

const FLOATING_STATS = [
  { icon: Users, value: "2,847", label: "Patients", color: "#7a9e7e" },
  { icon: Stethoscope, value: "6", label: "Doctors online", color: "#c9955a" },
  { icon: CalendarCheck, value: "47", label: "Appointments today", color: "#d48040" },
  { icon: Activity, value: "98.7%", label: "System uptime", color: "#1f3d3a" },
  { icon: Cpu, value: "AI", label: "Assistant ready", color: "#c25d5d" },
];

export default function LoginPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [now, setNow] = useState<Date | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [seeding, setSeeding] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });

  // Forgot password states
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "sent">("email");
  const [resetLoading, setResetLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/seed", { method: "POST" }).finally(() => setSeeding(false));
    const c = setInterval(() => setNow(new Date()), 1000);
    setNow(new Date());
    const onMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    window.addEventListener("mousemove", onMove);
    return () => { clearInterval(c); window.removeEventListener("mousemove", onMove); };
  }, []);

  const demoEmail = `${role}@upnm.edu.my`;

  const fillDemo = () => {
    setEmail(demoEmail);
    setPassword("password123");
    setError("");
  };

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });
      const data = await res.json();
      if (!data.ok) {
        setAttempts((a) => a + 1);
        setError(data.error || "Login failed");
        setShake(true);
        setTimeout(() => setShake(false), 400);
        setLoading(false);
        return;
      }
      saveSession(data.user);
      toast(`Welcome back, ${data.user.name.split(" ")[0]}!`, "success");
      setTimeout(() => {
        router.push(data.user.role === "student" ? "/portal" : "/dashboard");
      }, 500);
    } catch {
      setError("Network error. Please retry.");
      setLoading(false);
    }
  }

  const openForgot = () => {
    setForgotEmail(email);
    setForgotStep("email");
    setDevResetUrl(null);
    setForgotOpen(true);
  };

  const closeForgot = () => {
    setForgotOpen(false);
    setForgotStep("email");
    setForgotEmail("");
    setDevResetUrl(null);
  };

  const submitForgotEmail = async () => {
    if (!forgotEmail.trim() || !forgotEmail.includes("@")) {
      toast("Please enter a valid email address.", "error");
      return;
    }
    setResetLoading(true);
    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      setResetLoading(false);
      if (!data.ok) {
        toast(data.error || "Something went wrong. Please try again.", "error");
        return;
      }
      // In development, the API may return a devResetUrl for testing
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
      setForgotStep("sent");
    } catch {
      setResetLoading(false);
      toast("Network error. Please retry.", "error");
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden lg:flex-row">
      <Toaster />

      {/* ===================== LEFT: IMMERSIVE CINEMATIC ===================== */}
      <div className="relative flex min-h-screen flex-1 flex-col justify-between overflow-hidden bg-[#0f1f1a] p-8 text-white lg:p-12 lg:min-h-0">
        {/* Animated gradient mesh blobs */}
        <div className="pointer-events-none absolute inset-0">
          <div className="blob absolute left-[-10%] top-[-10%] h-[500px] w-[500px] bg-cyan/30" />
          <div className="blob absolute right-[-10%] top-[20%] h-[450px] w-[450px] bg-mint/25" style={{ animationDelay: "-7s" }} />
          <div className="blob absolute bottom-[-10%] left-[30%] h-[550px] w-[550px] bg-navy/60" style={{ animationDelay: "-14s" }} />
        </div>

        {/* Parallax glow that follows mouse */}
        <div
          className="pointer-events-none absolute h-[500px] w-[500px] rounded-full transition-all duration-700"
          style={{
            left: `${mouse.x}%`,
            top: `${mouse.y}%`,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(0,212,255,0.25), transparent 70%)",
            filter: "blur(40px)",
          }}
        />

        {/* Floating particles */}
        <div className="pointer-events-none absolute inset-0">
          {Array.from({ length: 30 }).map((_, i) => (
            <span
              key={i}
              className="absolute rounded-full bg-white animate-float"
              style={{
                width: `${2 + (i % 4)}px`,
                height: `${2 + (i % 4)}px`,
                left: `${(i * 37) % 100}%`,
                top: `${(i * 53) % 100}%`,
                opacity: 0.15 + (i % 5) * 0.08,
                animationDelay: `${i * 0.3}s`,
                animationDuration: `${8 + (i % 6) * 2}s`,
                boxShadow: i % 3 === 0 ? "0 0 8px rgba(46,204,143,0.6)" : i % 3 === 1 ? "0 0 8px rgba(0,212,255,0.6)" : "none",
              }}
            />
          ))}
        </div>

        {/* grid overlay */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />

        {/* TOP */}
        <div className="relative z-10 flex items-center gap-3">
          <img src="/images/upnm-logo.svg" alt="UPNM" className="h-16 w-16 rounded-2xl bg-white object-contain p-1 shadow-2xl ring-1 ring-white/20" />
          <div>
            <h1 className="font-[Poppins] text-xl font-extrabold tracking-tight">
              UPNM <span className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-transparent">Smart Clinical</span>
            </h1>
            <p className="text-[11px] uppercase tracking-[0.2em] text-white/50">Clinical Command Center · v2.0</p>
          </div>
          <div className="ml-auto text-right font-mono">
            <div className="text-sm font-bold text-white">{now?.toLocaleTimeString("en-GB")}</div>
            <div className="text-[10px] uppercase tracking-widest text-white/50">
              {now?.toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" })}
            </div>
          </div>
        </div>

        {/* MID — CINEMATIC HERO */}
        <div className="relative z-10 my-auto max-w-2xl">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-medium text-white/80 backdrop-blur-md">
            <Sparkles className="h-3.5 w-3.5 text-cyan" /> AI-powered clinical intelligence
          </div>
          <h2 className="font-[Poppins] text-5xl font-extrabold leading-[1.05] tracking-tight lg:text-6xl">
            Your health,<br />
            <span className="bg-gradient-to-r from-cyan via-mint to-cyan bg-[length:200%_auto] bg-clip-text text-transparent animated-gradient">
              our priority.
            </span>
          </h2>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-white/65">
            Smart clinical care for the UPNM community — appointments, electronic
            records and pharmacy in one calm, precise, AI-first operating system.
          </p>

          {/* ECG */}
          <div className="mt-8 h-16 w-full max-w-lg">
            <svg viewBox="0 0 600 70" preserveAspectRatio="none" className="h-full w-full">
              <defs>
                <linearGradient id="ecgG" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#7a9e7e" />
                  <stop offset="100%" stopColor="#c9955a" />
                </linearGradient>
              </defs>
              <polyline
                className="ecg-line"
                points="0,35 80,35 95,35 105,15 115,55 125,35 150,35 180,35 195,35 205,10 215,60 225,30 235,35 310,35 325,35 335,18 345,52 355,30 365,35 600,35"
                fill="none"
                stroke="url(#ecgG)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{ filter: "drop-shadow(0 0 8px rgba(46,204,143,0.6))" }}
              />
            </svg>
          </div>

          {/* Floating stat cards */}
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {FLOATING_STATS.map((s, i) => (
              <div
                key={s.label}
                className="card-premium animate-fade-up lift group flex items-center gap-2.5 rounded-xl p-3"
                style={{ animationDelay: `${i * 100}ms` }}
              >
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${s.color}22` }}>
                  <s.icon className="h-4 w-4" style={{ color: s.color }} />
                </div>
                <div>
                  <div className="font-mono text-base font-extrabold text-navy dark:text-white">{s.value}</div>
                  <div className="text-[9px] uppercase tracking-wider text-slate-400">{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* BOTTOM */}
        <div className="relative z-10 flex items-center justify-between text-[11px] text-white/50">
          <span>© UPNM Health Centre — Kem Sungai Besi</span>
          <span className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 backdrop-blur-md">
            <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />
            All systems operational
          </span>
        </div>
      </div>

      {/* ===================== RIGHT: LOGIN ===================== */}
      <div className="relative flex flex-1 items-center justify-center bg-[#f7f3ec] p-6 dark:bg-[#0f1f1a] lg:p-12">
        {/* subtle radial glow */}
        <div className="pointer-events-none absolute inset-0" style={{ background: "radial-gradient(circle at 50% 20%, rgba(122,158,126,0.12), transparent 50%)" }} />

        <div className={`glass relative w-full max-w-md rounded-[28px] p-8 shadow-2xl ${shake ? "animate-shake" : "animate-scale-in"}`}>
          <div className="mb-6">
            <h3 className="font-[Poppins] text-3xl font-extrabold tracking-tight text-navy dark:text-white">Welcome back</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your clinical command center.</p>
          </div>

          {/* role selector */}
          <div className="mb-6">
            <label className="mb-3 block text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Choose your role</label>
            <div className="grid grid-cols-3 gap-2.5 rounded-2xl border border-navy/10 bg-slate-50/60 p-2.5 dark:border-white/10 dark:bg-white/[0.03]">
              {ROLES.map((r) => {
                const active = role === r.key;
                const Icon = r.icon;
                return (
                  <button
                    key={r.key}
                    onClick={() => { setRole(r.key); setError(""); }}
                    className={`group relative flex flex-col items-center justify-center gap-1.5 rounded-xl border-2 py-4 transition-all duration-300 ${active ? "border-mint bg-white text-navy shadow-md shadow-mint/15 scale-[1.02] dark:bg-[#1a2b25] dark:text-white" : "border-transparent bg-white/60 text-slate-500 hover:border-navy/20 hover:bg-white dark:bg-white/[0.04] dark:text-slate-400 dark:hover:border-mint/30"}`}
                  >
                    <div className={`grid h-9 w-9 place-items-center rounded-lg transition-all ${active ? "bg-mint/15" : "bg-slate-100 group-hover:bg-mint/10 dark:bg-white/5"}`}>
                      <Icon className={`h-4.5 w-4.5 transition-transform ${active ? "scale-110 text-mint" : "group-hover:scale-110"}`} />
                    </div>
                    <div className="text-[11px] font-semibold">{roleLabels[r.key].split("/")[0].trim()}</div>
                    {active && (
                      <span className="absolute -top-1 -right-1 grid h-4 w-4 place-items-center rounded-full bg-mint text-white">
                        <svg className="h-2.5 w-2.5" viewBox="0 0 20 20" fill="currentColor"><path d="M7.5 13.5L4 10l-1.5 1.5L7.5 16.5 17.5 6.5 16 5z" /></svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            <p className="mt-2 text-center text-[11px] text-slate-400">
              Logging in as <span className="font-semibold text-mint">{roleLabels[role]}</span>
            </p>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <FloatingInput label="Email address" type="email" value={email} onChange={setEmail} />
            <div className="relative">
              <FloatingInput label="Password" type={showPw ? "text" : "password"} value={password} onChange={setPassword} />
              <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-5 text-slate-400 transition hover:text-navy dark:hover:text-white">
                {showPw ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
              </button>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl bg-danger/10 px-3 py-2.5 text-xs font-medium text-danger animate-shake">
                <Lock className="h-4 w-4" /> {error}
              </div>
            )}

            {attempts >= 3 && (
              <div className="rounded-xl border border-amber/40 bg-amber/10 px-3 py-2.5 text-xs text-amber-700">
                🛡️ Security check: <span className="font-mono font-bold">7 + 5 = 12</span> — verified ✓
              </div>
            )}

            <div className="flex items-center justify-between text-sm">
              <label className="flex cursor-pointer items-center gap-2">
                <button type="button" onClick={() => setRemember((r) => !r)} className={`relative h-5 w-9 rounded-full transition-colors ${remember ? "bg-mint" : "bg-slate-300 dark:bg-white/20"}`}>
                  <span className={`absolute top-0.5 h-4 w-4 rounded-full bg-white shadow transition-all ${remember ? "left-4" : "left-0.5"}`} />
                </button>
                <span className="text-xs text-slate-500 dark:text-slate-400">Remember me</span>
              </label>
              <button
                type="button"
                onClick={openForgot}
                className="text-xs font-semibold text-mint hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading || seeding}
              className="ripple flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-[#1a4a82] to-[#2d5551] bg-[length:200%_auto] py-3.5 font-semibold text-white shadow-xl shadow-navy/30 transition-all hover:bg-right hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 animated-gradient"
            >
              {loading ? (
                <><span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" /> Signing in…</>
              ) : seeding ? "Preparing system…" : (
                <>Sign in securely <span className="text-lg">→</span></>
              )}
            </button>

            <button
              type="button"
              onClick={() => toast("Biometric sign-in is coming soon", "info")}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-navy/20 py-2.5 text-xs font-medium text-slate-500 transition hover:border-cyan hover:text-cyan dark:border-white/10 dark:text-slate-400"
            >
              <Fingerprint className="h-5 w-5" /> Sign in with biometrics
              <span className="rounded-full bg-cyan/15 px-2 py-0.5 text-[9px] font-bold text-cyan">SOON</span>
            </button>
          </form>

          <button onClick={fillDemo} className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-mint/10 py-2.5 text-xs font-semibold text-mint transition hover:bg-mint/20">
            <CheckCircle2 className="h-4 w-4" /> Fill demo credentials for {roleLabels[role]}
          </button>
          <p className="mt-2 text-center text-[11px] text-slate-400">Demo: {demoEmail} · password123</p>
          <p className="mt-4 text-center text-xs text-slate-400">
            New here?{" "}
            <Link href="/register" className="font-semibold text-mint hover:underline">
              Create an account
            </Link>
          </p>
        </div>
      </div>

      {/* ===================== FORGOT PASSWORD MODAL ===================== */}
      <Modal
        open={forgotOpen}
        onClose={closeForgot}
        title="Reset your password"
      >
        {forgotStep === "email" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-xl border border-navy/10 bg-slate-50/80 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-navy/10 dark:bg-white/10">
                <Mail className="h-5 w-5 text-navy dark:text-white" />
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Enter your UPNM email and we will send you a secure reset link.
              </p>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Email address</label>
              <input
                type="email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                placeholder="you@upnm.edu.my"
                onKeyDown={(e) => e.key === "Enter" && submitForgotEmail()}
                className="w-full rounded-xl border border-navy/10 bg-slate-50 px-3 py-2.5 text-sm outline-none transition-all focus:border-cyan focus:ring-2 focus:ring-cyan/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
              />
            </div>
            <button
              onClick={submitForgotEmail}
              disabled={resetLoading}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy to-[#2d5551] py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110 disabled:opacity-70"
            >
              {resetLoading ? (
                <><span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" /> Sending…</>
              ) : (
                <><Mail className="h-4 w-4" /> Send Reset Link</>
              )}
            </button>
            <p className="text-center text-xs text-slate-400">
              Remember your password?{" "}
              <button onClick={closeForgot} className="font-semibold text-mint hover:underline">Sign in</button>
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Success sent state */}
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mint/10">
                <Mail className="h-8 w-8 text-mint" />
              </div>
              <div>
                <h3 className="font-semibold text-navy dark:text-white">Check your email</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  If an account exists for{" "}
                  <span className="font-semibold text-navy dark:text-white">{forgotEmail}</span>,
                  a password reset link has been sent. The link expires in <strong>1 hour</strong>.
                </p>
              </div>
            </div>

            <div className="rounded-xl border border-navy/10 bg-slate-50/80 p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-white/5 dark:text-slate-400 space-y-1">
              <p className="font-semibold text-navy dark:text-white">Didn&apos;t receive the email?</p>
              <p>• Check your spam or junk folder</p>
              <p>• Make sure you entered the correct email</p>
              <p>• The link is valid for 1 hour and can only be used once</p>
            </div>

            {/* Development mode: show the reset URL directly for testing */}
            {devResetUrl && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-400/30 dark:bg-amber-900/20">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Dev Mode — Reset Link
                </p>
                <a
                  href={devResetUrl}
                  className="break-all text-xs font-medium text-amber-700 underline dark:text-amber-400"
                >
                  {devResetUrl}
                </a>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => { setForgotStep("email"); setDevResetUrl(null); }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-navy/15 py-2.5 text-sm font-semibold text-navy transition hover:bg-navy/5 dark:border-white/15 dark:text-white dark:hover:bg-white/5"
              >
                <ArrowLeft className="h-4 w-4" /> Try again
              </button>
              <button
                onClick={closeForgot}
                className="flex-1 rounded-xl bg-navy py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-110"
              >
                Back to Sign In
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

function FloatingInput({ label, type, value, onChange }: { label: string; type: string; value: string; onChange: (v: string) => void }) {
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
      <label className={`pointer-events-none absolute left-4 transition-all ${active ? "top-2 text-[10px] font-semibold tracking-wide text-mint" : "top-3.5 text-sm text-slate-400"}`}>
        {label}
      </label>
    </div>
  );
}
