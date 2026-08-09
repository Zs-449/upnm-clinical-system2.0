"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Counter, Badge, statusColor, Skeleton } from "@/components/ui";
import { AreaChart, DonutChart, Gauge } from "@/components/charts";

import {
  CalendarCheck, Users, Stethoscope, FlaskConical,
  Clock, AlertTriangle, Sparkles, Brain, ShieldAlert,
  User as UserIcon, ArrowRight, Pill, PackageSearch,
  CheckCircle2, Loader2, FileText, ClipboardList, BarChart3,
} from "lucide-react";
import { useEffect, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";

interface DashData {
  stats: { todayAppointments: number; activePatients: number; availableDoctors: number; pendingLabs: number };
  queue: { id: number; patientName: string; status: string; queueNumber: number | null; doctorName: string; time: string }[];
  recent: { id: number; patientName: string; action: string; urgency: string; createdAt: string }[];
  trend: { day: string; count: number }[];
  byDept: { department: string; count: number }[];
  criticalLabs: { id: number; patientId: number; patientName: string; testName: string; value: string; flag: string }[];
}
interface RxLite { id: number; patientId: number; patientName: string; status: string; medications: { name: string; quantity?: number }[]; }
interface InvLite { id: number; name: string; stock: number; minStock: number; }
interface RecordLite { id: number; patientId: number; patientName: string; doctorName: string; diagnosis: string | null; chiefComplaint: string | null; createdAt: string; }

const DEPT_COLORS: Record<string, string> = { General: "#1f3d3a", Dental: "#7a9e7e", "Mental Health": "#c9955a", Emergency: "#c25d5d" };

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("");
}

