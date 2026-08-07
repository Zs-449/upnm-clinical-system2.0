"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Badge, statusColor, Button, Skeleton } from "@/components/ui";
import { Gauge } from "@/components/charts";
import { Droplet, AlertTriangle, HeartPulse, Printer, ArrowLeft } from "lucide-react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Suspense, useState } from "react";

interface Patient { id: number; patientCode: string; name: string; age: number; gender: string; bloodType: string; department: string; status: string; phone: string | null; email: string | null; allergies: string | null; chronicConditions: string | null; emergencyContact: string | null; healthScore: number | null; lastVisit: string | null; }
interface Appt { id: number; patientId: number; doctorName: string; department: string; date: string; time: string; status: string; symptoms: string | null; }
interface Rx { id: number; patientId: number; doctorName: string; medications: { name: string; dose: string; freq: string; duration: string }[]; status: string; }
interface Lab { id: number; patientId: number; testName: string; value: string; unit: string | null; referenceRange: string | null; flag: string; }

const TABS = ["History", "Appointments", "Prescriptions", "Lab Results", "Documents"];

function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const pid = Number(id);
  const { data: pd, loading } = useApi<{ patients: Patient[] }>("/api/patients");
  const { data: ad } = useApi<{ appointments: Appt[] }>("/api/appointments");
  const { data: rd } = useApi<{ prescriptions: Rx[] }>("/api/prescriptions");
  const { data: ld } = useApi<{ labResults: Lab[] }>("/api/lab-results");
  const searchParams = useSearchParams();
  const requestedTab = searchParams.get("tab");
  const [tab, setTab] = useState(requestedTab && TABS.includes(requestedTab) ? requestedTab : "History");

  const patient = pd?.patients.find((p) => p.id === pid);
  const appts = (ad?.appointments ?? []).filter((a) => a.patientId === pid);
  const rxs = (rd?.prescriptions ?? []).filter((r) => r.patientId === pid);
  const labs = (ld?.labResults ?? []).filter((l) => l.patientId === pid);

  if (loading || !patient) {
    return <Shell><Skeleton className="h-48 w-full" /></Shell>;
  }

  return (
    <Shell>
      <Link href="/patients" className="mb-4 inline-flex items-center gap-1 text-sm text-slate-400 hover:text-navy dark:hover:text-white"><ArrowLeft className="h-4 w-4" /> Back to patients</Link>

      {/* Hero */}
      <div className="card relative overflow-hidden p-6">
        <div className="absolute inset-0 bg-gradient-to-r from-navy to-[#2d5551] opacity-95" />
        <div className="relative z-10 flex flex-wrap items-center gap-5 text-white">
          <div className="grid h-20 w-20 place-items-center rounded-2xl bg-white/15 text-2xl font-bold backdrop-blur ring-2 ring-white/20">
            {patient.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
          </div>
          <div className="flex-1">
            <h1 className="font-[Poppins] text-2xl font-extrabold">{patient.name}</h1>
            <p className="font-mono text-sm text-white/60">{patient.patientCode}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">{patient.age}y · {patient.gender}</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">{patient.department}</span>
              <span className="rounded-full bg-white/15 px-2.5 py-0.5 text-xs">{patient.status}</span>
            </div>
          </div>
          <Button variant="secondary" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print Summary</Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="my-5 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <div className="card flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-danger/15"><Droplet className="h-5 w-5 text-danger" /></div>
          <div><div className="text-xs text-slate-400">Blood Type</div><div className="font-mono text-lg font-bold text-navy dark:text-white">{patient.bloodType}</div></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-amber/20"><AlertTriangle className="h-5 w-5 text-amber-500" /></div>
          <div><div className="text-xs text-slate-400">Allergies</div><div className="text-sm font-bold text-navy dark:text-white">{patient.allergies || "None"}</div></div>
        </div>
        <div className="card flex items-center gap-3 p-4">
          <div className="grid h-11 w-11 place-items-center rounded-xl bg-cyan/15"><HeartPulse className="h-5 w-5 text-cyan" /></div>
          <div><div className="text-xs text-slate-400">Chronic</div><div className="text-sm font-bold text-navy dark:text-white">{patient.chronicConditions || "None"}</div></div>
        </div>
        <div className="card flex items-center justify-center p-2"><Gauge value={patient.healthScore ?? 80} /></div>
      </div>

      {/* Tabs */}
      <div className="card overflow-hidden">
        <div className="flex gap-1 overflow-x-auto border-b border-slate-100 px-2 dark:border-white/10">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)} className={`whitespace-nowrap px-4 py-3 text-sm font-semibold transition ${tab === t ? "border-b-2 border-mint text-navy dark:text-white" : "text-slate-400 hover:text-navy dark:hover:text-white"}`}>{t}</button>
          ))}
        </div>
        <div className="p-5">
          {tab === "History" && (
            <div className="relative space-y-4 pl-6">
              <div className="absolute left-2 top-1 h-full w-0.5 bg-slate-200 dark:bg-white/10" />
              {[{ t: "Registered in system", d: patient.lastVisit }, ...appts.map((a) => ({ t: `${a.department} — ${a.symptoms || "consultation"}`, d: a.date }))].map((e, i) => (
                <div key={i} className="relative">
                  <span className="absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-white bg-mint dark:border-[#1a2b25]" />
                  <div className="text-sm font-semibold text-navy dark:text-white">{e.t}</div>
                  <div className="text-xs text-slate-400">{e.d}</div>
                </div>
              ))}
            </div>
          )}
          {tab === "Appointments" && (appts.length ? <div className="space-y-2">{appts.map((a) => (
            <div key={a.id} className="flex items-center justify-between rounded-xl border border-slate-100 p-3 dark:border-white/10">
              <div><div className="text-sm font-semibold text-navy dark:text-white">{a.department} · {a.doctorName}</div><div className="text-xs text-slate-400">{a.date} at {a.time} — {a.symptoms}</div></div>
              <Badge color={statusColor(a.status)}>{a.status}</Badge>
            </div>
          ))}</div> : <Empty />)}
          {tab === "Prescriptions" && (rxs.length ? <div className="space-y-2">{rxs.map((r) => (
            <div key={r.id} className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
              <div className="flex items-center justify-between"><span className="text-sm font-semibold text-navy dark:text-white">Rx #{r.id} · {r.doctorName}</span><Badge color={statusColor(r.status)}>{r.status}</Badge></div>
              <ul className="mt-2 space-y-1 text-xs text-slate-500 dark:text-slate-400">{r.medications.map((m, i) => <li key={i}>💊 {m.name} — {m.dose} {m.freq} for {m.duration}</li>)}</ul>
            </div>
          ))}</div> : <Empty />)}
          {tab === "Lab Results" && (labs.length ? <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs uppercase text-slate-400"><tr>{["Test", "Value", "Range", "Flag"].map((h) => <th key={h} className="py-2">{h}</th>)}</tr></thead><tbody>{labs.map((l) => (
            <tr key={l.id} className={`border-t border-slate-100 dark:border-white/5 ${l.flag !== "Normal" ? "bg-danger/5" : ""}`}><td className="py-2 font-medium text-navy dark:text-white">{l.testName}</td><td className="py-2 font-mono">{l.value} {l.unit}</td><td className="py-2 text-slate-400">{l.referenceRange}</td><td className="py-2"><Badge color={statusColor(l.flag)}>{l.flag}</Badge></td></tr>
          ))}</tbody></table></div> : <Empty />)}
          {tab === "Documents" && <Empty text="No documents uploaded yet" />}
        </div>
      </div>
    </Shell>
  );
}

function Empty({ text = "No records available" }: { text?: string }) {
  return <div className="flex flex-col items-center py-10 text-center"><div className="text-4xl">📄</div><p className="mt-2 text-sm text-slate-400">{text}</p></div>;
}

export default function PatientProfilePage() {
  return (
    <Suspense fallback={<Shell><Skeleton className="h-48 w-full" /></Shell>}>
      <PatientProfile />
    </Suspense>
  );
}
