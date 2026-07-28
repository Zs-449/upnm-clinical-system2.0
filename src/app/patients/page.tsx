"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Badge, statusColor, Button, Modal, Skeleton, toast } from "@/components/ui";
import CoverFlow, { MEDICAL_DOCS } from "@/components/CoverFlow";
import { Search, LayoutGrid, List, Plus, Eye, Droplet, Filter } from "lucide-react";
import { useMemo, useState } from "react";
import Link from "next/link";

interface Patient {
  id: number;
  patientCode: string;
  name: string;
  age: number;
  gender: string;
  bloodType: string;
  department: string;
  status: string;
  allergies: string | null;
  lastVisit: string | null;
  healthScore: number | null;
}

export default function PatientsPage() {
  const { data, loading, reload } = useApi<{ patients: Patient[] }>("/api/patients");
  const [view, setView] = useState<"grid" | "list">("grid");
  const [q, setQ] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [modal, setModal] = useState(false);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: "", age: "", gender: "Male", bloodType: "O+", department: "General",
    phone: "", email: "", allergies: "", chronicConditions: "", emergencyContact: "",
  });

  const filtered = useMemo(() => {
    let rows = data?.patients ?? [];
    if (q) rows = rows.filter((p) => (p.name + p.patientCode).toLowerCase().includes(q.toLowerCase()));
    if (dept !== "All") rows = rows.filter((p) => p.department === dept);
    if (status !== "All") rows = rows.filter((p) => p.status === status);
    return rows;
  }, [data, q, dept, status]);

  async function save() {
    if (!form.name || !form.age) { toast("Name and age are required", "error"); setStep(1); return; }
    setSaving(true);
    const res = await fetch("/api/patients", {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form),
    });
    const d = await res.json();
    setSaving(false);
    if (d.ok) {
      toast("Patient registered successfully");
      setModal(false); setStep(1);
      setForm({ name: "", age: "", gender: "Male", bloodType: "O+", department: "General", phone: "", email: "", allergies: "", chronicConditions: "", emergencyContact: "" });
      reload();
    } else toast("Failed to save", "error");
  }

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Patient Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">{filtered.length} patients found</p>
        </div>
        <Button onClick={() => setModal(true)}><Plus className="h-4 w-4" /> Add Patient</Button>
      </div>

      {/* Toolbar */}
      <div className="card mb-5 flex flex-wrap items-center gap-3 p-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search by name or ID…" className="w-full rounded-lg border border-navy/10 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
        </div>
        <Select icon value={dept} onChange={setDept} options={["All", "General", "Dental", "Mental Health", "Emergency"]} />
        <Select value={status} onChange={setStatus} options={["All", "Active", "Inactive", "Critical"]} />
        <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-white/5">
          <button onClick={() => setView("grid")} className={`rounded-md p-1.5 ${view === "grid" ? "bg-white text-navy shadow dark:bg-navy dark:text-white" : "text-slate-400"}`}><LayoutGrid className="h-4 w-4" /></button>
          <button onClick={() => setView("list")} className={`rounded-md p-1.5 ${view === "list" ? "bg-white text-navy shadow dark:bg-navy dark:text-white" : "text-slate-400"}`}><List className="h-4 w-4" /></button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3, 4, 5, 6].map((i) => <Skeleton key={i} className="h-44 w-full" />)}</div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center py-16"><div className="text-5xl">🔍</div><p className="mt-3 text-slate-400">No patients match your filters</p></div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p, i) => (
            <Link key={p.id} href={`/patients/${p.id}`} className="card-premium lift group cursor-pointer p-5 animate-fade-up block" style={{ animationDelay: `${Math.min(i * 30, 300)}ms` }}>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-navy to-mint text-sm font-bold text-white transition-transform group-hover:scale-110">
                  {p.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
                </div>
                <div className="min-w-0">
                  <div className="truncate font-semibold text-navy dark:text-white">{p.name}</div>
                  <div className="font-mono text-[11px] text-slate-400">{p.patientCode}</div>
                </div>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge color="navy">{p.age}y · {p.gender}</Badge>
                <Badge color="danger"><Droplet className="h-3 w-3" />{p.bloodType}</Badge>
                <Badge color={statusColor(p.status)}>{p.status}</Badge>
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                <span>{p.department}</span>
                <span>Last: {p.lastVisit}</span>
              </div>
              <div className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-navy/10 py-2 text-xs font-semibold text-navy transition group-hover:border-mint group-hover:bg-mint group-hover:text-white dark:border-white/10 dark:text-white">
                <Eye className="h-3.5 w-3.5" /> View Profile →
              </div>
            </Link>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase text-slate-400 dark:bg-white/5">
                <tr>{["Patient", "ID", "Age/Gender", "Blood", "Dept", "Status", ""].map((h) => <th key={h} className="px-4 py-3 font-semibold">{h}</th>)}</tr>
              </thead>
              <tbody>
                {filtered.map((p, i) => (
                  <tr key={p.id} className={`border-t border-slate-100 dark:border-white/5 ${i % 2 ? "bg-slate-50/40 dark:bg-white/[0.02]" : ""} hover:bg-cyan/5`}>
                    <td className="px-4 py-3 font-semibold text-navy dark:text-white">{p.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-400">{p.patientCode}</td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.age} · {p.gender}</td>
                    <td className="px-4 py-3"><Badge color="danger">{p.bloodType}</Badge></td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{p.department}</td>
                    <td className="px-4 py-3"><Badge color={statusColor(p.status)}>{p.status}</Badge></td>
                    <td className="px-4 py-3"><Link href={`/patients/${p.id}`} className="text-mint hover:underline">View</Link></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========== RECENT MEDICAL DOCUMENTS COVERFLOW ========== */}
      <div className="card mt-5 p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-[Poppins] text-lg font-bold text-navy dark:text-white">Recent Medical Documents</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Swipe through lab reports, X-rays, and prescriptions</p>
          </div>
          <span className="text-xs text-slate-400">👆 Click or swipe</span>
        </div>
        <CoverFlow items={MEDICAL_DOCS} height={240} />
      </div>

      {/* Add modal - multi-step */}
      <Modal open={modal} onClose={() => setModal(false)} title="Register New Patient" wide>
        <div className="mb-5 flex items-center gap-2">
          {["Personal", "Medical", "Emergency"].map((label, i) => (
            <div key={label} className="flex flex-1 items-center gap-2">
              <div className={`grid h-7 w-7 place-items-center rounded-full text-xs font-bold ${step > i ? "bg-mint text-white" : step === i + 1 ? "bg-navy text-white" : "bg-slate-200 text-slate-400 dark:bg-white/10"}`}>{i + 1}</div>
              <span className={`text-xs font-semibold ${step === i + 1 ? "text-navy dark:text-white" : "text-slate-400"}`}>{label}</span>
              {i < 2 && <div className={`h-0.5 flex-1 ${step > i + 1 ? "bg-mint" : "bg-slate-200 dark:bg-white/10"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            <Field label="Full Name" value={form.name} onChange={(v) => setForm({ ...form, name: v })} full />
            <Field label="Age" type="number" value={form.age} onChange={(v) => setForm({ ...form, age: v })} />
            <SelectField label="Gender" value={form.gender} onChange={(v) => setForm({ ...form, gender: v })} options={["Male", "Female"]} />
            <SelectField label="Blood Type" value={form.bloodType} onChange={(v) => setForm({ ...form, bloodType: v })} options={["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"]} />
            <SelectField label="Department" value={form.department} onChange={(v) => setForm({ ...form, department: v })} options={["General", "Dental", "Mental Health", "Emergency"]} />
          </div>
        )}
        {step === 2 && (
          <div className="grid grid-cols-2 gap-3 animate-fade-up">
            <Field label="Phone" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
            <Field label="Email" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
            <Field label="Allergies (comma separated)" value={form.allergies} onChange={(v) => setForm({ ...form, allergies: v })} full warn={form.allergies.length > 0} />
            <Field label="Chronic Conditions" value={form.chronicConditions} onChange={(v) => setForm({ ...form, chronicConditions: v })} full />
          </div>
        )}
        {step === 3 && (
          <div className="animate-fade-up">
            <Field label="Emergency Contact (Name — Phone)" value={form.emergencyContact} onChange={(v) => setForm({ ...form, emergencyContact: v })} full />
            <div className="mt-4 rounded-xl bg-mint/10 p-4 text-sm">
              <p className="font-semibold text-navy dark:text-white">Review</p>
              <p className="mt-1 text-slate-500 dark:text-slate-400">{form.name || "—"} · {form.age || "?"}y · {form.bloodType} · {form.department}</p>
            </div>
          </div>
        )}

        <div className="mt-6 flex justify-between">
          <Button variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : setModal(false))}>{step > 1 ? "Back" : "Cancel"}</Button>
          {step < 3 ? <Button onClick={() => setStep(step + 1)}>Next →</Button> : <Button variant="mint" loading={saving} onClick={save}>Register Patient</Button>}
        </div>
      </Modal>
    </Shell>
  );
}

function Select({ value, onChange, options, icon }: { value: string; onChange: (v: string) => void; options: string[]; icon?: boolean }) {
  return (
    <div className="relative">
      {icon && <Filter className="pointer-events-none absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />}
      <select value={value} onChange={(e) => onChange(e.target.value)} className={`rounded-lg border border-navy/10 bg-slate-50 py-2 pr-8 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white ${icon ? "pl-8" : "pl-3"}`}>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function Field({ label, value, onChange, type = "text", full, warn }: { label: string; value: string; onChange: (v: string) => void; type?: string; full?: boolean; warn?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{label}{warn && <span className="ml-1 text-amber-500">⚠</span>}</label>
      <input type={type} value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan focus:ring-2 focus:ring-cyan/20 dark:border-white/10 dark:bg-white/5 dark:text-white" />
    </div>
  );
}

function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div>
      <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</label>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white">
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
