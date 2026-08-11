"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import {
  ArrowRight, Menu, X, Users, Stethoscope, UserCog,
  CalendarCheck, ClipboardList, FileText, Pill, ShieldCheck, Lock,
  KeyRound, FolderLock, Workflow, GraduationCap, CheckCircle2,
  ListOrdered, Boxes,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Home", href: "#top" },
  { label: "About", href: "#about" },
  { label: "Services", href: "#capabilities" },
  { label: "Doctors", href: "#roles" },
  { label: "Blog", href: "#insights" },
];

const WORKFLOW_STEPS = [
  { n: "01", title: "Appointment", icon: CalendarCheck },
  { n: "02", title: "Queue", icon: ListOrdered },
  { n: "03", title: "Consultation", icon: Stethoscope },
  { n: "04", title: "Medical Record", icon: FileText },
  { n: "05", title: "Prescription", icon: ClipboardList },
  { n: "06", title: "Pharmacy", icon: Pill },
];

const ROLE_PREVIEWS = {
  student: {
    label: "Student / Lecturer",
    icon: GraduationCap,
    items: ["Book Appointment", "Appointment Status", "Medical Records", "Prescription History"],
  },
  doctor: {
    label: "Doctor",
    icon: Stethoscope,
    items: ["Today's Queue", "Patient Consultation", "Clinical Notes", "Medical Records", "Prescription"],
  },
  admin: {
    label: "Administrator",
    icon: UserCog,
    items: ["User Management", "Role Management", "System Monitoring", "Clinical Operations"],
  },
} as const;

// Hero system-preview rows (illustrative only — no live data, no real
// patient information). The `cycle` field marks which stages the active
// highlight steps through — Medical Records stays a constant "kept
// up to date" state since it isn't part of the appointment→...→completed
// sequence.
const HERO_PREVIEW_ITEMS = [
  { l: "Appointment Queue", v: "Scheduled", activeV: "In progress", cycle: true },
  { l: "Consultation", v: "Waiting", activeV: "In progress", cycle: true },
  { l: "Medical Records", v: "Up to date", activeV: "Up to date", cycle: false },
  { l: "Prescription", v: "Not started", activeV: "In progress", cycle: true },
  { l: "Pharmacy", v: "Not started", activeV: "Completed", cycle: true },
] as const;
const CYCLE_INDICES = HERO_PREVIEW_ITEMS.map((item, i) => (item.cycle ? i : null)).filter((i): i is number => i !== null);

/* Reveals children with a fade+translate as they enter the viewport. */
function Reveal({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setVisible(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); io.disconnect(); }
    }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out motion-reduce:transition-none motion-reduce:transform-none ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"} ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
    >
      {children}
    </div>
  );
}

/* The recurring "system node" motif — a small glowing point with slow
   breathing glow and expanding rings. Represents the central clinical
   system; reused in the hero, the workflow timeline and the architecture
   diagram for a consistent visual language. */
function SystemNode({ size = 10 }: { size?: number }) {
  return (
    <span className="lp-node-wrap" style={{ width: size, height: size }}>
      <span className="lp-ring" />
      <span className="lp-ring lp-ring-2" />
      <span className="lp-node" />
    </span>
  );
}

/* Gates the workflow pipeline's staggered reveal on a single viewport-entry
   flip, so the connecting line and each node/label can cascade in with
   pure CSS transition-delay — no continuous animation loop. */
function WorkflowPipeline({ children }: { children: (active: boolean) => React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") { setActive(true); return; }
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setActive(true); io.disconnect(); }
    }, { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return <div ref={ref}>{children(active)}</div>;
}

