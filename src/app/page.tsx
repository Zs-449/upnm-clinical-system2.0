"use client";

import { useEffect, useState, useRef } from "react";
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
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});

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

    // Simple scroll reveal observer
    // rootMargin triggers reveal slightly before the section enters the viewport,
    // so fast scrolling / slow JS hydration doesn't leave a visibly blank section.
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));

    return () => { 
      clearInterval(c); 
      window.removeEventListener("mousemove", onMove); 
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-[#f7f3ec] text-[#2d2a24] dark:bg-[#0f1f1a] dark:text-[#e8e4da] selection:bg-mint/30 overflow-x-hidden">
      <Toaster />

      {/* ===================== NAVIGATION ===================== */}
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-700 ${scrolled ? "bg-white/80 py-3 shadow-2xl backdrop-blur-xl dark:bg-[#0f1f1a]/80" : "bg-transparent py-6"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <img src="/images/upnm-logo.png" alt="UPNM" className="h-10 w-10 object-contain drop-shadow-lg" />
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
                className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:text-mint hover:tracking-[0.2em] dark:text-slate-400 dark:hover:text-cyan"
              >
                {item}
              </button>
            ))}
            <Link
              href="/dashboard"
              className="group relative overflow-hidden rounded-full bg-navy px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 hover:shadow-navy/40 dark:bg-mint"
            >
              <span className="relative z-10">Access System</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>
          </div>
          <button className="md:hidden">
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </nav>

      {/* ===================== HERO SECTION ===================== */}
      <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        {/* Immersive Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/images/upnm-campus.png" 
            alt="UPNM Campus" 
            className="h-full w-full object-cover transition-transform duration-[10s] ease-out scale-105" 
            style={{ transform: scrolled ? 'scale(1.1) translateY(20px)' : 'scale(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f1a]/95 via-[#0f1f1a]/80 to-[#f7f3ec] dark:to-[#0f1f1a]" />
          
          {/* Parallax glow that follows mouse */}
          <div
            className="pointer-events-none absolute h-[800px] w-[800px] rounded-full transition-all duration-1000 opacity-40"
            style={{
              left: `${mouse.x}%`,
              top: `${mouse.y}%`,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(0,212,255,0.4), transparent 70%)",
              filter: "blur(80px)",
            }}
          />

          {/* grid overlay */}
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
          <div className="flex flex-col items-center">
            {/* UPNM MOTTO */}
            <div className="mb-6 animate-fade-in opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <span className="font-[Poppins] text-xs font-bold uppercase tracking-[0.5em] text-cyan/80">
                Kewajipan. Maruah. Integriti
              </span>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan backdrop-blur-md animate-fade-up">
              <Sparkles className="h-3.5 w-3.5" /> Clinical Command Center
            </div>
            
            <h1 className="font-[Poppins] text-6xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-9xl animate-fade-up" style={{ animationDelay: '300ms' }}>
              UPNM <span className="bg-gradient-to-r from-cyan via-mint to-cyan bg-[length:200%_auto] bg-clip-text text-transparent animated-gradient">CMS 2.0</span>
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60 lg:text-xl animate-fade-up" style={{ animationDelay: '500ms' }}>
              A single system for UPNM campus healthcare — appointments, electronic 
              medical records, and pharmacy dispensing, connected end to end.
            </p>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: '700ms' }}>
              <Link
                href="/dashboard"
                className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan to-mint px-10 py-5 font-bold text-navy shadow-2xl transition-all hover:scale-105 hover:shadow-mint/40 active:scale-95"
              >
                Access Portal <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
              </Link>
              <button
                onClick={() => document.getElementById("ecosystem")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-10 py-5 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40"
              >
                Explore Workflow
              </button>
            </div>

            {/* CINEMATIC FLOATING CLINICAL CARDS (Replacing the white box) */}
            <div className="mt-24 relative w-full max-w-5xl h-[400px] flex items-center justify-center perspective-1000">
              
              {/* Card 1: AI Command (Center) */}
              <div className="absolute z-20 w-full max-w-lg rounded-3xl glass p-6 shadow-2xl animate-float transition-all duration-700 hover:scale-[1.02] border-white/20 bg-white/10 backdrop-blur-2xl" style={{ animationDelay: '0s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-mint text-navy">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div className="text-left">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-cyan">AI Command Center</div>
                      <div className="text-sm font-bold text-white">Good morning, Doctor</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-white">{now.toLocaleTimeString("en-GB", { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Waiting Now</div>
                    <div className="font-mono text-2xl font-extrabold text-mint">04</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">Appointments</div>
                    <div className="font-mono text-2xl font-extrabold text-cyan">12</div>
                  </div>
                </div>
              </div>

              {/* Card 2: AI Alert (Floating Left) */}
              <div className="absolute z-30 left-[-5%] top-[10%] w-64 rounded-2xl glass p-4 shadow-2xl animate-float hidden lg:block border-white/20 bg-white/5 backdrop-blur-xl" style={{ animationDelay: '-2s', transform: 'rotate(-5deg) translateZ(50px)' }}>
                <div className="flex items-center gap-2 mb-2 text-danger">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Critical Alert</span>
                </div>
                <div className="text-[11px] font-bold text-white mb-1">High Potassium Detected</div>
                <div className="text-[9px] text-white/60 leading-relaxed">Patient #0842 — Review lab results immediately.</div>
              </div>

              {/* Card 3: Next Consultation (Floating Right) */}
              <div className="absolute z-30 right-[-5%] bottom-[10%] w-64 rounded-2xl glass p-4 shadow-2xl animate-float hidden lg:block border-white/20 bg-white/5 backdrop-blur-xl" style={{ animationDelay: '-4s', transform: 'rotate(5deg) translateZ(80px)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-mint">Next Patient</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint/20 text-xs font-bold text-mint">#08</div>
                  <div className="text-left">
                    <div className="text-[11px] font-bold text-white">Ahmad Firdaus</div>
                    <div className="text-[9px] text-white/50">Est. wait: 4 min</div>
                  </div>
                </div>
              </div>

              {/* Decorative elements */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full border border-white/5 rounded-full scale-90 animate-pulse opacity-20" />
                <div className="absolute top-0 left-0 w-full h-full border border-white/5 rounded-full scale-110 animate-pulse opacity-10" style={{ animationDelay: '1s' }} />
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <div className="h-12 w-7 rounded-full border-2 border-current p-1">
            <div className="h-3 w-1.5 mx-auto rounded-full bg-current" />
          </div>
        </div>
      </section>

      {/* ===================== ECOSYSTEM SECTION ===================== */}
      <section id="ecosystem" className={`relative py-32 transition-all duration-500 ${isVisible.ecosystem ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-24 text-center">
            <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-mint">Everything Connected</h2>
            <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight text-navy dark:text-white lg:text-6xl">
              One Patient. One Journey.
            </h3>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              UPNM CMS 2.0 bridges every clinical touchpoint into a seamless, high-performance ecosystem. 
              Data flows instantly from the student portal to the pharmacy and beyond.
            </p>
          </div>

          <div className="relative">
            {/* Connecting Line (Desktop) */}
            <div className="absolute top-1/2 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-mint/20 via-cyan/20 to-navy/20 lg:block" />
            
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-8">
              {ECOSYSTEM_STEPS.map((step, i) => (
                <div 
                  key={step.id} 
                  className="relative flex flex-col items-center group"
                >
                  <div className={`z-10 grid h-20 w-20 place-items-center rounded-[28px] bg-white shadow-2xl transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-110 group-hover:shadow-mint/20 dark:bg-[#1a2b25] ${i % 2 === 0 ? "lg:mt-12" : "lg:mb-12"}`}>
                    <div className="absolute inset-0 rounded-[28px] opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at center, ${step.color}22, transparent 70%)` }} />
                    <step.icon className="h-8 w-8 transition-colors duration-500" style={{ color: step.color }} />
                    
                    {/* Pulsing Dot */}
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-4 border-white bg-mint dark:border-[#1a2b25] pulse-dot" style={{ backgroundColor: step.color }} />
                  </div>
                  <div className={`mt-6 text-center transition-all duration-500 group-hover:scale-105 ${i % 2 === 0 ? "lg:mt-8" : "lg:absolute lg:top-[-100px]"}`}>
                    <div className="text-[12px] font-bold uppercase tracking-widest text-navy dark:text-white">{step.label}</div>
                    <div className="mt-2 text-[10px] leading-tight text-slate-400 max-w-[100px]">{step.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ROLE-BASED EXPERIENCE ===================== */}
      <section id="roles" className={`relative bg-white/40 py-32 dark:bg-black/10 transition-all duration-500 ${isVisible.roles ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
            <div>
              <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-cyan">Built Around Every Role</h2>
              <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight text-navy dark:text-white lg:text-6xl">
                Precision for every user.
              </h3>
              
              <div className="mt-16 space-y-6">
                {ROLES.map((r) => {
                  const active = activeRoleTab === r.key;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.key}
                      onClick={() => setActiveRoleTab(r.key)}
                      className={`group flex w-full items-start gap-8 rounded-[32px] p-8 text-left transition-all duration-700 ${active ? "bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] dark:bg-[#1a2b25]" : "hover:bg-white/50 dark:hover:bg-white/5"}`}
                    >
                      <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl transition-all duration-700 ${active ? "bg-navy text-white dark:bg-mint shadow-xl shadow-navy/20" : "bg-slate-100 text-slate-400 dark:bg-white/5 group-hover:bg-white"}`}>
                        <Icon className={`h-7 w-7 transition-transform duration-500 ${active ? "scale-110" : "group-hover:rotate-6"}`} />
                      </div>
                      <div>
                        <div className={`text-xl font-bold transition-colors ${active ? "text-navy dark:text-white" : "text-slate-500"}`}>{roleLabels[r.key]}</div>
                        {active && (
                          <div className="animate-fade-up mt-3">
                            <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
                              {r.key === "student/lecturer" ? "Access campus healthcare services with ease. Manage your appointments and medical records in a single dashboard." : 
                               r.key === "doctor" ? "Empowering healthcare providers with intelligent tools, real-time clinical insights, and an optimized patient queue." : 
                               "Complete oversight of the UPNM Health Centre operations, from real-time inventory tracking to detailed activity logs."}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative group">
              {/* STATIC ROLE PREVIEW AREA */}
              <div className="animate-scale-in relative z-10 overflow-hidden rounded-[40px] bg-white p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] dark:bg-[#1a2b25] min-h-[450px] flex items-center justify-center border border-navy/5 dark:border-white/5 transition-transform duration-700 group-hover:scale-[1.01]">
                {activeRoleTab === "student/lecturer" && (
                  <div className="w-full max-w-sm space-y-8 animate-fade-in">
                    {/* Digital Health ID Card */}
                    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-navy via-[#2d5551] to-[#2d5551] p-8 text-white shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <ShieldPlus className="absolute right-[-10%] top-[-10%] h-40 w-40 text-white/5" />
                      <div className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60">UPNM Digital Health ID</div>
                      <div className="flex items-center gap-5">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-2xl font-bold ring-1 ring-white/20">AF</div>
                        <div>
                          <div className="font-[Poppins] text-xl font-extrabold">Ahmad Firdaus</div>
                          <div className="font-mono text-xs text-cyan">UPNM-2024-0084</div>
                        </div>
                      </div>
                      <div className="mt-8 flex gap-3">
                        <span className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold backdrop-blur-md"><Droplet className="inline h-3.5 w-3.5 mr-2 text-danger" /> O+</span>
                        <span className="rounded-full bg-mint/30 px-4 py-1.5 text-[11px] font-bold backdrop-blur-md">Fit for Duty ✓</span>
                      </div>
                    </div>
                    {/* Appointment Card */}
                    <div className="rounded-2xl border border-navy/5 bg-slate-50 p-5 dark:border-white/5 dark:bg-white/5 shadow-sm">
                      <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Upcoming Appointment</div>
                      <div className="flex items-center gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy/5 text-navy dark:bg-white/5 dark:text-cyan shadow-inner">
                          <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">General Consultation</div>
                          <div className="text-xs text-slate-400">Dr. Sarah · Today, 10:30 AM</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === "doctor" && (
                  <div className="w-full max-w-sm space-y-8 animate-fade-in">
                    {/* Next Consultation Card */}
                    <div className="rounded-[32px] border border-mint/20 bg-mint/[0.03] p-8 shadow-sm transition-all duration-500 hover:-translate-y-2">
                      <div className="mb-6 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-mint pulse-dot" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-mint">Next Consultation</span>
                      </div>
                      <div className="flex items-center gap-5">
                        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-mint to-cyan text-2xl font-bold text-navy shadow-lg shadow-mint/20">#08</div>
                        <div>
                          <div className="text-xl font-extrabold text-navy dark:text-white">Ahmad Firdaus</div>
                          <div className="text-xs text-slate-400">Waiting for 14 mins</div>
                        </div>
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-white/5 border border-navy/5">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-center">Vitals</div>
                          <div className="text-sm font-bold text-navy dark:text-white">Normal</div>
                        </div>
                        <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-white/5 border border-navy/5">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1 text-center">Room</div>
                          <div className="text-sm font-bold text-navy dark:text-white">B2</div>
                        </div>
                      </div>
                    </div>
                    {/* AI Alert Card */}
                    <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.03] p-5 flex gap-5 shadow-sm">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan/10 text-cyan">
                        <Brain className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy dark:text-white">AI Recommendation</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">Review lab results for patient #0842. Potassium flagged as high.</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === "admin" && (
                  <div className="w-full max-w-sm space-y-8 animate-fade-in">
                    {/* System KPI Card */}
                    <div className="grid grid-cols-2 gap-6">
                      <div className="rounded-[28px] border border-navy/5 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-white/5 transition-all duration-500 hover:-translate-y-2">
                        <TrendingUp className="mb-6 h-8 w-8 text-mint" />
                        <div className="text-3xl font-extrabold text-navy dark:text-white tracking-tighter">2,847</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">Total Patients</div>
                      </div>
                      <div className="rounded-[28px] border border-navy/5 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-white/5 transition-all duration-500 hover:-translate-y-2">
                        <Activity className="mb-6 h-8 w-8 text-cyan" />
                        <div className="text-3xl font-extrabold text-navy dark:text-white tracking-tighter">98.7%</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">System Health</div>
                      </div>
                    </div>
                    {/* Inventory Alert Card */}
                    <div className="rounded-[28px] border border-danger/20 bg-danger/[0.03] p-6 shadow-sm">
                      <div className="flex items-center gap-3 mb-4 text-danger">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em]">Inventory Alert</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-navy dark:text-white">Paracetamol 500mg</div>
                        <div className="rounded-full bg-danger/20 px-3 py-1 text-[10px] font-bold text-danger">LOW STOCK</div>
                      </div>
                      <div className="mt-4 h-2 w-full rounded-full bg-navy/5 dark:bg-white/5 overflow-hidden">
                        <div className="h-full w-[15%] rounded-full bg-danger animate-pulse" />
                      </div>
                      <div className="mt-2 text-right text-[10px] font-bold text-danger">12 units remaining</div>
                    </div>
                  </div>
                )}
              </div>

              {/* Decorative Frame Elements */}
              <div className="absolute top-[-30px] left-[-30px] h-24 w-24 border-l-2 border-t-2 border-navy/10 dark:border-white/10 rounded-tl-[40px] pointer-events-none" />
              <div className="absolute bottom-[-30px] right-[-30px] h-24 w-24 border-r-2 border-b-2 border-navy/10 dark:border-white/10 rounded-br-[40px] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTELLIGENCE & SECURITY ===================== */}
      <section id="intelligence" className={`relative py-32 transition-all duration-500 ${isVisible.intelligence ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-20 lg:flex-row">
            <div className="max-w-xl">
              <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-mint">Clinical Decision Support</h2>
              <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight text-navy dark:text-white lg:text-6xl">
                Support at every step.
              </h3>
              <p className="mt-8 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                Pattern analysis runs in the background to help prioritize patient care, 
                surfacing details a busy clinical team could otherwise miss.
              </p>
              
              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {[
                  { icon: Sparkles, title: "Clinical Insights", desc: "Surfaces relevant history to support treatment decisions." },
                  { icon: Activity, title: "Clinical Alerts", desc: "Flags abnormal vital signs and lab results in real-time." },
                  { icon: Zap, title: "Real-time Queue", desc: "Optimizes patient flow and room allocation automatically." },
                  { icon: ShieldPlus, title: "History Analysis", desc: "Detects long-term patterns in student medical records." },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint/10 text-mint transition-transform duration-500 group-hover:scale-110 group-hover:bg-mint/20">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-navy dark:text-white text-base">{item.title}</div>
                      <div className="text-sm text-slate-400 mt-1 leading-snug">{item.desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-md rounded-[40px] bg-navy p-10 dark:bg-black/20 overflow-hidden shadow-[0_60px_100px_-20px_rgba(31,61,58,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-transparent to-mint/10" />
              <div className="relative z-10">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-mint text-navy shadow-lg shadow-cyan/20">
                      <Cpu className="h-7 w-7" />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-[0.2em] text-white">Clinical Intelligence</div>
                  </div>
                  <div className="rounded-full bg-cyan/20 px-4 py-1.5 text-[10px] font-bold text-cyan border border-cyan/30">Monitoring</div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-500 hover:bg-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldPlus className="h-5 w-5 text-cyan" />
                      <div className="text-[11px] font-bold text-cyan uppercase tracking-widest">Flagged for Review</div>
                    </div>
                    <div className="text-sm leading-relaxed text-white/80">
                      Patient #8472 shows a sustained blood pressure trend across recent visits. Flagged for clinician review.
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-500 hover:bg-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="h-5 w-5 text-mint" />
                      <div className="text-[11px] font-bold text-mint uppercase tracking-widest">Queue Optimized</div>
                    </div>
                    <div className="text-sm leading-relaxed text-white/80">
                      Triage priority updated for Room B2. Estimated waiting time for current queue reduced by 14 min.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className={`relative bg-navy py-32 text-white dark:bg-black/20 transition-all duration-500 ${isVisible.security ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-cyan">Security & Trust</h2>
            <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight lg:text-6xl">
              Protected by Design.
            </h3>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/50 leading-relaxed">
              Clinical data is highly sensitive. UPNM CMS 2.0 uses multi-layered security 
              to ensure records are only accessible to authorized personnel.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              { icon: UserCog, title: "Role-Based Access", desc: "Granular permissions for Students, Doctors, and Administrators ensuring zero unauthorized access." },
              { icon: Lock, title: "Protected Records", desc: "Clinical data is isolated and encrypted, protected by advanced security protocols." },
              { icon: ShieldCheck, title: "Audit Logging", desc: "Every system action is logged in an immutable activity trail for total transparency and compliance." },
            ].map((item, i) => (
              <div key={i} className="group rounded-[40px] border border-white/10 bg-white/5 p-10 transition-all duration-700 hover:bg-white/10 hover:-translate-y-3">
                <div className="mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-cyan/20 text-cyan transition-all duration-500 group-hover:scale-110 group-hover:bg-cyan group-hover:text-navy shadow-xl shadow-cyan/10">
                  <item.icon className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold">{item.title}</h4>
                <p className="mt-6 text-base leading-relaxed text-white/40">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA SECTION ===================== */}
      <section id="ready" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-32">
        {/* Background */}
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img src="/images/upnm-campus.png" alt="UPNM Campus" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f1a]/95 via-[#0f1f1a]/80 to-[#0f1f1a]/95" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.5em] text-mint mb-8">Ready to Access?</h2>
          <h3 className="font-[Poppins] text-5xl font-extrabold tracking-tight text-white lg:text-8xl leading-tight">
            The Future of Campus Healthcare.
          </h3>
          <p className="mt-10 text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            Enter the UPNM clinical command center and experience the next generation of healthcare management.
          </p>
          <div className="mt-16 flex flex-col items-center gap-8">
            <Link
              href="/dashboard"
              className="group relative flex items-center gap-4 rounded-full bg-gradient-to-r from-cyan to-mint px-16 py-6 text-xl font-bold text-navy shadow-[0_30px_60px_-15px_rgba(122,158,126,0.6)] transition-all hover:scale-105 hover:shadow-mint/50 active:scale-95"
            >
              Access Clinical System <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
            <div className="flex items-center gap-3 text-white/40 text-sm font-bold uppercase tracking-widest">
              <ShieldCheck className="h-5 w-5 text-mint" />
              Secure Role-Based Access Verified
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-20 dark:bg-black/40 border-t border-navy/5 dark:border-white/5">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
            <div className="flex items-center gap-4">
              <img src="/images/upnm-logo.png" alt="UPNM" className="h-10 w-10 drop-shadow-md" />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-navy dark:text-white">UPNM CMS 2.0</span>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Clinical Management System</div>
              </div>
            </div>
            <div className="text-sm text-slate-400 font-medium">
              © {new Date().getFullYear()} UPNM Health Centre — Kem Sungai Besi.
            </div>
            <div className="flex gap-10">
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-mint transition-colors">Privacy Policy</button>
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-mint transition-colors">Terms of Service</button>
            </div>
          </div>
          <div className="mt-10 pt-10 border-t border-navy/5 dark:border-white/5 text-center">
             <span className="font-[Poppins] text-[10px] font-bold uppercase tracking-[0.8em] text-slate-300 dark:text-white/10">
                Kewajipan. Maruah. Integriti
             </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
