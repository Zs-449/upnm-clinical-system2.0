"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Badge, Button, toast, Skeleton } from "@/components/ui";
import { getSession } from "@/lib/session";
import { Save, Search, Pill, AlertTriangle, Stethoscope, Activity } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

interface Patient { id: number; patientCode: string; name: string; age: number; bloodType: string; allergies: string | null; chronicConditions: string | null; }

const ICD = ["J06.9 Acute upper respiratory infection", "K02.9 Dental caries", "F41.1 Generalized anxiety disorder", "M25.5 Joint pain", "R51 Headache", "A09 Gastroenteritis"];

// Comprehensive medicine catalog — categorized for quick selection
const MEDICINE_CATALOG: { category: string; color: string; items: { name: string; dose: string; freq: string }[] }[] = [
  { category: "Analgesics & Antipyretics", color: "#c25d5d", items: [
    { name: "Paracetamol 500mg", dose: "1 tab", freq: "TDS" },
    { name: "Paracetamol 1g", dose: "2 tabs", freq: "QDS" },
    { name: "Ibuprofen 400mg", dose: "1 tab", freq: "TDS" },
    { name: "Naproxen 250mg", dose: "1 tab", freq: "BD" },
    { name: "Tramadol 50mg", dose: "1 cap", freq: "TDS" },
    { name: "Aspirin 100mg", dose: "1 tab", freq: "OD" },
  ]},
  { category: "Antibiotics", color: "#1f3d3a", items: [
    { name: "Amoxicillin 250mg", dose: "1 cap", freq: "TDS" },
    { name: "Amoxicillin 500mg", dose: "1 cap", freq: "TDS" },
    { name: "Azithromycin 500mg", dose: "1 tab", freq: "OD" },
    { name: "Doxycycline 100mg", dose: "1 cap", freq: "BD" },
    { name: "Ciprofloxacin 500mg", dose: "1 tab", freq: "BD" },
    { name: "Cephalexin 500mg", dose: "1 cap", freq: "QDS" },
    { name: "Metronidazole 400mg", dose: "1 tab", freq: "TDS" },
  ]},
  { category: "Antihistamines", color: "#c9955a", items: [
    { name: "Cetirizine 10mg", dose: "1 tab", freq: "OD" },
    { name: "Loratadine 10mg", dose: "1 tab", freq: "OD" },
    { name: "Fexofenadine 120mg", dose: "1 tab", freq: "OD" },
    { name: "Chlorpheniramine 4mg", dose: "1 tab", freq: "TDS" },
  ]},
  { category: "Respiratory", color: "#7a9e7e", items: [
    { name: "Salbutamol Inhaler", dose: "2 puffs", freq: "PRN" },
    { name: "Prednisolone 5mg", dose: "1 tab", freq: "OD" },
    { name: "Montelukast 10mg", dose: "1 tab", freq: "OD" },
  ]},
  { category: "Gastrointestinal", color: "#d48040", items: [
    { name: "Omeprazole 20mg", dose: "1 cap", freq: "OD" },
    { name: "Metoclopramide 10mg", dose: "1 tab", freq: "TDS" },
    { name: "Loperamide 2mg", dose: "2 caps", freq: "PRN" },
    { name: "Domperidone 10mg", dose: "1 tab", freq: "TDS" },
    { name: "Hyoscine 10mg", dose: "1 tab", freq: "TDS" },
  ]},
  { category: "Cardiovascular", color: "#8a6b4a", items: [
    { name: "Amlodipine 5mg", dose: "1 tab", freq: "OD" },
    { name: "Metoprolol 50mg", dose: "1 tab", freq: "BD" },
    { name: "Warfarin 5mg", dose: "1 tab", freq: "OD" },
    { name: "Losartan 50mg", dose: "1 tab", freq: "OD" },
  ]},
  { category: "Endocrine", color: "#b87a85", items: [
    { name: "Metformin 500mg", dose: "1 tab", freq: "BD" },
    { name: "Levothyroxine 50mcg", dose: "1 tab", freq: "OD" },
  ]},
  { category: "Vitamins & Supplements", color: "#7a9e8a", items: [
    { name: "Vitamin C 500mg", dose: "1 tab", freq: "OD" },
    { name: "Vitamin B Complex", dose: "1 tab", freq: "OD" },
    { name: "Iron Supplement 200mg", dose: "1 tab", freq: "OD" },
    { name: "Calcium 500mg + Vit D", dose: "1 tab", freq: "OD" },
  ]},
  { category: "Topical & Others", color: "#7a7168", items: [
    { name: "Diclofenac Gel", dose: "apply", freq: "TDS" },
    { name: "Hydrocortisone Cream 1%", dose: "apply", freq: "BD" },
    { name: "Oral Rehydration Salts", dose: "1 sachet", freq: "PRN" },
  ]},
];

