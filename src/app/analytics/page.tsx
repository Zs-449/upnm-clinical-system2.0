"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Counter, Skeleton } from "@/components/ui";
import { BarChart, DonutChart, Heatmap, Sparkline, AreaChart } from "@/components/charts";

import { Download, TrendingUp, Users, Activity, Clock } from "lucide-react";
import { useState } from "react";

interface DashData { byDept: { department: string; count: number }[]; trend: { day: string; count: number }[]; stats: { activePatients: number } }

const DEPT_COLORS: Record<string, string> = { General: "#1f3d3a", Dental: "#7a9e7e", "Mental Health": "#c9955a", Emergency: "#c25d5d" };

export default function AnalyticsPage() {
  const { data, loading } = useApi<DashData>("/api/dashboard");
  const [range, setRange] = useState("30d");

  const kpis = [
    { label: "Total Patients", value: data?.stats.activePatients ?? 0, icon: Users, spark: [20, 25, 22, 30, 28, 35, 40], color: "#1f3d3a" },
    { label: "Avg Consultation", value: 18, suffix: " min", icon: Clock, spark: [22, 20, 19, 21, 18, 17, 18], color: "#7a9e7e" },
    { label: "Completion Rate", value: 92, suffix: "%", icon: Activity, spark: [85, 88, 90, 89, 91, 92, 92], color: "#c9955a" },
    { label: "Patient Satisfaction", value: 96, suffix: "%", icon: TrendingUp, spark: [90, 92, 93, 94, 95, 96, 96], color: "#d48040" },
  ];

  const deptBar = (data?.byDept ?? []).map((d) => ({ label: d.department.split(" ")[0], value: d.count }));
  const donut = (data?.byDept ?? []).map((d) => ({ label: d.department, value: d.count, color: DEPT_COLORS[d.department] ?? "#7a7168" }));

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Campus health intelligence dashboard</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
            {["7d", "30d", "90d", "1y"].map((r) => <button key={r} onClick={() => setRange(r)} className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${range === r ? "bg-white text-navy shadow dark:bg-navy dark:text-white" : "text-slate-400"}`}>{r}</button>)}
          </div>
          <button onClick={() => window.print()} className="flex items-center gap-1.5 rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white"><Download className="h-4 w-4" /> Export</button>
        </div>
      </div>

      <div className="stagger mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <div className="flex items-center justify-between">
              <div className="grid h-10 w-10 place-items-center rounded-xl" style={{ background: `${k.color}22` }}><k.icon className="h-5 w-5" style={{ color: k.color }} /></div>
              <Sparkline data={k.spark} color={k.color} />
            </div>
            <div className="mt-3 font-mono text-2xl font-extrabold text-navy dark:text-white">{loading ? <Skeleton className="h-8 w-16" /> : <><Counter value={k.value} />{k.suffix}</>}</div>
            <div className="text-sm text-slate-500 dark:text-slate-400">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="card p-5"><h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">Appointments per Department</h2>{loading ? <Skeleton className="h-56 w-full" /> : <BarChart data={deptBar} />}</div>
        <div className="card p-5"><h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">Diagnosis Distribution</h2>{loading ? <Skeleton className="h-56 w-full" /> : <DonutChart data={donut} />}</div>
      </div>

      <div className="mb-6 grid grid-cols-1 gap-4 lg:grid-cols-5">
        <div className="card p-5 lg:col-span-3"><h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">Patient Volume Trend</h2>{loading ? <Skeleton className="h-56 w-full" /> : <AreaChart data={(data?.trend ?? []).map((t) => t.count)} labels={(data?.trend ?? []).map((t) => t.day)} color="#7a9e7e" />}</div>
        <div className="card p-5 lg:col-span-2"><h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">Busiest Hours Heatmap</h2><Heatmap /></div>
      </div>

      <div className="card p-5">
        <h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">🦠 Health Trend & Outbreak Detection</h2>
        <div className="grid gap-3 sm:grid-cols-3">
          {[{ n: "Upper Respiratory Infection", t: "↑ 23% this week", c: "#c25d5d", note: "Possible seasonal outbreak — monitor closely" }, { n: "Gastroenteritis", t: "↓ 8%", c: "#7a9e7e", note: "Declining, mess hall hygiene improving" }, { n: "Heat Exhaustion", t: "↑ 15%", c: "#d48040", note: "Rising during field training season" }].map((x) => (
            <div key={x.n} className="rounded-xl border p-4" style={{ borderColor: `${x.c}44`, background: `${x.c}0d` }}>
              <div className="font-semibold text-navy dark:text-white">{x.n}</div>
              <div className="font-mono text-lg font-bold" style={{ color: x.c }}>{x.t}</div>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{x.note}</p>
            </div>
          ))}
        </div>
      </div>
    </Shell>
  );
}
