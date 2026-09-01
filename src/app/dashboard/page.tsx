"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Counter, Badge, statusColor, Skeleton } from "@/components/ui";
import { AreaChart, DonutChart, Gauge } from "@/components/charts";

import {
  CalendarCheck, Users, Stethoscope, FlaskConical,
  Clock, AlertTriangle, Sparkles, Brain, ShieldAlert,
  User as UserIcon, ArrowRight, ArrowUpRight, Pill, PackageSearch,
  CheckCircle2, Loader2, FileText, ClipboardList, BarChart3,
  ShieldCheck, Activity,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";

interface DashData {
  stats: { todayAppointments: number; activePatients: number; availableDoctors: number; pendingLabs: number };
  queue: { id: number; patientName: string; status: string; queueNumber: number | null; doctorName: string; department?: string; time: string }[];
  recent: { id: number; patientName: string; action: string; urgency: string; createdAt: string }[];
  trend: { day: string; count: number }[];
  byDept: { department: string; count: number }[];
  criticalLabs: { id: number; patientId: number; patientName: string; testName: string; value: string; flag: string }[];
}
interface RxLite { id: number; patientId: number; patientName: string; status: string; medications: { name: string; quantity?: number }[]; }
interface InvLite { id: number; name: string; stock: number; minStock: number; }
interface RecordLite { id: number; patientId: number; patientName: string; doctorName: string; diagnosis: string | null; chiefComplaint: string | null; treatmentPlan?: string | null; prescriptionId: number | null; createdAt: string; }

const DEPT_COLORS: Record<string, string> = { General: "#1f3d3a", Dental: "#7a9e7e", "Mental Health": "#c9955a", Emergency: "#c25d5d" };

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

// Best-effort icon for a free-text activity log entry, derived purely from
// keywords already present in the real `action` string — no new data.
function activityIcon(action: string): React.ElementType {
  const a = action.toLowerCase();
  if (a.includes("dispensing")) return Loader2;
  if (a.includes("collected")) return CheckCircle2;
  if (a.includes("prescription created")) return FileText;
  if (a.includes("consultation")) return Stethoscope;
  if (a.includes("appointment") || a.includes("booked")) return CalendarCheck;
  return Activity;
}

interface ParsedActivity { title: string; meta: string[] }

// Turns the existing free-text `activities.action` log strings (see
// insertPrescription / prescriptions, medical-records and appointments
// API routes for the exact formats produced) into a short title + metadata
// lines for a scannable timeline card. Purely presentational — no new
// data is invented, and any string that doesn't match a known pattern
// still renders sensibly via the fallback at the bottom.
function parseActivity(action: string): ParsedActivity {
  let m: RegExpMatchArray | null;

  m = action.match(/^prescription created for (Rx #\d+) — (.+?) \((Dr\.[^)]+)\)$/i);
  if (m) return { title: "Prescription Created", meta: [`${m[1]} · ${m[2]}`, m[3]] };

  m = action.match(/^medication dispensing started for (Rx #\d+) — (.+?) \((Dr\.[^)]+)\)$/i);
  if (m) return { title: "Dispensing Started", meta: [`${m[1]} · ${m[2]}`, m[3]] };

  m = action.match(/^medication collected by patient for (Rx #\d+)$/i);
  if (m) return { title: "Medication Collected", meta: [m[1]] };

  m = action.match(/^consultation recorded for .+? \((Dr\.[^)]+)\)(?: — (.+))?$/i);
  if (m) return { title: "Consultation Recorded", meta: m[2] ? [m[2], m[1]] : [m[1]] };

  m = action.match(/^booked (.+?) appointment on (.+)$/i);
  if (m) return { title: "Appointment Booked", meta: [`${m[1]} appointment · ${m[2]}`] };

  m = action.match(/^registered automatically via appointment booking$/i);
  if (m) return { title: "Patient Auto-Registered", meta: ["via appointment booking"] };

  m = action.match(/^registered as new patient$/i);
  if (m) return { title: "Patient Registered", meta: [] };

  return { title: action.charAt(0).toUpperCase() + action.slice(1), meta: [] };
}

export default function DashboardPage() {
  const session = getSession();
  return session?.role === "doctor" ? <MedicalOfficerDashboard /> : <AdminDashboard />;
}

function MedicalOfficerDashboard() {
  const { data, loading } = useApi<DashData>("/api/dashboard", 30000);
  const { data: rxData } = useApi<{ prescriptions: RxLite[] }>("/api/prescriptions", 30000);
  const { data: recData } = useApi<{ medicalRecords: RecordLite[] }>("/api/medical-records", 30000);
  const { data: labData } = useApi<{ labResults: { id: number; patientName: string; testName: string; value: string; flag: string }[] }>("/api/lab-results", 30000);
  const [greeting, setGreeting] = useState("Good afternoon");
  const [doctorName, setDoctorName] = useState("Doctor");
  useEffect(() => { const h = new Date().getHours(); setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening"); const user = getSession(); if (user) setDoctorName(user.name.replace(/^Dr\\.\\s*/i, "")); }, []);
  const queue = data?.queue ?? [];
  const waiting = queue.filter((item) => item.status === "Waiting");
  const next = waiting[0] ?? queue.find((item) => item.status === "Scheduled");
  const labs = labData?.labResults ?? data?.criticalLabs ?? [];
  const records = recData?.medicalRecords ?? [];
  const pendingNotes = records.filter((record) => !record.diagnosis).length;
  const followUps = records.filter((record) => record.treatmentPlan?.toLowerCase().includes("follow")).length;
  const pendingRx = (rxData?.prescriptions ?? []).filter((rx) => rx.status === "Pending").length;
  return <Shell>
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-bold uppercase tracking-[0.18em] text-mint">Clinical workspace</p><h1 className="font-[Poppins] text-3xl font-extrabold tracking-tight text-navy dark:text-white">{greeting}, Dr. {doctorName}</h1><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Here&apos;s your clinical overview for today.</p></div><Link href="/emr" className="flex items-center gap-2 rounded-xl bg-navy px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-navy/15 transition hover:-translate-y-0.5"><FileText className="h-4 w-4" /> Start consultation</Link></div>
    <div className="mb-7 grid gap-3 sm:grid-cols-2 xl:grid-cols-5"><ClinicalMetric icon={Users} label="Today&apos;s queue" value={waiting.length} sub={`${waiting.length === 1 ? "patient" : "patients"} waiting`} color="#7a9e7e" /><ClinicalMetric icon={Clock} label="Next consultation" value={next?.time ?? "—"} sub={next?.patientName ?? "No patient queued"} color="#c9955a" /><ClinicalMetric icon={FlaskConical} label="Lab results" value={labs.length} sub="Need review" color="#c25d5d" /><ClinicalMetric icon={ClipboardList} label="Pending notes" value={pendingNotes} sub="Clinical records" color="#1f3d3a" /><ClinicalMetric icon={Pill} label="Prescriptions" value={pendingRx} sub="Awaiting action" color="#d48040" /></div>
    <div className="grid gap-5 xl:grid-cols-[1.35fr_0.65fr]"><div className="card p-6"><div className="mb-5 flex items-center justify-between"><div><p className="text-xs font-bold uppercase tracking-wider text-mint">Your Clinical Day</p><h2 className="mt-1 font-[Poppins] text-xl font-bold text-navy dark:text-white">Today&apos;s queue</h2></div><span className="rounded-full bg-mint/10 px-3 py-1 text-xs font-semibold text-mint">{waiting.length ? `${waiting.length} waiting` : "You&apos;re all set"}</span></div>{loading ? <Skeleton className="h-48 w-full" /> : waiting.length ? <div className="space-y-2">{waiting.slice(0, 6).map((item, index) => <div key={item.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10"><div className="grid h-10 w-10 place-items-center rounded-xl bg-mint/10 font-mono text-sm font-bold text-mint">#{item.queueNumber ?? index + 1}</div><div className="min-w-0 flex-1"><div className="truncate text-sm font-semibold text-navy dark:text-white">{item.patientName}</div><div className="text-xs text-slate-400">{item.time} · {item.doctorName}</div></div><Link href={`/patients/${item.id}`} className="rounded-lg p-2 text-slate-400 transition hover:bg-mint/10 hover:text-mint"><ArrowRight className="h-4 w-4" /></Link></div>)}</div> : <div className="rounded-xl bg-mint/5 p-8 text-center"><CheckCircle2 className="mx-auto h-8 w-8 text-mint" /><p className="mt-2 text-sm font-semibold text-navy dark:text-white">You&apos;re all set for today.</p><p className="mt-1 text-xs text-slate-500">No patients are currently waiting.</p></div>}</div><div className="space-y-5"><div className="card p-6"><h2 className="font-[Poppins] font-bold text-navy dark:text-white">Clinical attention</h2><div className="mt-4 space-y-3"><ClinicalLink href="/patients" icon={Users} label="Patient records" detail="Review history and EMR" /><ClinicalLink href="/emr" icon={FileText} label="Clinical notes" detail={`${pendingNotes} records need completion`} /><ClinicalLink href="/pharmacy" icon={Pill} label="Prescriptions" detail={`${pendingRx} pending for pharmacy`} /><ClinicalLink href="/appointments" icon={CalendarCheck} label="Follow-ups" detail={`${followUps} follow-up records`} /></div></div><div className="card overflow-hidden bg-gradient-to-br from-navy to-[#2d5551] p-6 text-white"><div className="flex items-center gap-2 text-cyan"><Stethoscope className="h-4 w-4" /><span className="text-xs font-bold uppercase tracking-wider">Next consultation</span></div><div className="mt-3 font-[Poppins] text-2xl font-bold">{next?.time ?? "No upcoming slot"}</div><p className="mt-1 text-sm text-white/70">{next ? `${next.patientName} · ${next.department}` : "Your schedule is clear."}</p><Link href="/appointments" className="mt-5 inline-flex items-center gap-2 text-xs font-semibold text-cyan hover:underline">View appointments <ArrowRight className="h-3 w-3" /></Link></div></div></div>
  </Shell>;
}

function ClinicalMetric({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: number | string; sub: string; color: string }) { return <div className="card p-4"><div className="flex items-center gap-3"><div className="grid h-9 w-9 place-items-center rounded-xl" style={{ background: `${color}18` }}><Icon className="h-4 w-4" style={{ color }} /></div><div className="min-w-0"><div className="truncate text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</div><div className="font-mono text-xl font-bold text-navy dark:text-white">{value}</div><div className="truncate text-[11px] text-slate-400">{sub}</div></div></div></div>; }
function ClinicalLink({ href, icon: Icon, label, detail }: { href: string; icon: React.ElementType; label: string; detail: string }) { return <Link href={href} className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-mint/5"><div className="grid h-9 w-9 place-items-center rounded-lg bg-mint/10 text-mint"><Icon className="h-4 w-4" /></div><div className="min-w-0 flex-1"><div className="text-sm font-semibold text-navy dark:text-white">{label}</div><div className="truncate text-xs text-slate-400">{detail}</div></div><ArrowRight className="h-3.5 w-3.5 text-slate-300" /></Link>; }

function AdminDashboard() {
  const { data, loading } = useApi<DashData>("/api/dashboard", 30000);
  // Read-only calls to the existing, already-working GET endpoints so the
  // dashboard can show real pharmacy/inventory/consultation context instead
  // of inventing numbers. Nothing here writes data or changes any API.
  const { data: rxData } = useApi<{ prescriptions: RxLite[] }>("/api/prescriptions", 30000);
  const { data: invData } = useApi<{ inventory: InvLite[] }>("/api/inventory", 30000);
  const { data: recData } = useApi<{ medicalRecords: RecordLite[] }>("/api/medical-records", 30000);

  const [greeting, setGreeting] = useState("Good afternoon");
  const [name, setName] = useState("Doctor");
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    setToday(now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long", year: "numeric" }));
    const u = getSession();
    if (u) setName(u.name.split(" ").slice(-1)[0]);
  }, []);

  const stats = data?.stats ?? { todayAppointments: 0, activePatients: 0, availableDoctors: 0, pendingLabs: 0 };
  const trendData = data?.trend ?? [];
  const donut = (data?.byDept ?? []).map((d) => ({ label: d.department, value: d.count, color: DEPT_COLORS[d.department] ?? "#7a7168" }));

  const queue = data?.queue ?? [];
  const nowServing = queue.filter((q) => q.status === "In Consultation");
  const waiting = queue.filter((q) => q.status === "Waiting");
  const nextUp = waiting[0];
  const restWaiting = waiting.slice(1);
  const criticalCount = data?.criticalLabs?.length ?? 0;

  // Real pharmacy/inventory context, derived client-side from the existing
  // Pharmacy/Inventory endpoints — same fields the Pharmacy page itself
  // already uses (see src/app/pharmacy/page.tsx), just aggregated for an
  // at-a-glance summary. No new API routes, no fabricated numbers.
  const prescriptions = rxData?.prescriptions ?? [];
  const pendingRx = prescriptions.filter((p) => p.status === "Pending");
  const dispensingRx = prescriptions.filter((p) => p.status === "Dispensing");
  const collectedRx = prescriptions.filter((p) => p.status === "Collected");

  const inventory = invData?.inventory ?? [];
  const lowStock = inventory.filter((i) => i.stock < i.minStock);
  const inventoryHealth = inventory.length ? Math.round(((inventory.length - lowStock.length) / inventory.length) * 100) : 100;

  const recentRecords = (recData?.medicalRecords ?? []).slice(0, 5);

  // Each recommendation links to the real record that produced it (reusing
  // existing pages) instead of being a dead-end action. Recommendations that
  // are not derived from a specific patient's data fall back to Analytics,
  // matching the behavior already used by the "Quick Alerts" panel below.
  // Unchanged from V1 — same data, same hrefs.
  const topCriticalLab = data?.criticalLabs?.[0];
  const aiInsights = [
    {
      icon: ShieldAlert,
      color: "#c25d5d",
      title: "Critical potassium flagged",
      desc: topCriticalLab
        ? `Patient ${topCriticalLab.patientName} — ${topCriticalLab.testName} ${topCriticalLab.value} (${topCriticalLab.flag}). Review within 1h.`
        : "No critical labs currently flagged.",
      priority: "Urgent",
      href: topCriticalLab ? `/patients/${topCriticalLab.patientId}?tab=Lab+Results` : "/patients",
    },
    { icon: Brain, color: "#c9955a", title: "Drug interaction detected", desc: "Warfarin + Ibuprofen — moderate bleeding risk. Suggest acetaminophen alternative.", priority: "Warning", href: "/analytics" },
    { icon: Sparkles, color: "#7a9e7e", title: "Schedule optimization", desc: "Afternoon slots have 40% shorter waits. Recommend shifting routine visits to 14:00-16:00.", priority: "Insight", href: "/analytics" },
  ];

  return (
    <Shell>
      {/* ========== COMMAND CENTER HEADER ========== */}
      <div className="relative mb-8 overflow-hidden rounded-[24px] border border-navy/5 bg-gradient-to-br from-[#0f1f1a] via-navy to-[#16302c] p-8 text-white dark:border-white/5 lg:p-10">
        {/* Extremely subtle ambient treatment — radial glow + faint grid, no giant blobs */}
        <div className="pointer-events-none absolute inset-0 opacity-60">
          <div className="absolute inset-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px)", backgroundSize: "36px 36px" }} />
          <div className="absolute right-[-10%] top-[-30%] h-[380px] w-[380px] rounded-full opacity-20 blur-3xl" style={{ background: "radial-gradient(circle, #4fd1c5, transparent 70%)" }} />
        </div>

        <div className="relative z-10">
          {/* system status */}
          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white/70 backdrop-blur-md">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-mint opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-mint" />
              </span>
              Clinical workspace ready
            </div>
            <span className="text-xs font-medium uppercase tracking-widest text-white/40">{today || "\u00A0"}</span>
          </div>

          <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-cyan/80">Clinical Command Center</p>
              <h1 className="font-[Poppins] text-3xl font-bold leading-tight tracking-tight lg:text-[2.75rem]">
                {greeting}, Dr. {name}
              </h1>
              <p className="mt-2 max-w-lg text-sm text-white/55">
                Monitor today&apos;s patient activity, prescription workflow and AI-assisted insights
                {criticalCount > 0 ? ` — ${criticalCount} case${criticalCount === 1 ? "" : "s"} need${criticalCount === 1 ? "s" : ""} your attention.` : "."}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link href="/patients" className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white/70 backdrop-blur-md transition hover:border-white/25 hover:text-white">Patients</Link>
              <Link href="/pharmacy" className="rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5 text-xs font-medium text-white/70 backdrop-blur-md transition hover:border-white/25 hover:text-white">Pharmacy</Link>
              <Link href="/emr" className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan to-mint px-4 py-2.5 text-sm font-semibold text-navy shadow-lg shadow-cyan/10 transition hover:brightness-105">
                <FileText className="h-4 w-4" /> New Consultation
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ========== TODAY AT A GLANCE (hero metric) ========== */}
      <div className="card mb-8 p-6 lg:p-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center">
          <div className="lg:w-64 lg:shrink-0">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Today at a Glance</p>
            <div className="mt-2 flex items-end gap-2">
              <span className="font-mono text-6xl font-bold leading-none tracking-tight text-navy dark:text-white">
                {loading ? <Skeleton className="h-14 w-24" /> : <Counter value={stats.todayAppointments} />}
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">patients scheduled today</p>
          </div>

          <div className="grid flex-1 grid-cols-1 gap-5 border-slate-100 dark:border-white/10 sm:grid-cols-3 lg:border-l lg:pl-8">
            <GlanceMetric icon={Pill} color="#c9955a" label="Pending Prescriptions" value={pendingRx.length} loading={!rxData} sub="Awaiting dispensing" />
            <GlanceMetric icon={CheckCircle2} color="#7a9e7e" label="Completed Dispensing" value={collectedRx.length} loading={!rxData} sub="All-time collected" />
            <GlanceMetric icon={AlertTriangle} color={lowStock.length > 0 ? "#c25d5d" : "#7a9e7e"} label="Inventory Alerts" value={lowStock.length} loading={!invData} sub={lowStock.length > 0 ? "Requires attention" : "Stock is healthy"} />
          </div>
        </div>

        {/* Secondary operational stats — same real fields the dashboard has
           always shown (data.stats), given lighter visual weight below the
           hero metrics. */}
        <div className="mt-6 flex flex-col gap-3 border-t border-slate-100 pt-5 dark:border-white/10 sm:flex-row sm:divide-x sm:divide-slate-100 dark:sm:divide-white/10">
          <MiniStat icon={Stethoscope} color="text-cyan" label="Doctors on duty" value={stats.availableDoctors} loading={loading} />
          <MiniStat icon={FlaskConical} color="text-amber" label="Pending lab results" value={stats.pendingLabs} loading={loading} />
          <MiniStat icon={UserIcon} color="text-mint" label="Active patients" value={stats.activePatients} loading={loading} />
        </div>
      </div>

      {/* ========== LIVE QUEUE + AI INTELLIGENCE ========== */}
      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Live Queue — 2/3 */}
        <div className="card p-6 xl:col-span-2">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <h2 className="flex items-center gap-2 font-[Poppins] text-base font-semibold text-navy dark:text-white">
              Live Clinical Queue
            </h2>
            <span className="flex items-center gap-1.5 rounded-full bg-danger/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-danger">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-danger opacity-75 motion-reduce:animate-none" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-danger" />
              </span>
              Live
            </span>
          </div>

          {loading ? (
            <div className="flex gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-40" />)}</div>
          ) : queue.filter((q) => q.queueNumber).length > 0 ? (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              {/* Now Serving */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Now Serving</p>
                {nowServing.length > 0 ? nowServing.slice(0, 1).map((q) => (
                  <div key={q.id} className="rounded-xl border border-cyan/30 bg-cyan/5 p-4">
                    <span className="font-mono text-3xl font-extrabold text-cyan">#{q.queueNumber}</span>
                    <div className="mt-1 truncate text-sm font-semibold text-navy dark:text-white">{q.patientName}</div>
                    <div className="truncate text-xs text-slate-400">{q.doctorName}</div>
                  </div>
                )) : <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10">No one in consultation</div>}
              </div>

              {/* Next */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Next</p>
                {nextUp ? (
                  <div className="rounded-xl border border-mint/30 bg-mint/5 p-4">
                    <span className="font-mono text-3xl font-extrabold text-mint">#{nextUp.queueNumber}</span>
                    <div className="mt-1 truncate text-sm font-semibold text-navy dark:text-white">{nextUp.patientName}</div>
                    <div className="truncate text-xs text-slate-400">{nextUp.doctorName}</div>
                  </div>
                ) : <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10">No one waiting</div>}
              </div>

              {/* Waiting list */}
              <div>
                <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Waiting ({restWaiting.length})</p>
                {restWaiting.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {restWaiting.map((q) => (
                      <span key={q.id} className="rounded-lg border border-slate-100 px-2.5 py-1.5 font-mono text-xs font-semibold text-slate-500 dark:border-white/10 dark:text-slate-300">#{q.queueNumber}</span>
                    ))}
                  </div>
                ) : <div className="rounded-xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400 dark:border-white/10">Queue is clear</div>}
              </div>
            </div>
          ) : (
            <EmptyState text="No patients in queue today" />
          )}
        </div>

        {/* AI Clinical Intelligence — 1/3 */}
        <div className="ai-glow rounded-[20px] p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan to-mint">
                <Brain className="h-4.5 w-4.5 text-navy" />
              </div>
              <div>
                <h2 className="font-[Poppins] text-sm font-bold text-navy dark:text-white">AI Clinical Intelligence</h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">{aiInsights.length} insights for review</p>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            {aiInsights.map((insight, i) => (
              <Link key={i} href={insight.href} className="group flex items-start gap-2.5 rounded-xl border border-white/40 bg-white/70 p-3 transition hover:border-cyan/30 hover:bg-white dark:border-white/5 dark:bg-white/[0.03] dark:hover:bg-white/[0.06]">
                <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${insight.color}22` }}>
                  <insight.icon className="h-4 w-4" style={{ color: insight.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="truncate text-xs font-semibold text-navy dark:text-white">{insight.title}</span>
                    <ArrowUpRight className="h-3 w-3 shrink-0 text-slate-300 transition group-hover:text-cyan" />
                  </div>
                  <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">{insight.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ========== CLINICAL ACTIVITY + MEDICATION/INVENTORY ========== */}
      <div className="mb-8 grid grid-cols-1 gap-4 xl:grid-cols-3">
        {/* Timeline — 2/3 */}
        <div className="card p-6 xl:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="font-[Poppins] text-base font-semibold text-navy dark:text-white">Recent Clinical Activity</h2>
            {(data?.recent.length ?? 0) > 0 && <Link href="/patients" className="text-xs font-semibold text-cyan hover:underline">View all →</Link>}
          </div>
          {loading ? (
            <div className="space-y-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-14 w-full" />)}</div>
          ) : data?.recent.length ? (
            <div className="relative space-y-4 pl-5">
              <div className="absolute left-[7px] top-1 h-[calc(100%-8px)] w-px bg-slate-100 dark:bg-white/10" />
              {data.recent.map((a, i) => {
                const Icon = activityIcon(a.action);
                const dotColor = a.urgency === "critical" ? "#c25d5d" : a.urgency === "warning" ? "#d48040" : "#7a9e7e";
                const parsed = parseActivity(a.action);
                return (
                  <div key={a.id} className="relative flex items-start gap-3 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                    <span className="absolute -left-5 top-1 grid h-3.5 w-3.5 place-items-center rounded-full border-2 border-white bg-white dark:border-[#12241f] dark:bg-[#12241f]" style={{ boxShadow: `0 0 0 2px ${dotColor}` }}>
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
                    </span>
                    <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-slate-100 dark:bg-white/5">
                      <Icon className="h-3.5 w-3.5 text-slate-400" />
                    </div>
                    <div className="min-w-0 flex-1 rounded-xl border border-slate-100 px-3 py-2 dark:border-white/5">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-sm font-semibold text-navy dark:text-white">{parsed.title}</span>
                        <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                      </div>
                      <div className="mt-0.5 truncate text-xs font-medium text-slate-600 dark:text-slate-300">{a.patientName}</div>
                      {parsed.meta.map((line, mi) => (
                        <div key={mi} className="truncate text-[11px] text-slate-400">{line}</div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : <EmptyState text="No recent activity" />}
        </div>

        {/* Medication Operations + Inventory Intelligence — 1/3 */}
        <div className="flex flex-col gap-4">
          <div className="card p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-[Poppins] text-sm font-semibold text-navy dark:text-white">Medication Operations</h2>
              <Link href="/pharmacy" className="text-xs font-semibold text-cyan hover:underline">View →</Link>
            </div>
            {!rxData ? (
              <Skeleton className="h-24 w-full" />
            ) : (
              <div className="flex items-center justify-between">
                <WorkflowStep label="Pending" count={pendingRx.length} color="#d48040" />
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                <WorkflowStep label="Dispensing" count={dispensingRx.length} color="#c9955a" />
                <ArrowRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />
                <WorkflowStep label="Collected" count={collectedRx.length} color="#7a9e7e" />
              </div>
            )}
            {rxData && pendingRx.length === 0 && dispensingRx.length === 0 && (
              <p className="mt-3 text-center text-xs text-slate-400">All prescriptions are up to date.</p>
            )}
          </div>

          <div className="card p-5">
            <h2 className="mb-4 font-[Poppins] text-sm font-semibold text-navy dark:text-white">Inventory Intelligence</h2>
            {!invData ? (
              <Skeleton className="h-24 w-full" />
            ) : inventory.length === 0 ? (
              <EmptyState text="No inventory data yet" />
            ) : (
              <div className="flex items-center gap-4">
                <Gauge value={inventoryHealth} />
                <div className="min-w-0 flex-1 space-y-1">
                  {lowStock.length > 0 ? (
                    <>
                      <p className="text-xs font-semibold text-navy dark:text-white">{lowStock.length} item{lowStock.length === 1 ? "" : "s"} require attention</p>
                      {lowStock.slice(0, 3).map((i) => (
                        <div key={i.id} className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                          <span className="truncate">{i.name}</span>
                          <span className="font-mono text-danger">{i.stock}</span>
                        </div>
                      ))}
                    </>
                  ) : (
                    <p className="text-xs text-slate-400">Inventory is healthy.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ========== RECENT CONSULTATIONS ========== */}
      <div className="card mb-8 p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-[Poppins] text-base font-semibold text-navy dark:text-white">
            <ClipboardList className="h-4 w-4 text-cyan" /> Recent Consultations
          </h2>
        </div>
        {!recData ? (
          <Skeleton className="h-32 w-full" />
        ) : recentRecords.length > 0 ? (
          <div className="divide-y divide-slate-100 dark:divide-white/5">
            {recentRecords.map((r) => (
              <Link key={r.id} href={`/patients/${r.patientId}`} className="flex items-center gap-3 py-3 transition first:pt-0 last:pb-0 hover:bg-mint/5 dark:hover:bg-mint/10 -mx-2 px-2 rounded-lg">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy/10 text-xs font-bold text-navy dark:bg-white/10 dark:text-white">
                  {initials(r.patientName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="truncate text-sm font-semibold text-navy dark:text-white">{r.patientName}</span>
                    {r.prescriptionId && <Badge color="mint">Rx #{r.prescriptionId}</Badge>}
                  </div>
                  <div className="truncate text-xs text-slate-400">{r.diagnosis || r.chiefComplaint || "Consultation recorded"} · Dr. {r.doctorName.replace(/^Dr\.\s*/, "")}</div>
                </div>
                <span className="shrink-0 text-xs text-slate-400">{timeAgo(r.createdAt)}</span>
              </Link>
            ))}
          </div>
        ) : (
          <EmptyState text="No consultations recorded yet" />
        )}
      </div>

      {/* ========== CHARTS ========== */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[Poppins] text-base font-semibold text-navy dark:text-white">Patient Visits Trend</h2>
            <span className="text-xs font-medium text-slate-400">Last 30 days</span>
          </div>
          {loading ? <Skeleton className="h-56 w-full" /> : trendData.length ? <AreaChart data={trendData.map((t) => t.count)} labels={trendData.map((t) => t.day)} /> : <EmptyState text="No visit data yet" />}
        </div>
        <div className="card p-6 lg:col-span-2">
          <h2 className="mb-4 font-[Poppins] text-base font-semibold text-navy dark:text-white">Patients by Department</h2>
          {loading ? <Skeleton className="h-40 w-full" /> : donut.length ? <DonutChart data={donut} /> : <EmptyState text="No department data yet" />}
        </div>
      </div>

      {/* ========== QUICK ACTIONS DOCK ========== */}
      <div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">Quick Actions</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction href="/emr" icon={FileText} color="#1f3d3a" title="New Consultation" desc="Start a new clinical encounter" />
          <QuickAction href="/patients" icon={Users} color="#7a9e7e" title="Patients" desc="Browse and manage patient records" />
          <QuickAction href="/pharmacy" icon={Pill} color="#c9955a" title="Pharmacy" desc="Dispense prescriptions and view stock" />
          <QuickAction href="/analytics" icon={BarChart3} color="#d48040" title="Analytics" desc="Review clinical insights and trends" />
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Hero glance metric ---------------- */
function GlanceMetric({
  icon: Icon, color, label, value, loading, sub,
}: {
  icon: React.ElementType; color: string; label: string; value: number; loading: boolean; sub: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl" style={{ background: `${color}18` }}>
        <Icon className="h-4.5 w-4.5" style={{ color }} />
      </div>
      <div className="min-w-0">
        <div className="font-mono text-2xl font-bold text-navy dark:text-white">
          {loading ? <Skeleton className="h-7 w-10" /> : <Counter value={value} />}
        </div>
        <div className="truncate text-xs font-medium text-slate-600 dark:text-slate-300">{label}</div>
        <div className="truncate text-[11px] text-slate-400">{sub}</div>
      </div>
    </div>
  );
}

/* ---------------- Secondary mini stat ---------------- */
function MiniStat({ icon: Icon, color, label, value, loading }: { icon: React.ElementType; color: string; label: string; value: number; loading: boolean }) {
  return (
    <div className="flex flex-1 items-center gap-3 sm:px-4 first:sm:pl-0 last:sm:pr-0">
      <Icon className={`h-4 w-4 shrink-0 ${color}`} />
      <div>
        <div className="font-mono text-sm font-bold text-navy dark:text-white">{loading ? <Skeleton className="inline-block h-4 w-6" /> : value}</div>
        <div className="text-xs text-slate-400">{label}</div>
      </div>
    </div>
  );
}

/* ---------------- Medication workflow step ---------------- */
function WorkflowStep({ label, count, color }: { label: string; count: number; color: string }) {
  return (
    <div className="text-center">
      <div className="font-mono text-xl font-bold text-navy dark:text-white">{count}</div>
      <div className="text-[10px] font-semibold uppercase tracking-wide" style={{ color }}>{label}</div>
    </div>
  );
}

/* ---------------- Quick action card ---------------- */
function QuickAction({ href, icon: Icon, color, title, desc }: { href: string; icon: React.ElementType; color: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card lift group p-5 focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan">
      <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}18` }}>
        <Icon className="h-5 w-5" style={{ color }} />
      </div>
      <div className="mt-3 font-semibold text-navy dark:text-white">{title}</div>
      <div className="mt-0.5 text-xs text-slate-400">{desc}</div>
      <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-cyan opacity-0 transition-opacity group-hover:opacity-100">
        Open <ArrowRight className="h-3 w-3" />
      </div>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-8 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-2xl bg-mint/10 text-2xl">🗂️</div>
      <p className="mt-3 text-sm text-slate-400">{text}</p>
    </div>
  );
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}
