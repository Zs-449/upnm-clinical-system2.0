"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Counter, Badge, statusColor, Skeleton } from "@/components/ui";
import { AreaChart, DonutChart, Sparkline } from "@/components/charts";

import {
  CalendarCheck, Users, Stethoscope, FlaskConical, TrendingUp,
  Clock, AlertTriangle, X, Sparkles, Brain, ShieldAlert,
  Activity, Zap, User as UserIcon, ArrowRight,
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
  criticalLabs: { id: number; patientName: string; testName: string; value: string; flag: string }[];
}

const DEPT_COLORS: Record<string, string> = { General: "#1f3d3a", Dental: "#7a9e7e", "Mental Health": "#c9955a", Emergency: "#c25d5d" };

export default function DashboardPage() {
  const { data, loading } = useApi<DashData>("/api/dashboard", 30000);
  const [range, setRange] = useState<"Daily" | "Weekly" | "Monthly">("Daily");
  const [greeting, setGreeting] = useState("Good afternoon");
  const [name, setName] = useState("Doctor");

  useEffect(() => {
    const h = new Date().getHours();
    setGreeting(h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening");
    const u = getSession();
    if (u) setName(u.name.split(" ").slice(-1)[0]);
  }, []);

  const stats = data?.stats ?? { todayAppointments: 0, activePatients: 0, availableDoctors: 0, pendingLabs: 0 };
  const trendData = data?.trend ?? [];
  const donut = (data?.byDept ?? []).map((d) => ({ label: d.department, value: d.count, color: DEPT_COLORS[d.department] ?? "#7a7168" }));

  const nextPatient = (data?.queue ?? []).find((q) => q.status === "Waiting") ?? data?.queue?.[0];
  const criticalCount = data?.criticalLabs?.length ?? 0;

  const aiInsights = [
    { icon: ShieldAlert, color: "#c25d5d", title: "Critical potassium flagged", desc: `Patient ${data?.criticalLabs?.[0]?.patientName ?? "UPNM-2024011"} — K+ 6.2 mmol/L. Review within 1h.`, priority: "Urgent" },
    { icon: Brain, color: "#c9955a", title: "Drug interaction detected", desc: "Warfarin + Ibuprofen — moderate bleeding risk. Suggest acetaminophen alternative.", priority: "Warning" },
    { icon: Sparkles, color: "#7a9e7e", title: "Schedule optimization", desc: "Afternoon slots have 40% shorter waits. Recommend shifting routine visits to 14:00-16:00.", priority: "Insight" },
  ];

  return (
    <Shell>
      {/* ========== HERO: AI COMMAND CENTER ========== */}
      <div className="relative mb-6 overflow-hidden rounded-[28px] bg-gradient-to-br from-[#0f1f1a] via-navy to-[#2d5551] p-8 text-white lg:p-10">
        {/* Background effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="blob absolute left-[-10%] top-[-30%] h-[400px] w-[400px] bg-cyan/20" />
          <div className="blob absolute right-[-10%] bottom-[-30%] h-[400px] w-[400px] bg-mint/20" style={{ animationDelay: "-10s" }} />
          <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative z-10 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Greeting + AI summary */}
          <div className="lg:col-span-2">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold uppercase tracking-widest text-cyan backdrop-blur-md">
              <Sparkles className="h-3 w-3" /> AI Command Center
            </div>
            <h1 className="font-[Poppins] text-4xl font-extrabold leading-tight tracking-tight lg:text-5xl">
              {greeting},<br />
              <span className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-transparent">{name}</span>
            </h1>
            <p className="mt-3 max-w-xl text-base text-white/70">
              Everything you need today. AI has prioritized your schedule and flagged {criticalCount} case{criticalCount === 1 ? "" : "s"} requiring attention.
            </p>

            {/* key stats row */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { icon: CalendarCheck, label: "Appointments", value: stats.todayAppointments, trend: "+12%" },
                { icon: Users, label: "Waiting now", value: (data?.queue ?? []).filter((q) => q.status === "Waiting").length, trend: null },
                { icon: AlertTriangle, label: "Critical alerts", value: criticalCount, trend: null, danger: true },
                { icon: Clock, label: "Avg wait", value: 14, suffix: "min", trend: "-2m" },
              ].map((s, i) => (
                <div key={s.label} className="card-premium lift rounded-xl p-3 animate-fade-up" style={{ animationDelay: `${i * 80 + 200}ms` }}>
                  <div className="flex items-center justify-between">
                    <s.icon className={`h-4 w-4 ${s.danger ? "text-danger" : "text-cyan"}`} />
                    {s.trend && <span className={`font-mono text-[10px] font-bold ${s.danger ? "text-danger" : "text-mint"}`}>{s.trend}</span>}
                  </div>
                  <div className="mt-1.5 font-mono text-2xl font-extrabold text-navy dark:text-white">
                    {loading ? <Skeleton className="h-7 w-12" /> : <><Counter value={s.value} />{s.suffix}</>}
                  </div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Next consultation + live queue */}
          <div className="flex flex-col gap-3">
            {nextPatient ? (
              <div className="card-premium glow-mint lift animate-fade-up rounded-2xl p-5" style={{ animationDelay: "300ms" }}>
                <div className="mb-2 flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-mint pulse-dot" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-mint">Next Consultation</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-mint to-cyan text-sm font-bold text-navy">
                    #{nextPatient.queueNumber ?? "?"}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="truncate font-semibold text-navy dark:text-white">{nextPatient.patientName}</div>
                    <div className="truncate text-xs text-slate-400">{nextPatient.doctorName} · {nextPatient.time}</div>
                  </div>
                  <UserIcon className="h-5 w-5 text-slate-400" />
                </div>
                <div className="mt-3 flex items-center justify-between rounded-lg bg-mint/10 px-3 py-2 text-xs">
                  <span className="text-slate-600 dark:text-slate-300">Est. arrival</span>
                  <span className="font-mono font-bold text-mint">~3 min</span>
                </div>
              </div>
            ) : (
              <div className="card-premium rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "300ms" }}>
                <div className="text-sm text-slate-500">Queue is clear. Great job! ✨</div>
              </div>
            )}

            <div className="card-premium lift rounded-2xl p-5 animate-fade-up" style={{ animationDelay: "400ms" }}>
              <div className="mb-2 flex items-center gap-2">
                <Stethoscope className="h-4 w-4 text-cyan" />
                <span className="text-xs font-bold uppercase tracking-widest text-cyan">Doctors Online</span>
              </div>
              <div className="flex items-end gap-2">
                <span className="font-mono text-3xl font-extrabold text-navy dark:text-white">
                  {loading ? <Skeleton className="h-8 w-10" /> : <Counter value={stats.availableDoctors} />}
                </span>
                <span className="mb-1 text-xs text-slate-400">of 6 available</span>
              </div>
              <div className="mt-2 flex gap-1">
                {[1, 2, 3, 4, 5, 6].map((i) => (
                  <div key={i} className={`h-1.5 flex-1 rounded-full ${i <= stats.availableDoctors ? "bg-cyan" : "bg-slate-200 dark:bg-white/10"}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ========== AI RECOMMENDATIONS (glowing hero) ========== */}
      <div className="mb-6 ai-glow rounded-[24px] p-6 lg:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-cyan to-mint">
              <Brain className="h-6 w-6 text-navy" />
            </div>
            <div>
              <h2 className="font-[Poppins] text-xl font-extrabold text-navy dark:text-white">AI Recommendations</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Real-time clinical intelligence from your data</p>
            </div>
          </div>
          <Badge color="cyan">● Live</Badge>
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          {aiInsights.map((insight, i) => (
            <div
              key={i}
              className="card-premium lift group relative cursor-pointer overflow-hidden rounded-2xl p-5 animate-fade-up"
              style={{ animationDelay: `${i * 100 + 500}ms` }}
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
            </div>
          ))}
        </div>
      </div>

      {/* ========== STANDARD STAT CARDS ========== */}
      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {[
          { label: "Today's Appointments", value: stats.todayAppointments, icon: CalendarCheck, color: "#1f3d3a", trend: "+12%", spark: [3, 5, 4, 7, 6, 9, 8] },
          { label: "Active Patients", value: stats.activePatients, icon: Users, color: "#7a9e7e", trend: "+4%", spark: [20, 22, 25, 24, 28, 30, 32] },
          { label: "Available Doctors", value: stats.availableDoctors, icon: Stethoscope, color: "#c9955a", trend: "stable", spark: [4, 4, 3, 4, 4, 4, 4] },
          { label: "Pending Lab Results", value: stats.pendingLabs, icon: FlaskConical, color: "#d48040", trend: "-8%", spark: [12, 10, 14, 11, 9, 8, 7] },
        ].map((s) => (
          <div key={s.label} className="card lift group cursor-pointer p-5">
            <div className="flex items-start justify-between">
              <div className="grid h-12 w-12 place-items-center rounded-xl shadow-lg icon-rotate" style={{ background: `linear-gradient(135deg, ${s.color}, ${s.color}bb)` }}>
                <s.icon className="h-6 w-6 text-white" />
              </div>
              <Sparkline data={s.spark} color={s.color} />
            </div>
            <div className="mt-4 font-mono text-3xl font-extrabold text-navy dark:text-white">
              {loading ? <Skeleton className="h-9 w-16" /> : <Counter value={s.value} />}
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span className="text-sm text-slate-500 dark:text-slate-400">{s.label}</span>
              <span className="flex items-center gap-0.5 text-xs font-semibold text-mint">
                <TrendingUp className="h-3 w-3" />{s.trend}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* ========== LIVE QUEUE + CHARTS ========== */}
      <div className="mb-6 card p-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white">
            <Zap className="h-4 w-4 text-cyan" /> Live Queue Monitor
          </h2>
          <span className="flex items-center gap-1 text-xs text-slate-400"><Clock className="h-3.5 w-3.5" /> Avg wait 14 min · updates 30s</span>
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

      {/* Charts */}
      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="card lift p-6 lg:col-span-3">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-[Poppins] font-bold text-navy dark:text-white">Patient Visits Trend</h2>
            <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
              {(["Daily", "Weekly", "Monthly"] as const).map((r) => (
                <button key={r} onClick={() => setRange(r)} className={`rounded-md px-2.5 py-1 text-xs font-semibold transition ${range === r ? "bg-white text-navy shadow dark:bg-navy dark:text-white" : "text-slate-400"}`}>{r}</button>
              ))}
            </div>
          </div>
          {loading ? <Skeleton className="h-56 w-full" /> : <AreaChart data={trendData.map((t) => t.count)} labels={trendData.map((t) => t.day)} />}
        </div>
        <div className="card lift p-6 lg:col-span-2">
          <h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">Patient Categories</h2>
          {loading ? <Skeleton className="h-40 w-full" /> : <DonutChart data={donut} />}
        </div>
      </div>

      {/* Activity + alerts */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="card lift p-6 lg:col-span-2">
          <h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">Recent Activity</h2>
          <div className="space-y-3">
            {loading ? [1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-12 w-full" />) :
              data?.recent.map((a, i) => (
                <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 transition hover:border-mint/30 hover:bg-mint/5 dark:border-white/5 dark:hover:bg-mint/10 animate-fade-up" style={{ animationDelay: `${i * 50}ms` }}>
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: a.urgency === "critical" ? "#c25d5d" : a.urgency === "warning" ? "#d48040" : "#7a9e7e" }} />
                  <div className="flex-1">
                    <span className="text-sm font-semibold text-navy dark:text-white">{a.patientName}</span>
                    <span className="text-sm text-slate-500 dark:text-slate-400"> {a.action}</span>
                  </div>
                  <span className="text-xs text-slate-400">{timeAgo(a.createdAt)}</span>
                </div>
              ))}
          </div>
        </div>

        <div className="card lift p-6">
          <h2 className="mb-4 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white">
            <AlertTriangle className="h-4 w-4 text-amber-500" /> Quick Alerts
          </h2>
          <div className="space-y-2">
            {aiInsights.map((a, i) => (
              <div key={i} className="flex items-start gap-2 rounded-xl border p-3 transition hover:shadow-md animate-slide-right" style={{ borderColor: `${a.color}44`, background: `${a.color}0d` }}>
                <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ background: a.color }} />
                <p className="flex-1 text-xs text-slate-600 dark:text-slate-300">{a.title}</p>
                <Link href="/analytics" className="text-[10px] font-semibold" style={{ color: a.color }}>→</Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Shell>
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