export default function LandingPage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeRole, setActiveRole] = useState<keyof typeof ROLE_PREVIEWS>("doctor");
  const [previewStage, setPreviewStage] = useState(0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Very slow, subtle auto-cycle through the hero preview's stages —
  // illustrative only, never implies live data. Respects reduced motion by
  // simply leaving the first stage highlighted (no interval started).
  useEffect(() => {
    if (typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const iv = setInterval(() => {
      setPreviewStage((s) => (s + 1) % CYCLE_INDICES.length);
    }, 6000);
    return () => clearInterval(iv);
  }, []);

  const RoleIcon = ROLE_PREVIEWS[activeRole].icon;

  return (
    <div id="top" className="min-h-screen overflow-x-hidden bg-white font-['Inter',_sans-serif] text-[#0f1b2a]">
      {/* Scoped styles for the system-node motif and slow floating preview —
         kept local to this page rather than added to the shared globals.css. */}
      <style>{`
        .lp-node-wrap { position: relative; display: inline-flex; align-items: center; justify-content: center; }
        .lp-node { position: absolute; inset: 0; border-radius: 9999px; background: #2dd4bf; box-shadow: 0 0 12px 2px rgba(45,212,191,0.55); animation: lpBreathe 3.6s ease-in-out infinite; }
        .lp-ring { position: absolute; inset: 0; border-radius: 9999px; border: 1px solid rgba(45,212,191,0.55); animation: lpRing 3.6s ease-out infinite; }
        .lp-ring-2 { animation-delay: 1.8s; }
        @keyframes lpBreathe { 0%, 100% { opacity: 0.6; transform: scale(1); } 50% { opacity: 1; transform: scale(1.2); } }
        @keyframes lpRing { 0% { transform: scale(0.8); opacity: 0.45; } 100% { transform: scale(3.2); opacity: 0; } }
        .lp-float { animation: lpFloat 7s ease-in-out infinite; }
        @keyframes lpFloat { 0%, 100% { transform: translateY(-4px); } 50% { transform: translateY(4px); } }
        .lp-pipe-fill { transform: scaleX(0); transform-origin: left; transition: transform 0.8s cubic-bezier(0.22,1,0.36,1); }
        .lp-pipe-fill.lp-vertical { transform: scaleY(0); transform-origin: top; }
        .lp-pipe-fill.lp-on { transform: scaleX(1); }
        .lp-pipe-fill.lp-on.lp-vertical { transform: scaleY(1); }
        .lp-pipe-node { opacity: 0.35; transform: scale(0.85); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
        .lp-pipe-node.lp-on { opacity: 1; transform: scale(1); }
        .lp-pipe-label { opacity: 0; transform: translateY(6px); transition: opacity 0.6s ease-out, transform 0.6s ease-out; }
        .lp-pipe-label.lp-on { opacity: 1; transform: translateY(0); }
        @media (prefers-reduced-motion: reduce) {
          .lp-node, .lp-ring, .lp-float { animation: none !important; }
          .lp-pipe-fill, .lp-pipe-node, .lp-pipe-label { transition: none !important; transform: none !important; opacity: 1 !important; }
        }
      `}</style>

      {/* ============ NAV ============ */}
      <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled ? "bg-[#0b1a1a]/90 shadow-lg shadow-black/10 backdrop-blur-md" : "bg-transparent"}`}>
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10">
          <Link href="#top" className="leading-tight">
            <span className="block font-['Poppins',_sans-serif] text-base font-bold tracking-tight text-white">UPNM</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.15em] text-white/45">Clinical Management System 2.0</span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href} className="text-sm font-medium text-white/70 transition hover:text-white">
                {l.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <Link
              href="/login"
              className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#5b9bf7] px-5 py-2.5 text-sm font-semibold text-[#0b1a1a] transition hover:brightness-105"
            >
              Book An Appointment
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>

          <button aria-label="Toggle menu" onClick={() => setMenuOpen((v) => !v)} className="rounded-lg p-2 text-white md:hidden">
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-white/10 bg-[#0b1a1a] px-6 py-4 md:hidden">
            <div className="flex flex-col gap-1">
              {NAV_LINKS.map((l) => (
                <a key={l.label} href={l.href} onClick={() => setMenuOpen(false)} className="rounded-lg px-2 py-2.5 text-sm font-medium text-white/80 hover:bg-white/5 hover:text-white">
                  {l.label}
                </a>
              ))}
              <Link href="/login" onClick={() => setMenuOpen(false)} className="mt-2 flex items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#5b9bf7] px-5 py-2.5 text-sm font-semibold text-[#0b1a1a]">
                Book An Appointment <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ============ HERO ============ */}
      <section className="relative flex min-h-screen items-center overflow-hidden bg-[#0b1a1a] pt-28 pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
          <div className="absolute right-[-10%] top-[5%] h-[420px] w-[420px] rounded-full opacity-20 blur-[110px]" style={{ background: "radial-gradient(circle, #2dd4bf, transparent 70%)" }} />
          <div className="absolute left-[-10%] bottom-[0%] h-[320px] w-[320px] rounded-full opacity-10 blur-[100px]" style={{ background: "radial-gradient(circle, #5b9bf7, transparent 70%)" }} />
        </div>

        <div className="relative z-10 mx-auto grid max-w-7xl grid-cols-1 gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-10">
          <div>
            {/* institutional label + system node */}
            <div className="animate-fade-up motion-reduce:animate-none flex items-center gap-2.5" style={{ animationDelay: "150ms" }}>
              <span className="text-[11px] font-bold uppercase tracking-[0.25em] text-white/70">UPNM</span>
              <SystemNode size={7} />
              <span className="text-[10px] font-medium uppercase tracking-[0.18em] text-white/40">Kewajipan &middot; Maruah &middot; Integriti</span>
            </div>

            {/* faint connecting line — node → headline */}
            <div className="animate-fade-up motion-reduce:animate-none mt-3 h-6 w-px bg-gradient-to-b from-white/15 to-transparent" style={{ animationDelay: "350ms" }} />

            <h1 className="mt-1 max-w-xl font-['Poppins',_sans-serif] text-5xl font-semibold leading-[1.1] tracking-tight text-white lg:text-6xl">
              <span className="animate-fade-up motion-reduce:animate-none block" style={{ animationDelay: "600ms" }}>One Platform.</span>
              <span className="animate-fade-up motion-reduce:animate-none mt-1 block bg-gradient-to-r from-[#2dd4bf] to-[#5b9bf7] bg-clip-text text-transparent" style={{ animationDelay: "750ms" }}>Every Clinical Workflow.</span>
            </h1>

            <p className="animate-fade-up motion-reduce:animate-none mt-6 max-w-md text-base leading-relaxed text-white/55" style={{ animationDelay: "1100ms" }}>
              UPNM Clinical Management System 2.0 is a unified digital platform connecting appointments, patient records, consultations, prescriptions, and pharmacy workflows — with role-based access for the UPNM community.
            </p>

            <div className="animate-fade-up motion-reduce:animate-none mt-9 flex flex-wrap items-center gap-4" style={{ animationDelay: "1500ms" }}>
              <Link href="/login" className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#5b9bf7] px-6 py-3.5 text-sm font-semibold text-[#0b1a1a] shadow-lg shadow-[#2dd4bf]/10 transition hover:brightness-105">
                Book An Appointment
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <a href="#capabilities" className="text-sm font-semibold text-white/60 underline-offset-4 transition hover:text-white hover:underline">
                Explore the system
              </a>
            </div>
          </div>

          {/* System preview — floating product-style card */}
          <div className="relative hidden lg:block">
            <div
              className="lp-float motion-reduce:animate-none animate-fade-up motion-reduce:opacity-100 ml-auto w-full max-w-sm rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-2xl shadow-black/40 backdrop-blur-xl"
              style={{ animationDelay: "1700ms" }}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/45">System Preview</p>
                <SystemNode size={7} />
              </div>
              <p className="mt-2 font-['Poppins',_sans-serif] text-sm font-semibold text-white">Clinical Overview</p>

              <div className="mt-5 space-y-3.5">
                {HERO_PREVIEW_ITEMS.map((r, i) => {
                  const active = i === CYCLE_INDICES[previewStage];
                  return (
                    <div key={r.l} className={`flex items-center justify-between border-b border-white/5 pb-3 transition-all duration-700 last:border-0 last:pb-0 ${active ? "opacity-100" : "opacity-60"}`}>
                      <span className={`flex items-center gap-2 text-xs ${active ? "text-white" : "text-white/60"}`}>
                        <span className={`h-1.5 w-1.5 rounded-full transition-all duration-700 ${active ? "bg-[#2dd4bf] shadow-[0_0_6px_1px_rgba(45,212,191,0.6)]" : "bg-white/15"}`} />
                        {r.l}
                      </span>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] font-medium transition-colors duration-700 ${active ? "bg-[#2dd4bf]/15 text-[#2dd4bf]" : "bg-white/5 text-white/40"}`}>{active ? r.activeV : r.v}</span>
                    </div>
                  );
                })}
              </div>
              <p className="mt-4 text-[10px] text-white/25">Illustrative interface — not live data</p>
            </div>
          </div>
        </div>
      </section>

      {/* ============ SECTION 01 — SYSTEM INTRODUCTION ============ */}
      <section id="about" className="bg-[#0b1a1a] py-24">
        <div className="mx-auto max-w-4xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="font-['Poppins',_sans-serif] text-3xl font-semibold leading-tight tracking-tight text-white sm:text-4xl">
              Designed around the way clinical care happens.
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-sm leading-relaxed text-white/50">
              Campus healthcare moves through distinct stages — booking, waiting, consultation, records, and treatment. The platform connects each of those stages into a single, continuous workflow instead of separate, disconnected tools.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-widest text-white/40">
              <span>One platform</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Multiple workflows</span>
              <span className="h-1 w-1 rounded-full bg-white/20" />
              <span>Connected users</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 02 — ONE SYSTEM, THREE ROLES ============ */}
      <section id="roles" className="bg-[#f8fafc] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5b9bf7]">Doctors &amp; roles</p>
            <h2 className="mt-3 max-w-xl font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-[#0f1b2a] sm:text-4xl">
              One system.<br />Three perspectives.
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
              {/* Role selector */}
              <div className="flex gap-2 lg:flex-col">
                {(Object.keys(ROLE_PREVIEWS) as (keyof typeof ROLE_PREVIEWS)[]).map((key, i) => {
                  const role = ROLE_PREVIEWS[key];
                  const active = activeRole === key;
                  return (
                    <button
                      key={key}
                      onClick={() => setActiveRole(key)}
                      className={`flex flex-1 items-center gap-3 rounded-xl border px-4 py-4 text-left transition lg:flex-none ${active ? "border-[#0f1b2a] bg-[#0f1b2a] text-white shadow-lg" : "border-slate-200 bg-white text-[#0f1b2a] hover:border-slate-300"}`}
                    >
                      <span className={`font-mono text-xs ${active ? "text-[#2dd4bf]" : "text-slate-300"}`}>0{i + 1}</span>
                      <role.icon className={`h-4 w-4 ${active ? "text-[#2dd4bf]" : "text-slate-400"}`} />
                      <span className="hidden text-sm font-medium sm:block">{role.label}</span>
                    </button>
                  );
                })}
              </div>

              {/* Workspace preview */}
              <div className="rounded-2xl border border-slate-200 bg-white p-8">
                <div key={activeRole} className="animate-fade-in motion-reduce:animate-none">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#0f1b2a]/[0.04]">
                        <RoleIcon className="h-5 w-5 text-[#0f1b2a]/70" />
                      </div>
                      <p className="font-['Poppins',_sans-serif] text-lg font-semibold text-[#0f1b2a]">{ROLE_PREVIEWS[activeRole].label}</p>
                    </div>
                    {activeRole === "doctor" && (
                      <span className="rounded-full bg-[#2dd4bf]/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-[#0e9488]">Central clinical workflow</span>
                    )}
                  </div>

                  {activeRole === "doctor" && (
                    <div className="mt-5 flex items-center gap-4 rounded-xl border border-slate-100 bg-[#f8fafc] px-4 py-3.5">
                      <div className="grid h-9 w-9 place-items-center rounded-lg bg-[#0f1b2a]/[0.04]">
                        <ListOrdered className="h-4 w-4 text-[#0f1b2a]/60" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-[#0f1b2a]">Today&apos;s Queue</p>
                        <p className="text-xs text-slate-400">Illustrative — patients waiting for consultation</p>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {ROLE_PREVIEWS[activeRole].items.map((item) => (
                      <div key={item} className="flex items-center gap-2.5 rounded-xl border border-slate-100 px-4 py-3.5 text-sm text-slate-600">
                        <CheckCircle2 className="h-4 w-4 shrink-0 text-[#0e9488]" />
                        {item}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 03 — CLINICAL WORKFLOW ============ */}
      <section className="bg-[#0b1a1a] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">Process</p>
            <h2 className="mt-3 max-w-xl font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              From appointment to treatment.
            </h2>
          </Reveal>

          <WorkflowPipeline>
            {(active) => (
              <div className="mt-16 flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-0">
                {WORKFLOW_STEPS.map((s, i) => (
                  <div key={s.n} className="flex items-start gap-4 lg:flex-1 lg:flex-col lg:items-start lg:gap-0">
                    {/* icon + connector: vertical stack on mobile, horizontal row on desktop */}
                    <div className="flex flex-col items-center lg:mb-4 lg:w-full lg:flex-row">
                      <div className={`lp-pipe-node ${active ? "lp-on" : ""}`} style={{ transitionDelay: `${i * 350}ms` }}>
                        <SystemNode size={9} />
                      </div>
                      {i < WORKFLOW_STEPS.length - 1 && (
                        <>
                          <div className="relative mt-2 w-px flex-1 overflow-hidden bg-white/10 lg:hidden" style={{ minHeight: "24px" }}>
                            <div className={`lp-pipe-fill lp-vertical absolute inset-0 w-full bg-gradient-to-b from-[#2dd4bf] to-[#5b9bf7] ${active ? "lp-on" : ""}`} style={{ transitionDelay: `${i * 350 + 120}ms` }} />
                          </div>
                          <div className="relative ml-2 hidden h-px flex-1 overflow-hidden bg-white/10 lg:block">
                            <div className={`lp-pipe-fill absolute inset-0 h-full bg-gradient-to-r from-[#2dd4bf] to-[#5b9bf7] ${active ? "lp-on" : ""}`} style={{ transitionDelay: `${i * 350 + 120}ms` }} />
                          </div>
                        </>
                      )}
                    </div>
                    <div className={`lp-pipe-label pb-2 lg:pb-0 ${active ? "lp-on" : ""}`} style={{ transitionDelay: `${i * 350 + 220}ms` }}>
                      <span className="font-mono text-xs text-white/30">{s.n}</span>
                      <div className="mt-1 flex items-center gap-2">
                        <s.icon className="h-4 w-4 text-white/50" />
                        <p className="text-sm font-semibold text-white">{s.title}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </WorkflowPipeline>
        </div>
      </section>

      {/* ============ SECTION 04 — SYSTEM CAPABILITIES ============ */}
      <section id="capabilities" className="bg-[#f8fafc] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5b9bf7]">Services</p>
            <h2 className="mt-3 max-w-xl font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-[#0f1b2a] sm:text-4xl">
              System capabilities.
            </h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Users, title: "Patient Management", desc: "A structured record for every patient — demographics, history, and status in one place.", big: true },
              { icon: CalendarCheck, title: "Appointments & Queue", desc: "Scheduling with a live clinical queue reflecting what's happening today." },
              { icon: FileText, title: "Electronic Medical Records", desc: "Chief complaints, vitals, diagnoses and treatment plans, captured consistently.", big: true },
              { icon: ClipboardList, title: "Prescriptions", desc: "Structured prescribing, tied directly to the patient record." },
              { icon: Pill, title: "Pharmacy / Dispensary", desc: "Dispensing tracked against inventory, step by step." },
              { icon: Workflow, title: "Doctor Workflows", desc: "Consultation, diagnosis and prescription in one clinical workspace." },
              { icon: ShieldCheck, title: "Role-Based Access", desc: "Students, doctors and administrators each see exactly what their role requires.", big: true },
            ].map((c) => (
              <Reveal key={c.title} className={c.big ? "sm:col-span-2 lg:col-span-1" : ""}>
                <div className={`group h-full rounded-2xl border border-slate-200 bg-white p-7 transition hover:border-[#2dd4bf]/40 hover:shadow-lg hover:shadow-[#2dd4bf]/5 ${c.big ? "lg:row-span-1" : ""}`}>
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#0f1b2a]/[0.04] transition group-hover:bg-[#2dd4bf]/10">
                    <c.icon className="h-5 w-5 text-[#0f1b2a]/70 transition group-hover:text-[#0e9488]" />
                  </div>
                  <h3 className="mt-5 font-['Poppins',_sans-serif] text-base font-semibold text-[#0f1b2a]">{c.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-500">{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ SECTION 05 — PRODUCT UI SHOWCASE ============ */}
      <section className="bg-[#0b1a1a] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <Reveal>
            <p className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">Inside the platform</p>
            <h2 className="mt-3 max-w-xl font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Built for real clinical workflows.
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-14 overflow-hidden rounded-2xl border border-white/10 bg-[#0e211f] shadow-2xl shadow-black/40">
              <div className="flex items-center gap-1.5 border-b border-white/5 px-5 py-3.5">
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="h-2.5 w-2.5 rounded-full bg-white/15" />
                <span className="ml-3 text-[11px] text-white/30">Clinical Management System — preview</span>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[180px_1fr]">
                <div className="hidden border-r border-white/5 p-4 lg:block">
                  {["Dashboard", "Patients", "Appointments", "Medical Records", "Pharmacy", "Analytics"].map((s, i) => (
                    <div key={s} className={`mb-1 rounded-lg px-3 py-2 text-xs ${i === 0 ? "bg-[#2dd4bf]/10 text-[#2dd4bf]" : "text-white/40"}`}>{s}</div>
                  ))}
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    {[["Patients Today", "—"], ["Pending Rx", "—"], ["Inventory Alerts", "—"]].map(([l, v]) => (
                      <div key={l} className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                        <div className="font-mono text-2xl font-bold text-white/80">{v}</div>
                        <div className="mt-1 text-[11px] text-white/40">{l}</div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="mb-3 text-xs font-semibold text-white/60">Patient Queue</p>
                      <div className="flex gap-2">
                        {["Now serving", "Next", "Waiting"].map((l, i) => (
                          <div key={l} className="flex-1 rounded-lg border border-white/5 p-3 text-center">
                            <div className="font-mono text-lg font-bold text-white/70">#{i + 1}</div>
                            <div className="text-[10px] text-white/30">{l}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                      <p className="mb-3 text-xs font-semibold text-white/60">Consultation</p>
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-full bg-white/10" />
                        <div className="flex-1">
                          <div className="h-2.5 w-24 rounded bg-white/15" />
                          <div className="mt-1.5 h-2 w-16 rounded bg-white/10" />
                        </div>
                      </div>
                      <div className="mt-3 flex gap-2">
                        <span className="rounded-full bg-[#2dd4bf]/10 px-2.5 py-1 text-[10px] text-[#2dd4bf]">Record updated</span>
                        <span className="rounded-full bg-[#5b9bf7]/10 px-2.5 py-1 text-[10px] text-[#5b9bf7]">Rx pending</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.03] p-4">
                    <p className="mb-3 text-xs font-semibold text-white/60">Prescription Area</p>
                    <div className="space-y-2">
                      {["Patient #1042", "Patient #1048"].map((p) => (
                        <div key={p} className="flex items-center justify-between rounded-lg border border-white/5 px-3 py-2 text-xs">
                          <span className="text-white/60">{p}</span>
                          <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-white/40">Pending</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <p className="mt-3 text-center text-[11px] text-white/25">Illustrative interface preview — not connected to live data</p>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 06 — SYSTEM ARCHITECTURE ============ */}
      <section className="bg-[#f8fafc] py-24">
        <div className="mx-auto max-w-3xl px-6 lg:px-10">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#5b9bf7]">How it connects</p>
            <h2 className="mt-3 text-center font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-[#0f1b2a] sm:text-4xl">
              One system, mapped simply.
            </h2>
          </Reveal>

          <Reveal delay={150}>
            <div className="mt-14 flex flex-col items-center gap-3">
              <ArchTier label="UPNM Users" items={["Student / Lecturer", "Doctor", "Administrator"]} />
              <ArchConnector />
              <ArchTier label="Clinical Management Platform" items={[]} dominant />
              <ArchConnector />
              <ArchTier label="Core Workflows" items={["Appointments", "Medical Records", "Prescriptions", "Pharmacy"]} />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ SECTION 07 — SECURITY ============ */}
      <section className="bg-[#0b1a1a] py-24">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 items-center gap-14 lg:grid-cols-2">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#2dd4bf]">Trust</p>
              <h2 className="mt-3 font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                Controlled access.<br />Clear responsibilities.
              </h2>
              <ul className="mt-8 space-y-3.5">
                {["Role-Based Access", "Authenticated Sessions", "Protected Clinical Records"].map((t) => (
                  <li key={t} className="flex items-start gap-3 text-sm text-white/70">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#2dd4bf]" />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>

            <Reveal delay={150}>
              <div className="relative mx-auto grid h-64 w-64 place-items-center">
                <div className="absolute inset-0 rounded-full border border-white/5" />
                <div className="absolute inset-10 rounded-full border border-white/5" />
                <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-[#2dd4bf]/15 to-[#5b9bf7]/15 backdrop-blur-md">
                  <ShieldCheck className="h-9 w-9 text-[#2dd4bf]" />
                </div>
                {[Lock, KeyRound, FolderLock].map((Icon, i) => (
                  <div
                    key={i}
                    className="absolute grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/5 backdrop-blur-md"
                    style={{ top: i === 0 ? "4%" : i === 1 ? "72%" : "38%", left: i === 0 ? "74%" : i === 1 ? "6%" : "86%" }}
                  >
                    <Icon className="h-4 w-4 text-white/60" />
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ============ SECTION 08 — HOW IT WORKS ============ */}
      <section className="bg-[#f8fafc] py-24">
        <div className="mx-auto max-w-4xl px-6 lg:px-10">
          <Reveal>
            <p className="text-center text-xs font-semibold uppercase tracking-wider text-[#5b9bf7]">Process</p>
            <h2 className="mt-3 text-center font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-[#0f1b2a] sm:text-4xl">How it works.</h2>
          </Reveal>

          <div className="mt-14 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {[
              { n: "01", title: "Book", desc: "Patient schedules an appointment." },
              { n: "02", title: "Consult", desc: "Doctor reviews the patient and records clinical information." },
              { n: "03", title: "Manage Treatment", desc: "Prescription and follow-up are managed within the system." },
            ].map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="text-center">
                  <span className="font-mono text-sm text-[#0e9488]">{s.n}</span>
                  <h3 className="mt-2 font-['Poppins',_sans-serif] text-base font-semibold text-[#0f1b2a]">{s.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ============ INSIGHTS / BLOG PLACEHOLDER ============ */}
      <section id="insights" className="border-t border-white/5 bg-[#0b1a1a] py-14">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-2 px-6 text-center lg:px-10">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-white/40">
            <Boxes className="h-3.5 w-3.5" /> Insights
          </div>
          <p className="text-sm text-white/50">Updates on the UPNM Clinical Management System will be published here. Coming soon.</p>
        </div>
      </section>

      {/* ============ FINAL CTA ============ */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0b1a1a] via-[#0f2420] to-[#0b1a1a] py-28">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[300px] w-[600px] -translate-x-1/2 rounded-full opacity-20 blur-[110px]" style={{ background: "radial-gradient(circle, #2dd4bf, transparent 70%)" }} />
        <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-10">
          <Reveal>
            <h2 className="font-['Poppins',_sans-serif] text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              Ready to access the clinical system?
            </h2>
            <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-white/55">
              Connect with the UPNM Clinical Management System and manage your healthcare journey through one unified platform.
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Link href="/login" className="group flex items-center gap-2 rounded-full bg-gradient-to-r from-[#2dd4bf] to-[#5b9bf7] px-7 py-3.5 text-sm font-semibold text-[#0b1a1a] shadow-lg shadow-[#2dd4bf]/10 transition hover:brightness-105">
                Access System
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
              <Link href="/login" className="rounded-full border border-white/15 px-7 py-3.5 text-sm font-semibold text-white/80 backdrop-blur-md transition hover:border-white/30 hover:text-white">
                Sign In
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ============ FOOTER ============ */}
      <footer className="bg-[#060d16] py-16">
        <div className="mx-auto max-w-7xl px-6 lg:px-10">
          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="font-['Poppins',_sans-serif] text-base font-bold text-white">UPNM</p>
              <p className="text-xs text-white/40">Clinical Management System 2.0</p>
              <p className="mt-3 max-w-xs text-xs leading-relaxed text-white/35">
                A unified clinical platform connecting appointments, records, and pharmacy workflows for the UPNM community.
              </p>
            </div>
            <FooterCol title="System" links={[{ l: "Student / Lecturer", h: "#roles" }, { l: "Doctor", h: "#roles" }, { l: "Administrator", h: "#roles" }]} />
            <FooterCol title="Capabilities" links={[{ l: "Appointments", h: "#capabilities" }, { l: "Medical Records", h: "#capabilities" }, { l: "Prescriptions", h: "#capabilities" }, { l: "Pharmacy", h: "#capabilities" }]} />
            <FooterCol title="Access" links={[{ l: "Sign In", h: "/login" }, { l: "Register", h: "/register" }]} />
          </div>
          <div className="mt-12 border-t border-white/5 pt-6 text-center text-[11px] text-white/30">
            &copy; 2026 UPNM Clinical Management System
          </div>
        </div>
      </footer>
    </div>
  );
}

function FooterCol({ title, links }: { title: string; links: { l: string; h: string }[] }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider text-white/40">{title}</p>
      <ul className="mt-3 space-y-2">
        {links.map((link) => (
          <li key={link.l}>
            {link.h.startsWith("/") ? (
              <Link href={link.h} className="text-xs text-white/50 transition hover:text-white">{link.l}</Link>
            ) : (
              <a href={link.h} className="text-xs text-white/50 transition hover:text-white">{link.l}</a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

function ArchTier({ label, items, dominant = false }: { label: string; items: string[]; dominant?: boolean }) {
  return (
    <div className={`w-full max-w-lg rounded-2xl border p-5 text-center ${dominant ? "border-[#0f1b2a] bg-[#0f1b2a] text-white" : "border-slate-200 bg-white"}`}>
      <p className={`text-xs font-bold uppercase tracking-wider ${dominant ? "text-[#2dd4bf]" : "text-[#0f1b2a]"}`}>{label}</p>
      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
          {items.map((i) => (
            <span key={i} className={`rounded-full px-3 py-1 text-[11px] font-medium ${dominant ? "bg-white/10 text-white/80" : "bg-slate-100 text-slate-600"}`}>{i}</span>
          ))}
        </div>
      )}
    </div>
  );
}

function ArchConnector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-6 w-px bg-slate-300" />
      <SystemNode size={6} />
      <div className="h-6 w-px bg-slate-300" />
    </div>
  );
}