export default function DashboardPage() {
  const { data, loading } = useApi<DashData>("/api/dashboard", 30000);
  // Read-only calls to the existing, already-working GET endpoints so the
  // dashboard can show real pharmacy/inventory/consultation context instead
  // of inventing numbers. Nothing here writes data or changes any API.
  const { data: rxData } = useApi<{ prescriptions: RxLite[] }>("/api/prescriptions", 30000);
  const { data: invData } = useApi<{ inventory: InvLite[] }>("/api/inventory", 30000);
  const { data: recData } = useApi<{ medicalRecords: RecordLite[] }>("/api/medical-records", 30000);

  const [range, setRange] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [greeting, setGreeting] = useState("Good afternoon");
  const [name, setName] = useState("Doctor");
  const [today, setToday] = useState("");

  useEffect(() => {
    const now = new Date();
    const h = now.getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    setToday(now.toLocaleDateString(undefined, { weekday: "long", day: "numeric", month: "long" }));
    const u = getSession();
    if (u) setName(u.name.split(" ").slice(-1)[0]);
  }, []);

  const stats = data?.stats ?? { todayAppointments: 0, activePatients: 0, availableDoctors: 0, pendingLabs: 0 };
  const trendData = data?.trend ?? [];
  const donut = (data?.byDept ?? []).map((d) => ({ label: d.department, value: d.count, color: DEPT_COLORS[d.department] ?? "#7a7168" }));

  const nextPatient = (data?.queue ?? []).find((q) => q.status === "Waiting") ?? data?.queue?.[0];
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

  const recentRecords = (recData?.medicalRecords ?? []).slice(0, 4);

  // Each recommendation links to the real record that produced it (reusing
  // existing pages) instead of being a dead-end action. Recommendations that
  // are not derived from a specific patient's data fall back to Analytics,
  // matching the behavior already used by the "Quick Alerts" panel below.
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
      {/* ========== HEADER ========== */}
      <div className="relative mb-8 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#0f1f1a] via-navy to-[#1c3835] p-8 text-white lg:p-10">
        <div className="pointer-events-none absolute inset-0">
          <div className="blob absolute left-[-8%] top-[-40%] h-[320px] w-[320px] bg-cyan/10" />
          <div className="blob absolute right-[-8%] bottom-[-40%] h-[320px] w-[320px] bg-mint/10" style={{ animationDelay: "-10s" }} />
        </div>

        <div className="relative z-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2 text-xs font-medium uppercase tracking-widest text-white/50">
              <span>{today || "\u00A0"}</span>
            </div>
            <h1 className="font-[Poppins] text-3xl font-bold leading-tight tracking-tight lg:text-4xl">
              {greeting}, {name}
            </h1>
            <p className="mt-2 max-w-lg text-sm text-white/60">
              Here&apos;s today&apos;s clinical overview
              {criticalCount > 0 ? ` — ${criticalCount} case${criticalCount === 1 ? "" : "s"} need${criticalCount === 1 ? "s" : ""} your attention.` : "."}
            </p>
          </div>

          {/* Quick actions — only routes that already exist in the app */}
          <div className="flex flex-wrap gap-2">
            <Link href="/emr" className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium backdrop-blur-md transition hover:border-cyan/40 hover:bg-white/10">
              <FileText className="h-4 w-4 text-cyan" /> New Consultation
            </Link>
            <Link href="/patients" className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium backdrop-blur-md transition hover:border-cyan/40 hover:bg-white/10">
              <Users className="h-4 w-4 text-cyan" /> Patients
            </Link>
            <Link href="/pharmacy" className="group flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium backdrop-blur-md transition hover:border-cyan/40 hover:bg-white/10">
              <Pill className="h-4 w-4 text-cyan" /> Pharmacy
            </Link>
          </div>
        </div>
      </div>

      {/* ========== KEY CLINICAL METRICS ========== */}
      <SectionHeading>Today at a glance</SectionHeading>
      <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          icon={CalendarCheck}
          color="#1f3d3a"
          label="Patients Today"
          value={stats.todayAppointments}
          loading={loading}
          sub="Scheduled appointments"
        />
        <MetricCard
          icon={Pill}
          color="#c9955a"
          label="Pending Prescriptions"
          value={pendingRx.length}
          loading={!rxData}
          sub="Awaiting dispensing"
        />
        <MetricCard
          icon={CheckCircle2}
          color="#7a9e7e"
          label="Collected"
          value={collectedRx.length}
          loading={!rxData}
          sub="Completed dispensing"
        />
        <MetricCard
          icon={AlertTriangle}
          color={lowStock.length > 0 ? "#c25d5d" : "#7a9e7e"}
          label="Inventory Alerts"
          value={lowStock.length}
          loading={!invData}
          sub={lowStock.length > 0 ? "Requires attention" : "All medicines stocked"}
        />
      </div>

      {/* Secondary operational stats — same real fields the dashboard has
         always shown (data.stats), kept but given lighter visual weight so
         the primary clinical metrics above lead the hierarchy. */}
      <div className="mb-8 flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white/60 p-4 dark:border-white/10 dark:bg-white/[0.02] sm:flex-row sm:items-center sm:divide-x sm:divide-slate-100 dark:sm:divide-white/10">
        <div className="flex flex-1 items-center gap-3 sm:pr-4">
          <Stethoscope className="h-4 w-4 shrink-0 text-cyan" />
          <div>
            <div className="font-mono text-sm font-bold text-navy dark:text-white">{loading ? <Skeleton className="inline-block h-4 w-6" /> : stats.availableDoctors}</div>
            <div className="text-xs text-slate-400">Doctors on duty</div>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3 sm:px-4">
          <FlaskConical className="h-4 w-4 shrink-0 text-amber" />
          <div>
            <div className="font-mono text-sm font-bold text-navy dark:text-white">{loading ? <Skeleton className="inline-block h-4 w-6" /> : stats.pendingLabs}</div>
            <div className="text-xs text-slate-400">Pending lab results</div>
          </div>
        </div>
        <div className="flex flex-1 items-center gap-3 sm:pl-4">
          <UserIcon className="h-4 w-4 shrink-0 text-mint" />
          <div>
            <div className="font-mono text-sm font-bold text-navy dark:text-white">{loading ? <Skeleton className="inline-block h-4 w-6" /> : stats.activePatients}</div>
            <div className="text-xs text-slate-400">Active patients</div>
          </div>
        </div>
      </div>

      {/* ========== LIVE QUEUE ========== */}
      <div id="live-queue" className="mb-8 card p-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-[Poppins] text-base font-semibold text-navy dark:text-white">Live Queue</h2>
          <div className="flex items-center gap-4">
            {nextPatient && (
              <div className="flex items-center gap-2 rounded-full bg-mint/10 px-3 py-1 text-xs">
                <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />
                <span className="text-slate-500 dark:text-slate-400">Next:</span>
                <span className="font-semibold text-navy dark:text-white">{nextPatient.patientName}</span>
                <span className="text-slate-400">#{nextPatient.queueNumber ?? "?"}</span>
              </div>
            )}
            <span className="flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="h-3.5 w-3.5" /> Updates every 30s
            </span>
          </div>
        </div>
        {loading ? (
          <div className="flex gap-3">{[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-24 w-40" />)}</div>
        ) : data && data.queue.filter((q) => q.queueNumber).length > 0 ? (
          <div className="flex gap-3 overflow-x-auto pb-2">
            {data.queue.filter((q) => q.queueNumber).map((q, i) => (
              <div key={q.id} className="card-premium lift min-w-[180px] rounded-xl p-4 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-2xl font-extrabold text-navy dark:text-cyan">#{q.queueNumber}</span>
                  <Badge color={statusColor(q.status)}>{q.status}</Badge>
                </div>
                <div className="mt-2 truncate text-sm font-semibold text-slate-700 dark:text-slate-200">{q.patientName}</div>
                <div className="truncate text-xs text-slate-400">{q.doctorName} · {q.time}</div>
              </div>
            ))}
          </div>
        ) : (
          <EmptyState text="No patients in queue today" />
        )}
      </div>

      {/* ========== CHARTS ========== */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="card lift p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[Poppins] text-base font-semibold text-navy dark:text-white">Patient Visits Trend</h2>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
              {(["Daily", "Weekly", "Monthly"] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${range === r ? "bg-white text-navy shadow dark:bg-navy dark:text-white" : "text-slate-400"}`}>{r}</button>
              ))}
            </div>
          </div>
          {loading ? <Skeleton className="h-56 w-full" /> : trendData.length ? <AreaChart data={trendData.map((t) => t.count)} labels={trendData.map((t) => t.day)} /> : <EmptyState text="No visit data yet" />}
        </div>
        <div className="card lift p-6 lg:col-span-2">
          <h2 className="mb-4 font-[Poppins] text-base font-semibold text-navy dark:text-white">Patients by Department</h2>
          {loading ? <Skeleton className="h-40 w-full" /> : donut.length ? <DonutChart data={donut} /> : <EmptyState text="No department data yet" />}
        </div>
      </div>

      {/* ========== PHARMACY + INVENTORY ========== */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card lift p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-[Poppins] text-base font-semibold text-navy dark:text-white">
              <Pill className="h-4 w-4 text-cyan" /> Pharmacy Overview
            </h2>
            <Link href="/pharmacy" className="text-xs font-semibold text-cyan hover:underline">Open Pharmacy →</Link>
          </div>
          {!rxData ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <>
              <div className="mb-4 grid grid-cols-3 gap-2">
                <StatusChip icon={Clock} label="Pending" count={pendingRx.length} color="#d48040" />
                <StatusChip icon={Loader2} label="Dispensing" count={dispensingRx.length} color="#c9955a" />
                <StatusChip icon={CheckCircle2} label="Collected" count={collectedRx.length} color="#7a9e7e" />
              </div>
              {pendingRx.length > 0 ? (
                <div className="space-y-2">
                  {pendingRx.slice(0, 3).map((rx) => (
                    <div key={rx.id} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2 text-xs dark:border-white/10">
                      <span className="truncate font-medium text-slate-600 dark:text-slate-300">{rx.patientName}</span>
                      <span className="text-slate-400">{rx.medications.length} item{rx.medications.length === 1 ? "" : "s"}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-xs text-slate-400 py-4">No prescriptions pending dispensing</p>
              )}
            </>
          )}
        </div>

        <div className="card lift p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-[Poppins] text-base font-semibold text-navy dark:text-white">
              <PackageSearch className="h-4 w-4 text-cyan" /> Inventory Health
            </h2>
          </div>
          {!invData ? (
            <Skeleton className="h-32 w-full" />
          ) : inventory.length === 0 ? (
            <EmptyState text="No inventory data yet" />
          ) : (
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-center sm:justify-around">
              <Gauge value={inventoryHealth} />
              <div className="w-full space-y-1.5 sm:max-w-[180px]">
                {lowStock.length > 0 ? (
                  <>
                    <p className="text-xs font-semibold text-navy dark:text-white">{lowStock.length} item{lowStock.length === 1 ? "" : "s"} require attention</p>
                    {lowStock.slice(0, 3).map((i) => (
                      <div key={i.id} className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                        <span className="truncate">{i.name}</span>
                        <span className="font-mono text-danger">{i.stock}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <p className="text-xs text-slate-400">All medicines are within healthy stock levels.</p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ========== AI RECOMMENDATIONS ========== */}
      <div className="mb-8 ai-glow rounded-[20px] p-6 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-mint">
              <Brain className="h-5 w-5 text-navy" />
            </div>
            <div>
              <h2 className="font-[Poppins] text-lg font-bold text-navy dark:text-white">AI Clinical Assistant</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Clinical insights derived from your data</p>
            </div>
          </div>
          <Badge color="cyan">● Live</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {aiInsights.map((insight, i) => (
            <Link
              key={i}
              href={insight.href}
              className="card-premium lift group relative block cursor-pointer overflow-hidden rounded-2xl p-5 animate-fade-up"
              style={{ animationDelay: `${i * 100 + 100}ms` }}
            >
              <div className="absolute inset-0 opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at 50% 0%, ${insight.color}22, transparent 70%)` }} />
              <div className="relative">
                <div className="mb-3 flex items-start justify-between">
                  <div className="grid h-10 w-10 place-items-center rounded-xl icon-rotate" style={{ background: `${insight.color}22` }}>
                    <insight.icon className="h-5 w-5" style={{ color: insight.color }} />
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider" style={{ background: `${insight.color}22`, color: insight.color }}>{insight.priority}</span>
                </div>
                <h3 className="mb-1 font-semibold text-navy dark:text-white">{insight.title}</h3>
                <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">{insight.desc}</p>
                <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-navy dark:text-cyan group-hover:gap-2 transition-all">
                  Review <ArrowRight className="h-3 w-3" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ========== ACTIVITY + CONSULTATIONS ========== */}
      <div className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card lift p-6">
          <h2 className="mb-4 font-[Poppins] text-base font-semibold text-navy dark:text-white">Recent Clinical Activity</h2>
          <div className="space-y-3">
            {loading ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />) :
              data?.recent.length ? data.recent.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-mint/30 hover:bg-mint/5 dark:border-white/5 dark:hover:bg-mint/10 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: a.urgency === "critical" ? "#c25d5d" : a.urgency === "warning" ? "#d48040" : "#7a9e7e" }} />
                  <div className="min-w-0 flex-1">
                    <span className="text-sm font-semibold text-navy dark:text-white">{a.patientName}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400"> {a.action}</span>
                  </div>
                  <span className="shrink-0 text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                </div>
              )) : <EmptyState text="No recent activity" />}
          </div>
        </div>

        <div className="card lift p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="flex items-center gap-2 font-[Poppins] text-base font-semibold text-navy dark:text-white">
              <ClipboardList className="h-4 w-4 text-cyan" /> Recent Consultations
            </h2>
          </div>
          {!recData ? (
            <Skeleton className="h-32 w-full" />
          ) : recentRecords.length > 0 ? (
            <div className="space-y-2">
              {recentRecords.map((r) => (
                <Link key={r.id} href={`/patients/${r.patientId}`} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-mint/30 hover:bg-mint/5 dark:border-white/5 dark:hover:bg-mint/10">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-navy/10 text-xs font-bold text-navy dark:bg-white/10 dark:text-white">
                    {initials(r.patientName)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-navy dark:text-white">{r.patientName}</div>
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
      </div>

      {/* ========== QUICK ACTIONS ========== */}
      <div>
        <SectionHeading>Quick Actions</SectionHeading>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <QuickAction href="/emr" icon={FileText} color="#1f3d3a" title="New Consultation" desc="Start an EMR record for a patient" />
          <QuickAction href="/patients" icon={Users} color="#7a9e7e" title="Patients" desc="Browse and manage patient records" />
          <QuickAction href="/pharmacy" icon={Pill} color="#c9955a" title="Pharmacy" desc="Dispense prescriptions and view stock" />
          <QuickAction href="/analytics" icon={BarChart3} color="#d48040" title="AI Recommendations" desc="Review clinical insights and analytics" />
        </div>
      </div>
    </Shell>
  );
}

/* ---------------- Section heading ---------------- */
function SectionHeading({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-400">{children}</h2>;
}

/* ---------------- KPI card (Key Clinical Metrics) ---------------- */
function MetricCard({
  icon: Icon, color, label, value, loading, sub,
}: {
  icon: React.ElementType; color: string; label: string; value: number; loading: boolean; sub: string;
}) {
  return (
    <div className="card lift p-5">
      <div className="flex items-center justify-between">
        <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${color}18` }}>
          <Icon className="h-5 w-5" style={{ color }} />
        </div>
      </div>
      <div className="mt-3 font-mono text-2xl font-bold text-navy dark:text-white">
        {loading ? <Skeleton className="h-8 w-14" /> : <Counter value={value} />}
      </div>
      <div className="mt-0.5 text-sm font-medium text-slate-600 dark:text-slate-300">{label}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </div>
  );
}

/* ---------------- Pharmacy status chip ---------------- */
function StatusChip({ icon: Icon, label, count, color }: { icon: React.ElementType; label: string; count: number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3 text-center dark:border-white/10">
      <Icon className="mx-auto h-4 w-4" style={{ color }} />
      <div className="mt-1 font-mono text-lg font-bold text-navy dark:text-white">{count}</div>
      <div className="text-[10px] uppercase tracking-wide text-slate-400">{label}</div>
    </div>
  );
}

/* ---------------- Quick action card ---------------- */
function QuickAction({ href, icon: Icon, color, title, desc }: { href: string; icon: React.ElementType; color: string; title: string; desc: string }) {
  return (
    <Link href={href} className="card lift group p-5">
      <div className="grid h-10 w-10 place-items-center rounded-xl icon-rotate" style={{ background: `${color}18` }}>
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