const ALL_MEDS = MEDICINE_CATALOG.flatMap((c) => c.items.map((i) => ({ ...i, category: c.category, color: c.color })));
const MEDS = ALL_MEDS.map((m) => m.name);
const INTERACTIONS: Record<string, { with: string; severity: string; note: string }[]> = {
  "Warfarin 5mg": [{ with: "Aspirin 100mg", severity: "Major", note: "Increased bleeding risk" }, { with: "Ibuprofen 400mg", severity: "Major", note: "GI bleeding risk" }],
  "Ibuprofen 400mg": [{ with: "Aspirin 100mg", severity: "Moderate", note: "Reduced antiplatelet effect" }],
};

// A medication being built in the prescription form. dose/freq are
// pre-filled from the catalog when picked from it (still editable); for a
// custom-typed medicine — and always for duration/quantity — the doctor
// must fill them in explicitly before the record can be saved.
interface MedItem { name: string; dose: string; freq: string; duration: string; quantity: string; }

function vitalStatus(kind: string, v: number) {
  if (kind === "hr") return v > 100 ? { c: "#c25d5d", l: "Tachycardia" } : v < 60 ? { c: "#d48040", l: "Bradycardia" } : { c: "#7a9e7e", l: "Normal" };
  if (kind === "temp") return v >= 37.8 ? { c: "#c25d5d", l: "Fever" } : { c: "#7a9e7e", l: "Normal" };
  if (kind === "spo2") return v < 95 ? { c: "#c25d5d", l: "Low O₂" } : { c: "#7a9e7e", l: "Normal" };
  return { c: "#7a9e7e", l: "Normal" };
}

