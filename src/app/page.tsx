"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldPlus, Stethoscope, GraduationCap,
  UserCog, Fingerprint, Eye, EyeOff, CheckCircle2,
  Activity, Lock, Sparkles, Users, CalendarCheck, Clock, Cpu,
  Mail, ArrowLeft, ArrowRight, LayoutDashboard, Pill, Package,
  ClipboardList, History, ShieldCheck, ChevronRight, Menu, X as CloseIcon, Zap,
  Search, Bell, Plus, User as UserIcon, AlertTriangle, Brain, TrendingUp, Droplet, MapPin
} from "lucide-react";
import { roleLabels, type Role } from "@/lib/session";
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

export default function LandingPage() {
  const router = useRouter();
  const [now, setNow] = useState<Date>(new Date());
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [scrolled, setScrolled] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<Role>("student/lecturer");

  useEffect(() => {
    const c = setInterval(() => setNow(new Date()), 1000);
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

  const scrollToLogin = () => {
    router.push("/dashboard"); // Direct to login via dashboard guard or just /login
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
            <Link
              href="/dashboard"
              className="rounded-full bg-navy px-6 py-2 text-xs font-bold uppercase tracking-widest text-white shadow-lg shadow-navy/20 transition-all hover:scale-105 hover:brightness-110 active:scale-95 dark:bg-mint"
            >
              Access System
            </Link>
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
              <Sparkles className="h-3.5 w-3.5" /> Clinical Command Center
            </div>
            <h1 className="font-[Poppins] text-5xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-6xl lg:text-8xl">
              UPNM CMS 2.0
            </h1>
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60 lg:text-xl">
              The official Clinical Management System for the UPNM community. 
              Integrated appointments, EMR, and pharmacy in one connected ecosystem.
            </p>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/dashboard"
                className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-cyan to-mint px-8 py-4 font-bold text-navy shadow-2xl transition-all hover:scale-105 hover:shadow-mint/30"
              >
                Access Portal <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                onClick={() => document.getElementById("ecosystem")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-8 py-4 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10"
              >
                Explore Workflow
              </button>
            </div>

            {/* REAL PRODUCT PREVIEW FRAME */}
            <div className="mt-20 relative w-full max-w-5xl group">
              {/* Decorative Blobs */}
              <div className="blob absolute top-[-10%] right-[-10%] h-[300px] w-[300px] bg-mint/20 opacity-20" />
              <div className="blob absolute bottom-[-10%] left-[-10%] h-[300px] w-[300px] bg-cyan/20 opacity-20" style={{ animationDelay: "-10s" }} />

              <div className="animate-scale-in relative z-10 overflow-hidden rounded-[24px] bg-[#f7f3ec] shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] dark:bg-[#0f1f1a] ring-1 ring-white/10">
                {/* Product Frame: Top Bar */}
                <div className="flex items-center justify-between border-b border-navy/5 bg-white/50 px-6 py-3 backdrop-blur-md dark:border-white/5 dark:bg-white/5">
                  <div className="flex items-center gap-4">
                    <div className="flex gap-1.5">
                      <div className="h-2.5 w-2.5 rounded-full bg-danger/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-cyan/40" />
                      <div className="h-2.5 w-2.5 rounded-full bg-mint/40" />
                    </div>
                    <div className="h-8 w-px bg-navy/10 dark:bg-white/10 mx-2" />
                    <div className="relative hidden sm:block">
                      <Search className="absolute left-3 top-2 h-3.5 w-3.5 text-slate-400" />
                      <div className="h-7.5 w-64 rounded-lg bg-navy/5 px-9 py-1.5 text-[10px] text-slate-400 dark:bg-white/5">Search records, appointments...</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="hidden items-center gap-2 rounded-lg bg-navy px-3 py-1.5 text-[10px] font-bold text-white dark:bg-mint sm:flex">
                      <Plus className="h-3 w-3" /> New Appt
                    </div>
                    <Bell className="h-4 w-4 text-slate-400" />
                    <div className="h-8 w-8 rounded-full bg-navy/10 dark:bg-white/10 flex items-center justify-center font-bold text-[10px]">DR</div>
                  </div>
                </div>

                <div className="flex min-h-[400px]">
                  {/* Product Frame: Sidebar */}
                  <div className="hidden w-20 flex-col items-center gap-6 border-r border-navy/5 bg-white/30 py-6 dark:border-white/5 dark:bg-white/[0.02] sm:flex">
                    {[LayoutDashboard, Stethoscope, Pill, Users, Activity, GraduationCap, ShieldCheck].map((Icon, i) => (
                      <div key={i} className={`p-2 rounded-xl transition-colors ${i === 0 ? "bg-navy text-white dark:bg-mint" : "text-slate-400 hover:bg-navy/5 dark:hover:bg-white/5"}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    ))}
                  </div>

                  {/* Product Frame: Content Area */}
                  <div className="flex-1 p-8 text-left">
                    <div className="mb-6 flex items-center justify-between">
                      <div>
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-cyan/10 px-3 py-1 text-[9px] font-bold uppercase tracking-widest text-cyan">AI Command Center</div>
                        <h3 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Good morning, Doctor</h3>
                      </div>
                      <div className="text-right">
                        <div className="font-mono text-sm font-bold text-navy dark:text-white">{now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Kem Sungai Besi</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                      <div className="lg:col-span-2 space-y-6">
                        {/* Real Dashboard Cards */}
                        <div className="grid grid-cols-2 gap-4">
                          {[
                            { label: "Appointments", value: "12", icon: CalendarCheck, color: "#c9955a" },
                            { label: "Waiting now", value: "4", icon: Users, color: "#7a9e7e" }
                          ].map((s, i) => (
                            <div key={i} className="rounded-2xl border border-navy/5 bg-white p-4 shadow-sm dark:border-white/5 dark:bg-white/5">
                              <div className="flex items-center justify-between mb-2">
                                <s.icon className="h-4 w-4" style={{ color: s.color }} />
                                <span className="text-[9px] font-bold text-mint">+12%</span>
                              </div>
                              <div className="font-mono text-2xl font-extrabold text-navy dark:text-white">{s.value}</div>
                              <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{s.label}</div>
                            </div>
                          ))}
                        </div>

                        {/* AI Recommendations Panel */}
                        <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.03] p-5 relative overflow-hidden">
                          <div className="absolute top-0 right-0 p-2"><Brain className="h-12 w-12 text-cyan/10" /></div>
                          <div className="flex items-center gap-2 mb-3">
                            <Sparkles className="h-4 w-4 text-cyan" />
                            <span className="text-[10px] font-bold uppercase tracking-widest text-cyan">AI Recommendation</span>
                          </div>
                          <div className="text-xs font-bold text-navy dark:text-white mb-1">Critical potassium flagged</div>
                          <div className="text-[10px] leading-relaxed text-slate-500 dark:text-slate-400 max-w-sm">
                            Patient Siti Fatimah — Lab result 6.2 mmol/L (High). Review within 1h to prevent cardiac risk.
                          </div>
                          <div className="mt-3 flex items-center gap-1 text-[10px] font-bold text-cyan">
                            Review Record <ChevronRight className="h-3 w-3" />
                          </div>
                        </div>
                      </div>

                      {/* Next Consultation Side Panel */}
                      <div className="space-y-4">
                        <div className="rounded-2xl border border-mint/20 bg-mint/[0.03] p-5">
                          <div className="flex items-center gap-2 mb-4">
                            <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />
                            <span className="text-[9px] font-bold uppercase tracking-widest text-mint">Next Consultation</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-mint to-cyan text-xs font-bold text-navy">#08</div>
                            <div className="flex-1 min-w-0">
                              <div className="truncate text-xs font-bold text-navy dark:text-white">Ahmad Firdaus</div>
                              <div className="truncate text-[9px] text-slate-400">General · 10:30 AM</div>
                            </div>
                          </div>
                          <div className="mt-4 rounded-xl bg-white/50 p-3 text-center dark:bg-white/5">
                            <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Est. Wait</div>
                            <div className="font-mono text-sm font-extrabold text-mint">~4 min</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
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
                            <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400">
                              {r.key === "student/lecturer" ? "Access campus healthcare services with ease. Manage your appointments and medical records." : 
                               r.key === "doctor" ? "Empowering healthcare providers with intelligent tools and real-time clinical insights." : 
                               "Complete oversight of the UPNM Health Centre operations and system-wide activity."}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative">
              {/* STATIC ROLE PREVIEW AREA */}
              <div className="animate-scale-in relative z-10 overflow-hidden rounded-[32px] bg-white p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.1)] dark:bg-[#1a2b25] min-h-[400px] flex items-center justify-center">
                {activeRoleTab === "student/lecturer" && (
                  <div className="w-full max-w-sm space-y-6 animate-fade-in">
                    {/* Digital Health ID Card */}
                    <div className="relative overflow-hidden rounded-[24px] bg-gradient-to-br from-navy via-[#2d5551] to-[#2d5551] p-6 text-white shadow-xl">
                      <ShieldPlus className="absolute right-[-10%] top-[-10%] h-32 w-32 text-white/5" />
                      <div className="mb-4 text-[9px] font-bold uppercase tracking-[0.2em] text-white/60">UPNM Digital Health ID</div>
                      <div className="flex items-center gap-4">
                        <div className="grid h-14 w-14 place-items-center rounded-2xl bg-white/10 text-xl font-bold ring-1 ring-white/20">AF</div>
                        <div>
                          <div className="font-[Poppins] text-lg font-extrabold">Ahmad Firdaus</div>
                          <div className="font-mono text-xs text-cyan">UPNM-2024-0084</div>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-2">
                        <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-bold"><Droplet className="inline h-3 w-3 mr-1" /> O+</span>
                        <span className="rounded-full bg-mint/30 px-3 py-1 text-[10px] font-bold">Fit for Duty ✓</span>
                      </div>
                    </div>
                    {/* Appointment Card */}
                    <div className="rounded-2xl border border-navy/5 bg-slate-50 p-4 dark:border-white/5 dark:bg-white/5">
                      <div className="mb-3 text-[9px] font-bold uppercase tracking-[0.2em] text-slate-400">Upcoming Appointment</div>
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-xl bg-navy/5 text-navy dark:bg-white/5 dark:text-cyan">
                          <CalendarCheck className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="text-xs font-bold">General Consultation</div>
                          <div className="text-[10px] text-slate-400">Dr. Sarah · Today, 10:30 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === "doctor" && (
                  <div className="w-full max-w-sm space-y-6 animate-fade-in">
                    {/* Next Consultation Card */}
                    <div className="rounded-[24px] border border-mint/20 bg-mint/[0.03] p-6 shadow-sm">
                      <div className="mb-4 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-mint pulse-dot" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-mint">Next Consultation</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-mint to-cyan text-xl font-bold text-navy">#08</div>
                        <div>
                          <div className="text-lg font-extrabold text-navy dark:text-white">Ahmad Firdaus</div>
                          <div className="text-xs text-slate-400">Waiting for 14 mins</div>
                        </div>
                      </div>
                      <div className="mt-6 grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-white/5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Vitals</div>
                          <div className="text-xs font-bold text-navy dark:text-white">Normal</div>
                        </div>
                        <div className="rounded-xl bg-white p-3 text-center shadow-sm dark:bg-white/5">
                          <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Room</div>
                          <div className="text-xs font-bold text-navy dark:text-white">B2</div>
                        </div>
                      </div>
                    </div>
                    {/* AI Alert Card */}
                    <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.03] p-4 flex gap-4">
                      <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-cyan/10 text-cyan">
                        <Brain className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-navy dark:text-white">AI Recommendation</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400">Review lab results for patient #0842.</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === "admin" && (
                  <div className="w-full max-w-sm space-y-6 animate-fade-in">
                    {/* System KPI Card */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-[24px] border border-navy/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/5">
                        <TrendingUp className="mb-4 h-6 w-6 text-mint" />
                        <div className="text-2xl font-extrabold text-navy dark:text-white">2,847</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">Total Patients</div>
                      </div>
                      <div className="rounded-[24px] border border-navy/5 bg-white p-6 shadow-sm dark:border-white/5 dark:bg-white/5">
                        <Activity className="mb-4 h-6 w-6 text-cyan" />
                        <div className="text-2xl font-extrabold text-navy dark:text-white">98.7%</div>
                        <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400">System Health</div>
                      </div>
                    </div>
                    {/* Inventory Alert Card */}
                    <div className="rounded-2xl border border-danger/20 bg-danger/[0.03] p-5">
                      <div className="flex items-center gap-2 mb-3 text-danger">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Inventory Alert</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs font-bold text-navy dark:text-white">Paracetamol 500mg</div>
                        <div className="rounded-full bg-danger/20 px-2 py-0.5 text-[9px] font-bold text-danger">LOW STOCK</div>
                      </div>
                      <div className="mt-2 h-1.5 w-full rounded-full bg-navy/5 dark:bg-white/5">
                        <div className="h-full w-[15%] rounded-full bg-danger" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative Frame Elements */}
              <div className="absolute top-[-20px] left-[-20px] h-20 w-20 border-l-2 border-t-2 border-navy/10 dark:border-white/10 rounded-tl-3xl" />
              <div className="absolute bottom-[-20px] right-[-20px] h-20 w-20 border-r-2 border-b-2 border-navy/10 dark:border-white/10 rounded-br-3xl" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTELLIGENCE & SECURITY SECTIONS ===================== */}
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

            <div className="relative w-full max-w-md rounded-[32px] bg-navy p-8 dark:bg-black/20 lg:p-10 overflow-hidden shadow-2xl">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/10 via-transparent to-mint/10" />
              <div className="relative z-10">
                <div className="mb-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-mint text-navy">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-widest text-white">AI Engine</div>
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
                      Patient #8472 shows consistent blood pressure elevation. Recommend cardiovascular screening.
                    </div>
                  </div>
                  <div className="rounded-2xl border border-white/5 bg-white/5 p-4 backdrop-blur-md">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity className="h-4 w-4 text-mint" />
                      <div className="text-[11px] font-bold text-mint">Queue Optimized</div>
                    </div>
                    <div className="text-xs leading-relaxed text-white/70">
                      Triage priority updated. Estimated waiting time reduced by 14 min.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

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

      {/* ===================== FINAL CTA SECTION ===================== */}
      <section id="ready" className="relative flex min-h-[60vh] items-center justify-center overflow-hidden py-24">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <img src="/images/upnm-campus.png" alt="UPNM Campus" className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f1a]/95 via-[#0f1f1a]/80 to-[#0f1f1a]/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.3em] text-mint">Ready to Access?</h2>
          <h3 className="mt-6 font-[Poppins] text-4xl font-extrabold tracking-tight text-white lg:text-6xl">
            Experience the Future of Campus Healthcare.
          </h3>
          <p className="mt-8 text-xl text-white/60">
            Enter the UPNM clinical command center and manage your healthcare journey today.
          </p>
          <div className="mt-12 flex flex-col items-center gap-6">
            <Link
              href="/dashboard"
              className="group flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan to-mint px-12 py-5 text-lg font-bold text-navy shadow-[0_20px_40px_-10px_rgba(122,158,126,0.5)] transition-all hover:scale-105 hover:shadow-mint/40 active:scale-95"
            >
              Access Clinical System <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
            </Link>
            <div className="flex items-center gap-2 text-white/40 text-sm">
              <ShieldCheck className="h-4 w-4" />
              Secure Role-Based Access
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-12 dark:bg-black/30 border-t border-navy/5 dark:border-white/5">
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
    </div>
  );
}
