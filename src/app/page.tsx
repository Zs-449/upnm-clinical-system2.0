"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldPlus, Stethoscope, GraduationCap,
  UserCog, Fingerprint, Eye, EyeOff, CheckCircle2,
  Activity, Lock, Sparkles, Users, CalendarCheck, Clock, Cpu,
  Mail, ArrowLeft, ArrowRight, LayoutDashboard, Pill, Package,
  ClipboardList, History, ShieldCheck, ChevronRight, Menu, X as CloseIcon, Zap,
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

const ECOSYSTEM_STEPS = [
  { id: "student", label: "Student", icon: GraduationCap, color: "#7a9e7e", desc: "Initiates request" },
  { id: "appointment", label: "Appointment", icon: CalendarCheck, color: "#c9955a", desc: "Automated scheduling" },
  { id: "emr", label: "Doctor / EMR", icon: Stethoscope, color: "#1f3d3a", desc: "Clinical consultation" },
  { id: "prescription", label: "Prescription", icon: Pill, color: "#c25d5d", desc: "Digital medication order" },
  { id: "pharmacy", label: "Pharmacy", icon: Package, color: "#d48040", desc: "Smart dispensing" },
  { id: "inventory", label: "Inventory", icon: Activity, color: "#7a9e7e", desc: "Real-time stock sync" },
  { id: "record", label: "Medical Record", icon: History, color: "#c9955a", desc: "Permanent persistence" },
  { id: "audit", label: "Activity Log", icon: ShieldCheck, color: "#1f3d3a", desc: "Immutable audit trail" },
];

const ROLE_FEATURES = {
  "student/lecturer": {
    title: "Patient Experience",
    subtitle: "Built for Students & Lecturers",
    description: "Access campus healthcare services with ease. Manage your appointments, view your medical history, and receive digital prescriptions all in one place.",
    features: ["Instant Appointment Booking", "Digital Prescription Access", "Personal Medical History", "Clinical Record Tracking"],
    previewColor: "mint",
  },
  "doctor": {
    title: "Clinical Excellence",
    subtitle: "Built for Healthcare Providers",
    description: "Empowering UPNM doctors with intelligent tools. Manage your daily queue, access comprehensive patient EMRs, and leverage AI-driven clinical recommendations.",
    features: ["Real-time Live Queue", "Comprehensive EMR System", "AI Clinical Insights", "Urgent Case Alerts"],
    previewColor: "cyan",
  },
  "admin": {
    title: "Operational Control",
    subtitle: "Built for Administrators",
    description: "Complete oversight of the UPNM Health Centre. Monitor system-wide activity, manage inventory levels, and ensure operational efficiency with advanced analytics.",
    features: ["System-wide Monitoring", "Inventory Management", "Immutable Activity Logs", "User & Role Management"],
    previewColor: "navy",
  },
};