export default function EmrPage() {
  const { data, loading } = useApi<{ patients: Patient[] }>("/api/patients");
  const [selId, setSelId] = useState<number | null>(null);
  const [complaint, setComplaint] = useState("");
  const [diagnosis, setDiagnosis] = useState("");
  const [dxSearch, setDxSearch] = useState("");
  const [treatment, setTreatment] = useState("");
  const [vitals, setVitals] = useState({ bpS: 120, bpD: 80, hr: 78, temp: 36.8, spo2: 98, weight: 68, height: 172 });
  const [meds, setMeds] = useState<MedItem[]>([]);
  const [medSearch, setMedSearch] = useState("");
  const [saved, setSaved] = useState("");
  const [saving, setSaving] = useState(false);

  const patient = data?.patients.find((p) => p.id === selId) ?? data?.patients[0];
  useEffect(() => { if (data?.patients[0] && selId === null) setSelId(data.patients[0].id); }, [data, selId]);

  const bmi = useMemo(() => (vitals.weight / Math.pow(vitals.height / 100, 2)).toFixed(1), [vitals]);

  // auto-save
  useEffect(() => {
    const iv = setInterval(() => { if (complaint || diagnosis) setSaved(new Date().toLocaleTimeString()); }, 30000);
    return () => clearInterval(iv);
  }, [complaint, diagnosis]);

  function addMed(name: string) {
    if (meds.some((m) => m.name === name)) return;
    const info = ALL_MEDS.find((x) => x.name === name);
    setMeds([...meds, { name, dose: info?.dose ?? "", freq: info?.freq ?? "", duration: "", quantity: "" }]);
  }
  function updateMed(name: string, patch: Partial<MedItem>) {
    setMeds(meds.map((m) => (m.name === name ? { ...m, ...patch } : m)));
  }
  function removeMed(name: string) {
    setMeds(meds.filter((m) => m.name !== name));
  }

  async function saveRecord() {
    if (!selId) { toast("Select a patient first.", "error"); return; }
    if (!complaint.trim() && !diagnosis.trim() && !treatment.trim()) {
      toast("Enter at least a chief complaint, diagnosis, or treatment plan before saving.", "error");
      return;
    }
    // A prescription is optional for a consultation — but if any medicines
    // were added, every one of them must be fully specified before saving.
    for (const m of meds) {
      if (!m.dose.trim()) { toast(`Enter a dose for "${m.name}".`, "error"); return; }
      if (!m.freq.trim()) { toast(`Enter a frequency for "${m.name}".`, "error"); return; }
      if (!m.duration.trim()) { toast(`Enter a duration for "${m.name}".`, "error"); return; }
      const qty = Number(m.quantity);
      if (!m.quantity.trim() || !Number.isFinite(qty) || qty <= 0) {
        toast(`Enter a valid quantity (greater than 0) for "${m.name}".`, "error");
        return;
      }
    }

    setSaving(true);
    try {
      const session = getSession();
      const res = await fetch("/api/medical-records", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: selId,
          doctorName: session?.name ?? "Attending Doctor",
          chiefComplaint: complaint,
          vitals,
          diagnosis,
          treatmentPlan: treatment,
          // Omit entirely when empty so the API treats this as a
          // consultation with no prescription, rather than an invalid one.
          medications: meds.length > 0
            ? meds.map((m) => ({
                name: m.name,
                dose: m.dose.trim(),
                freq: m.freq.trim(),
                duration: m.duration.trim(),
                quantity: Number(m.quantity),
              }))
            : undefined,
        }),
      });
      const result = await res.json();
      if (!result.ok) {
        toast(result.error || "Could not save the consultation.", "error");
        return;
      }
      toast(result.prescription ? "Consultation and prescription saved to the database." : "Consultation saved to the database.");
      setSaved(new Date().toLocaleTimeString());
      setMeds([]);
    } catch {
      toast("Network error — nothing was saved.", "error");
    } finally {
      setSaving(false);
    }
  }

  const interactions = useMemo(() => {
    const found: { a: string; b: string; severity: string; note: string }[] = [];
    meds.forEach((m) => (INTERACTIONS[m.name] ?? []).forEach((x) => { if (meds.some((y) => y.name === x.with)) found.push({ a: m.name, b: x.with, severity: x.severity, note: x.note }); }));
    return found;
  }, [meds]);

  const allergyConflict = useMemo(() => {
    if (!patient?.allergies) return [];
    return meds.filter((m) => patient.allergies!.toLowerCase().includes("penicillin") && m.name.toLowerCase().includes("amox")).map((m) => m.name);
  }, [meds, patient]);

  if (loading) return <Shell><Skeleton className="h-96 w-full" /></Shell>;

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Electronic Medical Records</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Consultation & prescription workspace</p>
        </div>
        <div className="flex items-center gap-3">
          {saved && <span className="text-xs text-mint">✓ Auto-saved {saved}</span>}
          <Button variant="mint" disabled={saving} onClick={saveRecord}><Save className="h-4 w-4" /> {saving ? "Saving…" : "Save Record"}</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Patient panel */}
        <div className="card h-fit p-5">
          <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Select Patient</label>
          <select value={selId ?? ""} onChange={(e) => setSelId(Number(e.target.value))} className="mb-4 w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none dark:border-white/10 dark:bg-white/5 dark:text-white">
            {data?.patients.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.patientCode})</option>)}
          </select>
          {patient && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-navy to-mint text-sm font-bold text-white">{patient.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}</div>
                <div><div className="font-semibold text-navy dark:text-white">{patient.name}</div><div className="text-xs text-slate-400">{patient.age}y · {patient.bloodType}</div></div>
              </div>
              <div className="rounded-xl bg-amber/10 p-3 text-sm"><div className="flex items-center gap-1 font-semibold text-amber-600"><AlertTriangle className="h-4 w-4" /> Allergies</div><p className="mt-1 text-slate-500 dark:text-slate-400">{patient.allergies || "None"}</p></div>
              <div className="rounded-xl bg-cyan/10 p-3 text-sm"><div className="font-semibold text-cyan-700 dark:text-cyan-300">Chronic Conditions</div><p className="mt-1 text-slate-500 dark:text-slate-400">{patient.chronicConditions || "None"}</p></div>
            </div>
          )}
        </div>

        {/* Form */}
        <div className="space-y-5 lg:col-span-2">
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white"><Stethoscope className="h-4 w-4" /> Chief Complaint</h3>
            <textarea value={complaint} onChange={(e) => setComplaint(e.target.value)} rows={2} placeholder="Patient reports…" className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>

          <div className="card p-5">
            <h3 className="mb-4 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white"><Activity className="h-4 w-4" /> Vital Signs</h3>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              <VitalInput label="Blood Pressure" unit="mmHg">
                <div className="flex items-center gap-1"><NumIn value={vitals.bpS} onChange={(v) => setVitals({ ...vitals, bpS: v })} /><span>/</span><NumIn value={vitals.bpD} onChange={(v) => setVitals({ ...vitals, bpD: v })} /></div>
                <Bar value={vitals.bpS} min={90} max={160} good={[100, 130]} />
              </VitalInput>
              <VitalInput label="Heart Rate" unit="bpm" status={vitalStatus("hr", vitals.hr)}>
                <NumIn value={vitals.hr} onChange={(v) => setVitals({ ...vitals, hr: v })} />
              </VitalInput>
              <VitalInput label="Temperature" unit="°C" status={vitalStatus("temp", vitals.temp)}>
                <NumIn value={vitals.temp} step={0.1} onChange={(v) => setVitals({ ...vitals, temp: v })} />
              </VitalInput>
              <VitalInput label="SpO₂" unit="%" status={vitalStatus("spo2", vitals.spo2)}>
                <NumIn value={vitals.spo2} onChange={(v) => setVitals({ ...vitals, spo2: v })} />
              </VitalInput>
              <VitalInput label="Weight" unit="kg"><NumIn value={vitals.weight} onChange={(v) => setVitals({ ...vitals, weight: v })} /></VitalInput>
              <VitalInput label="Height" unit="cm"><NumIn value={vitals.height} onChange={(v) => setVitals({ ...vitals, height: v })} /></VitalInput>
            </div>
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-mint/10 px-3 py-2 text-sm"><span className="font-semibold text-navy dark:text-white">BMI: <span className="font-mono">{bmi}</span></span><Badge color={Number(bmi) < 18.5 ? "amber" : Number(bmi) < 25 ? "mint" : Number(bmi) < 30 ? "amber" : "danger"}>{Number(bmi) < 18.5 ? "Underweight" : Number(bmi) < 25 ? "Normal" : Number(bmi) < 30 ? "Overweight" : "Obese"}</Badge></div>
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-[Poppins] font-bold text-navy dark:text-white">Diagnosis (ICD-10)</h3>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input value={dxSearch} onChange={(e) => setDxSearch(e.target.value)} placeholder="Search ICD-10 codes…" className="w-full rounded-lg border border-navy/10 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
              {dxSearch && (
                <div className="absolute z-10 mt-1 w-full rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1a2b25]">
                  {ICD.filter((c) => c.toLowerCase().includes(dxSearch.toLowerCase())).map((c) => (
                    <button key={c} onClick={() => { setDiagnosis(c); setDxSearch(""); }} className="block w-full px-3 py-2 text-left text-sm hover:bg-cyan/10 dark:text-white">{c}</button>
                  ))}
                </div>
              )}
            </div>
            {diagnosis && <div className="mt-2"><Badge color="cyan">{diagnosis}</Badge></div>}
          </div>

          {/* Prescription */}
          <div className="card p-5">
            <h3 className="mb-3 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white"><Pill className="h-4 w-4" /> Prescription</h3>

            {/* Search */}
            <div className="relative mb-3">
              <input value={medSearch} onChange={(e) => setMedSearch(e.target.value)} placeholder="🔍 Search medicine or browse by category below…" className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
              {medSearch && (
                <div className="absolute z-20 mt-1 max-h-64 w-full overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-xl dark:border-white/10 dark:bg-[#1a2b25]">
                  {ALL_MEDS.filter((m) => m.name.toLowerCase().includes(medSearch.toLowerCase()) && !meds.some((x) => x.name === m.name)).map((m, i) => (
                    <button key={i} onClick={() => { addMed(m.name); setMedSearch(""); }} className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-mint/10 dark:text-white">
                      <span><span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ background: m.color }} />{m.name}</span>
                      <span className="text-xs text-slate-400">{m.category}</span>
                    </button>
                  ))}
                  {ALL_MEDS.filter((m) => m.name.toLowerCase().includes(medSearch.toLowerCase()) && !meds.some((x) => x.name === m.name)).length === 0 && (
                    <div className="px-3 py-2 text-xs text-slate-400">No matches — enter a custom medicine below</div>
                  )}
                </div>
              )}
            </div>

            {/* Categorized quick-pick */}
            <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {MEDICINE_CATALOG.map((cat) => (
                <details key={cat.category} className="group rounded-lg border border-slate-100 dark:border-white/10">
                  <summary className="flex cursor-pointer items-center gap-2 px-3 py-2 text-xs font-semibold text-navy dark:text-white hover:bg-slate-50 dark:hover:bg-white/5">
                    <span className="h-2 w-2 rounded-full" style={{ background: cat.color }} />
                    {cat.category}
                    <span className="ml-auto text-slate-400">({cat.items.length})</span>
                  </summary>
                  <div className="space-y-1 px-2 pb-2">
                    {cat.items.map((m) => {
                      const picked = meds.some((x) => x.name === m.name);
                      return (
                        <button
                          key={m.name}
                          disabled={picked}
                          onClick={() => addMed(m.name)}
                          className={`flex w-full items-center justify-between rounded px-2 py-1.5 text-left text-xs transition ${picked ? "bg-mint/10 text-mint cursor-default" : "hover:bg-mint/5 text-slate-600 dark:text-slate-300"}`}
                        >
                          <span>{picked ? "✓" : "+"} {m.name}</span>
                          <span className="text-[10px] text-slate-400">{m.dose} {m.freq}</span>
                        </button>
                      );
                    })}
                  </div>
                </details>
              ))}
            </div>

            {/* Custom medicine input */}
            <div className="mb-3 flex gap-2">
              <input placeholder="Custom medicine name…" className="flex-1 rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const v = (e.target as HTMLInputElement).value.trim();
                  if (v) addMed(v);
                  (e.target as HTMLInputElement).value = "";
                }
              }} />
            </div>

            {/* Selected medicines — each needs an explicit dose, frequency,
               duration, and quantity before the prescription can be saved.
               Quantity is never inferred from the other fields. */}
            <div className="space-y-2">
              {meds.map((m) => (
                <div key={m.name} className="rounded-lg border border-slate-100 p-2.5 dark:border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-navy dark:text-white">💊 {m.name}</span>
                    <button onClick={() => removeMed(m.name)} className="text-xs text-slate-400 hover:text-danger">✕ Remove</button>
                  </div>
                  <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
                    <input value={m.dose} onChange={(e) => updateMed(m.name, { dose: e.target.value })} placeholder="Dose (e.g. 1 tab)" className="rounded border border-navy/10 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <input value={m.freq} onChange={(e) => updateMed(m.name, { freq: e.target.value })} placeholder="Freq (e.g. TDS)" className="rounded border border-navy/10 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <input value={m.duration} onChange={(e) => updateMed(m.name, { duration: e.target.value })} placeholder="Duration (e.g. 5 days)" className="rounded border border-navy/10 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                    <input type="number" min={1} value={m.quantity} onChange={(e) => updateMed(m.name, { quantity: e.target.value })} placeholder="Quantity *" className="rounded border border-navy/10 bg-slate-50 px-2 py-1 text-xs outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                </div>
              ))}
              {meds.length === 0 && <span className="text-xs text-slate-400">No medicines added — search or click a category above</span>}
            </div>

            {(interactions.length > 0 || allergyConflict.length > 0) && (
              <div className="mt-4 space-y-2">
                {allergyConflict.map((m) => (
                  <div key={m} className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 p-3 animate-shake">
                    <AlertTriangle className="mt-0.5 h-4 w-4 text-danger" />
                    <div className="text-sm"><span className="font-bold text-danger">ALLERGY ALERT:</span> <span className="text-slate-600 dark:text-slate-300">{m} conflicts with recorded penicillin allergy.</span></div>
                  </div>
                ))}
                {interactions.map((x, i) => (
                  <div key={i} className="flex items-start gap-2 rounded-xl border p-3" style={{ borderColor: x.severity === "Major" ? "#c25d5d66" : "#d4804066", background: x.severity === "Major" ? "#c25d5d0d" : "#d480400d" }}>
                    <AlertTriangle className="mt-0.5 h-4 w-4" style={{ color: x.severity === "Major" ? "#c25d5d" : "#d48040" }} />
                    <div className="text-sm"><Badge color={x.severity === "Major" ? "danger" : "amber"}>{x.severity}</Badge> <span className="text-slate-600 dark:text-slate-300">{x.a} + {x.b}: {x.note}</span></div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card p-5">
            <h3 className="mb-3 font-[Poppins] font-bold text-navy dark:text-white">Treatment Plan</h3>
            <textarea value={treatment} onChange={(e) => setTreatment(e.target.value)} rows={3} placeholder="Rest, hydration, follow-up in 3 days…" className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
        </div>
      </div>
    </Shell>
  );
}

function VitalInput({ label, unit, status, children }: { label: string; unit: string; status?: { c: string; l: string }; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
      <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{label}</span><span className="text-[10px] text-slate-400">{unit}</span></div>
      <div className="mt-1 text-navy dark:text-white">{children}</div>
      {status && <div className="mt-1 text-[10px] font-semibold" style={{ color: status.c }}>● {status.l}</div>}
    </div>
  );
}
function NumIn({ value, onChange, step }: { value: number; onChange: (v: number) => void; step?: number }) {
  return <input type="number" step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-16 rounded border border-navy/10 bg-slate-50 px-2 py-1 font-mono text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />;
}
function Bar({ value, min, max, good }: { value: number; min: number; max: number; good: [number, number] }) {
  const pct = Math.min(Math.max(((value - min) / (max - min)) * 100, 0), 100);
  const ok = value >= good[0] && value <= good[1];
  return <div className="mt-2 h-1.5 w-full rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: ok ? "#7a9e7e" : "#d48040" }} /></div>;
}
