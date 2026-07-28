"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Badge, statusColor, Button, Skeleton } from "@/components/ui";
import { Gauge } from "@/components/charts";
import { getSession } from "@/lib/session";
import { CalendarPlus, Bot, ClipboardList, Droplet, ShieldPlus, Bell, Download, MapPin, FileText } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Appt { id: number; patientName: string; department: string; doctorName: string; date: string; time: string; status: string; queueNumber: number | null; }
interface Rx { id: number; patientName: string; medications: { name: string; dose: string; freq: string }[]; status: string; }

export default function PortalPage() {
  const [name, setName] = useState("Cadet");
  const { data: ad } = useApi<{ appointments: Appt[] }>("/api/appointments", 30000);
  const { data: rd } = useApi<{ prescriptions: Rx[] }>("/api/prescriptions");

  useEffect(() => { const u = getSession(); if (u) setName(u.name); }, []);

  const myAppts = (ad?.appointments ?? []).slice(0, 3);
  const nextAppt = (ad?.appointments ?? []).find((a) => a.status !== "Done");
  const queuePos = nextAppt?.queueNumber;
  const myRx = (rd?.prescriptions ?? []).slice(0, 3);

  const tips = ["Stay hydrated — aim for 8 glasses of water daily 💧", "Get 7-8 hours of sleep before field training 😴", "Wash hands frequently to prevent infections 🧼", "Take short breaks during long study sessions 📚"];
  const [tip, setTip] = useState(0);
  useEffect(() => { const iv = setInterval(() => setTip((t) => (t + 1) % tips.length), 4000); return () => clearInterval(iv); }, [tips.length]);

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Welcome back, {name.split(" ").slice(-1)[0]} 👋</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your personal health portal</p>
      </div>

      {/* Digital Health ID */}
      <div className="card mb-5 overflow-hidden">
        <div className="relative bg-gradient-to-br from-navy via-[#2d5551] to-[#2d5551] p-6 text-white">
          <ShieldPlus className="absolute right-6 top-6 h-20 w-20 text-white/10" />
          <div className="text-xs text-white/60">UPNM DIGITAL HEALTH ID</div>
          <div className="mt-2 flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-2xl font-bold ring-2 ring-white/20">{name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
            <div>
              <div className="font-[Poppins] text-xl font-extrabold">{name}</div>
              <div className="font-mono text-sm text-cyan">UPNM-2024000</div>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs"><Droplet className="h-3 w-3" /> O+</span>
            <span className="rounded-full bg-white/15 px-3 py-1 text-xs">Allergies: Penicillin</span>
            <span className="rounded-full bg-mint/30 px-3 py-1 text-xs">Fit for Duty ✓</span>
          </div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="mb-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {[{ href: "/appointments", icon: CalendarPlus, label: "Book Appointment", c: "#7a9e7e" }, { href: "/ai-screener", icon: Bot, label: "AI Symptom Check", c: "#c9955a" }, { href: "/fitness", icon: ShieldPlus, label: "My Fitness", c: "#1f3d3a" }, { href: "/mc", icon: FileText, label: "Medical Certificates", c: "#d48040" }, { href: "#records", icon: ClipboardList, label: "My Records", c: "#8a6b4a" }].map((a) => (
          <Link key={a.label} href={a.href} className="card lift flex flex-col items-center gap-2 p-4 text-center">
            <div className="grid h-11 w-11 place-items-center rounded-xl icon-rotate" style={{ background: `${a.c}22` }}><a.icon className="h-5 w-5" style={{ color: a.c }} /></div>
            <span className="text-xs font-semibold text-navy dark:text-white">{a.label}</span>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          {/* Queue tracker */}
          {queuePos && (
            <div className="card p-5">
              <h2 className="mb-3 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white"><span className="h-2 w-2 rounded-full bg-mint pulse-dot" /> Live Queue Status</h2>
              <div className="flex items-center gap-4 rounded-xl bg-gradient-to-r from-mint/10 to-cyan/10 p-4">
                <div className="text-center"><div className="font-mono text-4xl font-extrabold text-navy dark:text-cyan">#{queuePos}</div><div className="text-xs text-slate-400">Your number</div></div>
                <div className="flex-1"><div className="text-sm font-semibold text-navy dark:text-white">{nextAppt?.department} · {nextAppt?.doctorName}</div><div className="text-xs text-slate-400">Est. wait ~14 min · Room B2</div><Link href="#" className="mt-1 inline-flex items-center gap-1 text-xs text-mint"><MapPin className="h-3 w-3" /> Directions to clinic</Link></div>
              </div>
            </div>
          )}

          {/* Upcoming appointments */}
          <div className="card p-5">
            <h2 className="mb-3 font-[Poppins] font-bold text-navy dark:text-white">Upcoming Appointments</h2>
            {ad ? (myAppts.length ? <div className="space-y-2">{myAppts.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/10">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-navy/10 text-center"><span className="font-mono text-xs font-bold text-navy dark:text-cyan">{a.date.slice(5)}</span></div>
                <div className="flex-1"><div className="text-sm font-semibold text-navy dark:text-white">{a.department}</div><div className="text-xs text-slate-400">{a.doctorName} · {a.time}</div></div>
                <Badge color={statusColor(a.status)}>{a.status}</Badge>
              </div>
            ))}</div> : <p className="py-6 text-center text-sm text-slate-400">No upcoming appointments</p>) : <Skeleton className="h-32 w-full" />}
          </div>

          {/* Prescriptions */}
          <div id="records" className="card p-5">
            <div className="mb-3 flex items-center justify-between"><h2 className="font-[Poppins] font-bold text-navy dark:text-white">Recent Prescriptions</h2><Button variant="ghost" onClick={() => window.print()}><Download className="h-4 w-4" /> Summary</Button></div>
            {rd ? (myRx.length ? <div className="space-y-2">{myRx.map((r) => (
              <div key={r.id} className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                <div className="flex items-center justify-between"><span className="text-sm font-semibold text-navy dark:text-white">Rx #{r.id}</span><Badge color={statusColor(r.status)}>{r.status}</Badge></div>
                <div className="mt-1 text-xs text-slate-400">{r.medications.map((m) => m.name).join(", ")}</div>
              </div>
            ))}</div> : <p className="py-6 text-center text-sm text-slate-400">No prescriptions</p>) : <Skeleton className="h-24 w-full" />}
          </div>
        </div>

        <div className="space-y-5">
          <div className="card flex flex-col items-center p-5"><h2 className="mb-2 font-[Poppins] font-bold text-navy dark:text-white">Health Score</h2><Gauge value={82} /><p className="mt-2 text-center text-xs text-slate-400">Great! Keep up your healthy habits 🎉</p></div>

          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white"><Bell className="h-4 w-4 text-amber-500" /> Reminders</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2 rounded-lg bg-amber/10 p-2.5"><span>💉</span><span className="text-slate-600 dark:text-slate-300">Annual health check due in 12 days</span></li>
              <li className="flex items-start gap-2 rounded-lg bg-cyan/10 p-2.5"><span>💊</span><span className="text-slate-600 dark:text-slate-300">Take Cetirizine at 9:00 PM tonight</span></li>
              <li className="flex items-start gap-2 rounded-lg bg-mint/10 p-2.5"><span>🏅</span><span className="text-slate-600 dark:text-slate-300">3 months no sick leave — achievement unlocked!</span></li>
            </ul>
          </div>

          <div className="card overflow-hidden bg-gradient-to-br from-navy to-[#2d5551] p-5 text-white">
            <h2 className="mb-2 font-[Poppins] font-bold">💡 Health Tip</h2>
            <p className="text-sm text-white/80 transition-all">{tips[tip]}</p>
            <div className="mt-3 flex gap-1">{tips.map((_, i) => <span key={i} className={`h-1 rounded-full transition-all ${i === tip ? "w-5 bg-cyan" : "w-1 bg-white/30"}`} />)}</div>
          </div>
        </div>
      </div>
    </Shell>
  );
}