export default function LandingPage() {
  const router = useRouter();
  const [role, setRole] = useState<Role>("student/lecturer");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [shake, setShake] = useState(false);
  const [now, setNow] = useState<Date>(new Date());
  const [attempts, setAttempts] = useState(0);
  const [seeding, setSeeding] = useState(true);
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [scrolled, setScrolled] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<Role>("student/lecturer");

  // Forgot password states
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotStep, setForgotStep] = useState<"email" | "sent">("email");
  const [resetLoading, setResetLoading] = useState(false);
  const [devResetUrl, setDevResetUrl] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/seed", { method: "POST" }).finally(() => setSeeding(false));
    const c = setInterval(() => setNow(new Date()), 1000);
    // Initial clock state handled by state initialization or first interval tick
    const onMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll);
    return () => { 
      clearInterval(c); 
      window.removeEventListener("mousemove", onMove); 
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const demoEmail = role === "student/lecturer" ? "student@upnm.edu.my" : `${role}@upnm.edu.my`;

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
        router.push(data.user.role === "student/lecturer" ? "/portal" : "/dashboard");
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
      if (data.devResetUrl) {
        setDevResetUrl(data.devResetUrl);
      }
      setForgotStep("sent");
    } catch {
      setResetLoading(false);
      toast("Network error. Please retry.", "error");
    }
  };

  const scrollToLogin = () => {
    const el = document.getElementById("login-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="relative min-h-screen bg-[#f7f3ec] text-[#2d2a24] dark:bg-[#0f1f1a] dark:text-[#e8e4da] selection:bg-mint/30">
      <Toaster />

      {/* ===================== NAVIGATION ===================== */}
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-500 ${scrolled ? "bg-white/80 py-3 shadow-lg backdrop-blur-xl dark:bg-[#0f1f1a]/80" : "bg-transparent py-6"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <img src="/images/upnm-logo.png" alt="UPNM" className="h-10 w-10 object-contain" />
            <div>
              <h1 className="font-[Poppins] text-lg font-extrabold tracking-tight text-navy dark:text-white">
                UPNM <span className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-transparent">CMS 2.0</span>
              </h1>
            </div>
          </div>
          <div className="hidden items-center gap-8 md:flex">
            {["Ecosystem", "Roles", "Intelligence", "Security"].map((item) => (
              <button
                key={item}
                onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
                className="text-xs font-bold uppercase tracking-widest text-slate-500 transition hover:text-mint dark:text-slate-400 dark:hover:text-cyan"
              >
                {item}
              </button>
            ))}
            <button
              onClick={scrollToLogin}
              className="rounded-full bg-navy px-6 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-navy/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 dark:bg-mint"
            >
              Access System
            </button>
          </div>
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* ===================== HERO SECTION ===================== */}
      <section className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0">
          <img src="/images/upnm-campus.png" alt="UPNM Campus" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f1a]/90 via-[#0f1f1a]/70 to-[#0f1f1a]/95" />
          
          {/* Parallax glow that follows mouse */}
          <div
            className="pointer-events-none absolute h-[600px] w-[600px] rounded-full transition-all duration-1000 opacity-30"
            style={{
              left: `${mouse.x}%`,
              top: `${mouse.y}%`,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(0,212,255,0.4), transparent 70%)",
              filter: "blur(60px)",
            }}
          />

          {/* grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "48px 48px" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
          <div className="animate-fade-up flex flex-col items-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan backdrop-blur-md">
              <Sparkles className="h-3.5 w-3.5" /> UPNM Health Centre
            </div>
            <h1 className="font-[Poppins] text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-8xl">
              UPNM CMS 2.0
            </h1>
            <h2 className="mt-2 font-[Poppins] text-2xl font-bold text-white/80 sm:text-3xl lg:text-4xl">
              Clinical Management System
            </h2>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60 lg:text-xl">
              One connected platform for modern campus healthcare. Integrated appointments, 
              electronic records, and pharmacy in one calm, precise, AI-first ecosystem.
            </p>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <button
                onClick={() => document.getElementById("ecosystem")?.scrollIntoView({ behavior: "smooth" })}
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-mint px-8 py-4 font-bold text-navy shadow-2xl transition-all hover:scale-105 hover:shadow-mint/30"
              >
                Explore Ecosystem <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </button>
              <button
                onClick={scrollToLogin}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                Access Portal
              </button>
            </div>

            {/* ECG Visual */}
            <div className="mt-16 h-12 w-full max-w-xl opacity-40">
              <svg viewBox="0 0 600 70" preserveAspectRatio="none" className="h-full w-full">
                <polyline
                  className="ecg-line"
                  points="0,35 80,35 95,35 105,15 115,55 125,35 150,35 180,35 195,35 205,10 215,60 225,30 235,35 310,35 325,35 335,18 345,52 355,30 365,35 600,35"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  style={{ filter: "drop-shadow(0 0 8px rgba(46,204,143,0.6))" }}
                />
              </svg>
            </div>

            {/* Floating stats */}
            <div className="mt-16 grid grid-cols-2 gap-4 sm:grid-cols-5">
              {FLOATING_STATS.map((s, i) => (
                <div
                  key={s.label}
                  className="card-premium animate-fade-up lift group flex flex-col items-center justify-center gap-2 rounded-2xl border-white/5 bg-white/5 p-4 text-white backdrop-blur-lg"
                  style={{ animationDelay: `${i * 100 + 500}ms` }}
                >
                  <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${s.color}33` }}>
                    <s.icon className="h-5 w-5" style={{ color: s.color }} />
                  </div>
                  <div>
                    <div className="font-mono text-xl font-extrabold">{s.value}</div>
                    <div className="text-[9px] font-bold uppercase tracking-widest text-white/40">{s.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <div className="h-10 w-6 rounded-full border-2 border-current p-1">
            <div className="h-2 w-1 mx-auto rounded-full bg-current" />
          </div>
        </div>
      </section>

      {/* ===================== ECOSYSTEM SECTION ===================== */}
      <section id="ecosystem" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-20 text-center">
            <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.3em] text-mint">Everything Connected</h2>
            <h3 className="mt-4 font-[Poppins] text-4xl font-extrabold tracking-tight text-navy dark:text-white lg:text-5xl">
              One Patient. One Connected Journey.
            </h3>
            <p className="mx-auto mt-6 max-w-2xl text-slate-500 dark:text-slate-400">
              The UPNM CMS 2.0 bridges every clinical touchpoint into a seamless, high-performance ecosystem. 
              Data flows instantly from the student portal to the pharmacy and beyond.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="absolute top-1/2 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-mint/20 via-cyan/20 to-navy/20 lg:block" />
            
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4 lg:grid-cols-8">
              {ECOSYSTEM_STEPS.map((step, i) => (
                <div 
                  key={step.id} 
                  className="animate-fade-up relative flex flex-col items-center"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  <div className={`group relative z-10 grid h-16 w-16 place-items-center rounded-2xl bg-white shadow-xl transition-all duration-500 hover:-translate-y-2 hover:scale-110 dark:bg-[#1a2b25] ${i % 2 === 0 ? "lg:mt-12" : "lg:mb-12"}`}>
                    <div className="absolute inset-0 rounded-2xl opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at center, ${step.color}22, transparent 70%)` }} />
                    <step.icon className="h-7 w-7 transition-colors duration-500" style={{ color: step.color }} />
                    
                    {/* Pulsing Dot */}
                    <div className="absolute -top-1 -right-1 h-3 w-3 rounded-full border-2 border-white bg-mint dark:border-[#1a2b25] pulse-dot" style={{ backgroundColor: step.color }} />
                  </div>
                  <div className={`mt-4 text-center ${i % 2 === 0 ? "lg:mt-6" : "lg:absolute lg:top-[-80px]"}`}>
                    <div className="text-[11px] font-bold uppercase tracking-wider text-navy dark:text-white">{step.label}</div>
                    <div className="mt-1 text-[9px] leading-tight text-slate-400">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ROLE-BASED EXPERIENCE ===================== */}
      <section id="roles" className="relative bg-white/50 py-24 dark:bg-black/10 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-16 lg:grid-cols-2">
            <div>
              <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.3em] text-cyan">Built Around Every Role</h2>
              <h3 className="mt-4 font-[Poppins] text-4xl font-extrabold tracking-tight text-navy dark:text-white lg:text-5xl">
                Experience the system from your perspective.
              </h3>
              
              <div className="mt-12 space-y-4">
                {ROLES.map((r) => {
                  const active = activeRoleTab === r.key;
                  const Icon = r.icon;
                  const info = ROLE_FEATURES[r.key];
                  return (
                    <button
                      key={r.key}
                      onClick={() => setActiveRoleTab(r.key)}
                      className={`group flex w-full items-start gap-6 rounded-[24px] p-6 text-left transition-all duration-500 ${active ? "bg-white shadow-2xl shadow-navy/5 dark:bg-[#1a2b25]" : "hover:bg-white/50 dark:hover:bg-white/5"}`}
                    >
                      <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl transition-all duration-500 ${active ? "bg-navy text-white dark:bg-mint" : "bg-slate-100 text-slate-400 dark:bg-white/5 group-hover:bg-white dark:group-hover:bg-white/10"}`}>
                        <Icon className={`h-6 w-6 transition-transform ${active ? "scale-110" : ""}`} />
                      </div>
                      <div>
                        <div className={`text-lg font-bold transition-colors ${active ? "text-navy dark:text-white" : "text-slate-500"}`}>{roleLabels[r.key]}</div>
                        {active && (
                          <div className="animate-fade-up mt-2">
                            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">{info.description}</p>
                            <div className="mt-4 grid grid-cols-2 gap-2">
                              {info.features.map((f) => (
                                <div key={f} className="flex items-center gap-2 text-[11px] font-semibold text-mint">
                                  <CheckCircle2 className="h-3.5 w-3.5" /> {f}
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              {/* Dashboard Preview Frame */}
              <div className="animate-scale-in relative z-10 overflow-hidden rounded-[32px] bg-slate-900 p-2 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.4)]">
                <div className="flex items-center gap-1.5 border-b border-white/5 bg-white/5 px-4 py-3">
                  <div className="flex gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-full bg-[#ff5f57]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#febc2e]" />
                    <div className="h-2.5 w-2.5 rounded-full bg-[#28c840]" />
                  </div>
                  <div className="mx-auto rounded-md bg-white/5 px-8 py-1 text-[10px] font-medium text-white/30">upnm-clinical.v2.0</div>
                </div>
                <div className="relative aspect-[16/10] bg-[#f7f3ec] dark:bg-[#0f1f1a]">
                  {/* Dynamic Preview based on Role */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="h-8 w-32 rounded-lg bg-slate-200 dark:bg-white/10 shimmer" />
                      <div className="h-8 w-8 rounded-full bg-slate-200 dark:bg-white/10 shimmer" />
                    </div>
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-navy/5 dark:border-white/5 p-4">
                          <div className="h-3 w-12 rounded bg-slate-100 dark:bg-white/10 mb-2" />
                          <div className="h-6 w-20 rounded bg-slate-200 dark:bg-white/10 shimmer" />
                        </div>
                      ))}
                    </div>
                    <div className="h-48 rounded-2xl bg-white dark:bg-white/5 shadow-sm border border-navy/5 dark:border-white/5 p-4">
                      <div className="h-4 w-32 rounded bg-slate-100 dark:bg-white/10 mb-4" />
                      <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-100 dark:bg-white/10" />
                            <div className="flex-1 space-y-2">
                              <div className="h-3 w-1/2 rounded bg-slate-200 dark:bg-white/10 shimmer" />
                              <div className="h-2 w-1/4 rounded bg-slate-100 dark:bg-white/5" />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  {/* Floating Action Card */}
                  <div className="animate-float absolute bottom-8 right-[-20px] z-20 w-48 rounded-2xl bg-navy p-4 text-white shadow-2xl dark:bg-mint">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-1.5 w-1.5 rounded-full bg-cyan pulse-dot" />
                      <div className="text-[10px] font-bold uppercase tracking-widest">Live Updates</div>
                    </div>
                    <div className="text-xs font-semibold">New record persisted</div>
                    <div className="mt-1 text-[9px] opacity-60">Just now · {roleLabels[activeRoleTab]}</div>
                  </div>
                </div>
              </div>

              {/* Decorative Blobs */}
              <div className="blob absolute top-[-10%] right-[-10%] h-[300px] w-[300px] bg-mint/20" />
              <div className="blob absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] bg-cyan/20" style={{ animationDelay: "-10s" }} />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTELLIGENCE & SMART FEATURES ===================== */}
      <section id="intelligence" className="relative py-24 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-12 lg:flex-row">
            <div className="max-w-xl">
              <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.3em] text-mint">Smart Clinical Intelligence</h2>
              <h3 className="mt-4 font-[Poppins] text-4xl font-extrabold tracking-tight text-navy dark:text-white lg:text-5xl">
                More than just records. Actual clinical insight.
              </h3>
              <p className="mt-6 text-lg text-slate-500 dark:text-slate-400">
                Our AI engine works silently in the background, prioritizing patient care 
                and ensuring no critical detail is missed.
              </p>
              
              <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2">
                {[
                  { icon: Sparkles, title: "AI Recommendations", desc: "Suggests treatment paths based on history." },
                  { icon: Activity, title: "Clinical Alerts", desc: "Flags abnormal vital signs in real-time." },
                  { icon: Zap, title: "Real-time Queue", desc: "Optimizes patient flow automatically." },
                  { icon: ShieldPlus, title: "History Analysis", desc: "Detects patterns in long-term records." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-4">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-mint/10 text-mint">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="font-bold text-navy dark:text-white">{item.title}</div>
                      <div className="text-xs text-slate-400">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="ai-glow w-full max-w-md rounded-[32px] p-8 lg:p-10">
              <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-mint text-navy">
                    <Cpu className="h-6 w-6" />
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest">AI Command Center</div>
                </div>
                <div className="rounded-full bg-cyan/20 px-3 py-1 text-[10px] font-bold text-cyan">ACTIVE</div>
              </div>
              <div className="space-y-4">
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-2">
                    <ShieldPlus className="h-4 w-4 text-cyan" />
                    <div className="text-[11px] font-bold text-cyan">Insight Detected</div>
                  </div>
                  <div className="text-xs leading-relaxed text-white/70">
                    Patient #8472 shows consistent blood pressure elevation over 3 visits. Recommend cardiovascular screening.
                  </div>
                </div>
                <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Activity className="h-4 w-4 text-mint" />
                    <div className="text-[11px] font-bold text-mint">Queue Optimized</div>
                  </div>
                  <div className="text-xs leading-relaxed text-white/70">
                    Emergency triage priority assigned to Student Ahmad Firdaus. Waiting time reduced by 14 min.
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== SECURITY & TRUST ===================== */}
      <section id="security" className="relative bg-navy py-24 text-white dark:bg-black/20 lg:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center">
            <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.3em] text-cyan">Security & Trust</h2>
            <h3 className="mt-4 font-[Poppins] text-4xl font-extrabold tracking-tight lg:text-5xl">
              Protected by Design.
            </h3>
            <p className="mx-auto mt-6 max-w-2xl text-white/50">
              Clinical data is highly sensitive. UPNM CMS 2.0 uses multi-layered security 
              to ensure records are only accessible to authorized personnel.
            </p>
          </div>

          <div className="mt-20 grid grid-cols-1 gap-8 md:grid-cols-3">
            {[
              { icon: UserCog, title: "Role-Based Access", desc: "Granular permissions for Students, Doctors, and Administrators." },
              { icon: Lock, title: "Protected Records", desc: "Clinical data is isolated and protected from unauthorized access." },
              { icon: ShieldCheck, title: "Audit Logging", desc: "Every system action is logged in an immutable activity trail." },
            ].map((item, i) => (
              <div key={i} className="group rounded-3xl border border-white/10 bg-white/5 p-8 transition-all hover:bg-white/10">
                <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-cyan/20 text-cyan transition-transform group-hover:scale-110">
                  <item.icon className="h-7 w-7" />
                </div>
                <h4 className="text-xl font-bold">{item.title}</h4>
                <p className="mt-4 text-sm leading-relaxed text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA / LOGIN SECTION ===================== */}
      <section id="login-section" className="relative flex min-h-screen items-center justify-center overflow-hidden py-24">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img src="/images/upnm-campus.png" alt="UPNM Campus" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f1a]/95 via-[#0f1f1a]/80 to-[#0f1f1a]/95" />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl px-6 lg:grid-cols-2 lg:items-center lg:gap-20 lg:px-12">
          <div className="mb-16 lg:mb-0">
            <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.3em] text-mint">The Future Starts Here</h2>
            <h3 className="mt-4 font-[Poppins] text-4xl font-extrabold tracking-tight text-white lg:text-6xl">
              UPNM CMS 2.0
            </h3>
            <p className="mt-6 text-xl text-white/60">
              Enter your clinical command center and experience the next generation of campus healthcare.
            </p>
            <div className="mt-10 flex items-center gap-4 text-white/40">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-navy bg-slate-700 shimmer" />
                ))}
              </div>
              <div className="text-sm font-medium tracking-wide">Trusted by UPNM Health Centre</div>
            </div>
          </div>

          {/* Login Card */}
          <div className={`glass relative mx-auto w-full max-w-md rounded-[32px] p-8 shadow-2xl lg:p-10 ${shake ? "animate-shake" : "animate-scale-in"}`}>
            <div className="mb-8">
              <h3 className="font-[Poppins] text-3xl font-extrabold tracking-tight text-navy dark:text-white">Welcome back</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Sign in to your clinical command center.</p>
            </div>

            {/* role selector */}
            <div className="mb-8">
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
                <div className="animate-shake flex items-center gap-2 rounded-xl bg-danger/10 px-4 py-3 text-xs font-semibold text-danger">
                  <Lock className="h-4 w-4" /> {error}
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
                className="ripple flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-navy via-[#1a4a82] to-[#2d5551] bg-[length:200%_auto] py-4 font-bold uppercase tracking-widest text-white shadow-xl shadow-navy/30 transition-all hover:bg-right hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 animated-gradient"
              >
                {loading ? (
                  <><span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" /> Signing in…</>
                ) : seeding ? "Preparing system…" : (
                  <>Sign in securely <ArrowRight className="h-4 w-4" /></>
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

            <button onClick={fillDemo} className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-mint/10 py-3 text-xs font-bold uppercase tracking-widest text-mint transition hover:bg-mint/20">
              <CheckCircle2 className="h-4 w-4" /> Demo Credentials
            </button>
            
            <p className="mt-6 text-center text-xs text-slate-400">
              New here?{" "}
              <Link href="/register" className="font-bold text-mint hover:underline">
                Create an account
              </Link>
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 dark:bg-black/30">
        <div className="mx-auto max-w-7xl px-6 text-center lg:px-12">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-3">
              <img src="/images/upnm-logo.png" alt="UPNM" className="h-8 w-8" />
              <span className="text-sm font-bold tracking-tight text-navy dark:text-white">UPNM Smart Clinical CMS 2.0</span>
            </div>
            <div className="text-xs text-slate-400">
              © {new Date().getFullYear()} UPNM Health Centre — Kem Sungai Besi. All rights reserved.
            </div>
            <div className="flex gap-6">
              <button className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-mint">Privacy</button>
              <button className="text-xs font-bold uppercase tracking-widest text-slate-400 hover:text-mint">Terms</button>
            </div>
          </div>
        </div>
      </footer>

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
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-mint/10">
                <Mail className="h-8 w-8 text-mint" />
              </div>
              <div>
                <h3 className="font-semibold text-navy dark:text-white">Check your email</h3>
                <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
                  If an account exists for{" "}
                  <span className="font-semibold text-navy dark:text-white">{forgotEmail}</span>,
                  a password reset link has been sent.
                </p>
              </div>
            </div>
            {devResetUrl && (
              <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 dark:border-amber-400/30 dark:bg-amber-900/20">
                <p className="mb-1 text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
                  Dev Mode — Reset Link
                </p>
                <a href={devResetUrl} className="break-all text-xs font-medium text-amber-700 underline dark:text-amber-400">
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
