"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Badge, statusColor, Button, Modal, Skeleton, toast } from "@/components/ui";
import { ChevronLeft, ChevronRight, Plus, Stethoscope, HeartPulse, Cross, Brain, CheckCircle2, QrCode } from "lucide-react";
import { useMemo, useState } from "react";
import { DEPTS as DEPTS_BASE, DOCTORS, SLOTS, DEPT_COLORS } from "@/lib/clinic";

interface Appt { id: number; patientName: string; doctorName: string; department: string; date: string; time: string; status: string; urgency: string; queueNumber: number | null; }

const DEPT_ICONS: Record<string, typeof Stethoscope> = { General: Stethoscope, Dental: Cross, "Mental Health": Brain, Emergency: HeartPulse };
const DEPTS = DEPTS_BASE.map((d) => ({ ...d, icon: DEPT_ICONS[d.name] }));

export default function AppointmentsPage() {
  const { data, loading, reload } = useApi<{ appointments: Appt[] }>("/api/appointments");
  const [month, setMonth] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [booking, setBooking] = useState(false);
  const [step, setStep] = useState(1);
  const [sel, setSel] = useState({ department: "", doctor: "", date: "", time: "", symptoms: "", urgency: "Routine", patientName: "", patientAge: "21", patientGender: "Male", patientBloodType: "O+", patientPhone: "", patientEmail: "" });
  const [saving, setSaving] = useState(false);
  const [done, setDone] = useState(false);

  const todayStr = new Date(new Date().toLocaleString("en-US", {timeZone: "Asia/Kuala_Lumpur"})).toLocaleDateString('en-CA');
  const days = useMemo(() => {
    const first = new Date(month.getFullYear(), month.getMonth(), 1);
    const startDay = first.getDay();
    const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    const cells: (string | null)[] = [];
    for (let i = 0; i < startDay; i++) cells.push(null);
    for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d).toISOString().slice(0, 10));
    return cells;
  }, [month]);

  const apptsByDate = useMemo(() => {
    const map: Record<string, Appt[]> = {};
    (data?.appointments ?? []).forEach((a) => { (map[a.date] ??= []).push(a); });
    return map;
  }, [data]);

  const symptomChips = ["Fever", "Cough", "Headache", "Sore throat", "Fatigue", "Nausea", "Body ache"];

  async function confirm() {
    setSaving(true);
    const res = await fetch("/api/appointments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...sel, doctorName: sel.doctor }) });
    const d = await res.json();
    setSaving(false);
    if (d.ok) { setDone(true); reload(); } else toast(d.error || "Booking failed", "error");
  }

  function reset() { setBooking(false); setStep(1); setDone(false); setSel({ department: "", doctor: "", date: "", time: "", symptoms: "", urgency: "Routine", patientName: "", patientAge: "21", patientGender: "Male", patientBloodType: "O+", patientPhone: "", patientEmail: "" }); }

  return (
    <Shell>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Appointments</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Calendar & smart booking</p>
        </div>
        <Button variant="mint" onClick={() => setBooking(true)}><Plus className="h-4 w-4" /> Book Appointment</Button>
      </div>

      <div className="card p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-[Poppins] font-bold text-navy dark:text-white">{month.toLocaleString("en", { month: "long", year: "numeric" })}</h2>
          <div className="flex gap-1">
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))} className="rounded-lg border border-navy/10 p-1.5 hover:bg-navy/5 dark:border-white/10"><ChevronLeft className="h-4 w-4" /></button>
            <button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))} className="rounded-lg border border-navy/10 p-1.5 hover:bg-navy/5 dark:border-white/10"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
        {loading ? <Skeleton className="h-96 w-full" /> : (
          <div className="grid grid-cols-7 gap-1.5">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="pb-2 text-center text-xs font-semibold text-slate-400">{d}</div>)}
            {days.map((d, i) => (
              <div key={i} className={`min-h-[92px] rounded-lg border p-1.5 ${!d ? "border-transparent" : d === todayStr ? "border-mint bg-mint/5" : "border-slate-100 dark:border-white/5"}`}>
                {d && (
                  <>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-semibold ${d === todayStr ? "text-mint" : "text-slate-500 dark:text-slate-300"}`}>{Number(d.slice(-2))}</span>
                      {d === todayStr && <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      {(apptsByDate[d] ?? []).slice(0, 2).map((a) => (
                        <div key={a.id} title={`${a.patientName} · ${a.time}`} className="truncate rounded px-1 py-0.5 text-[9px] font-medium text-white" style={{ background: DEPT_COLORS[a.department] }}>{a.time} {a.patientName.split(" ")[0]}</div>
                      ))}
                      {(apptsByDate[d]?.length ?? 0) > 2 && <div className="text-[9px] text-slate-400">+{apptsByDate[d].length - 2} more</div>}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Upcoming list */}
      <div className="card mt-5 p-5">
        <h2 className="mb-3 font-[Poppins] font-bold text-navy dark:text-white">All Appointments</h2>
        <div className="space-y-2">
          {(data?.appointments ?? []).slice(0, 10).map((a) => (
            <div key={a.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-100 p-3 dark:border-white/5">
              <span className="h-9 w-1 rounded-full" style={{ background: DEPT_COLORS[a.department] }} />
              <div className="flex-1"><div className="text-sm font-semibold text-navy dark:text-white">{a.patientName}</div><div className="text-xs text-slate-400">{a.department} · {a.doctorName}</div></div>
              <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{a.date} {a.time}</span>
              {a.urgency === "Emergency" && <Badge color="danger">Emergency</Badge>}
              <Badge color={statusColor(a.status)}>{a.status}</Badge>
            </div>
          ))}
        </div>
      </div>

      {/* Booking flow */}
      <Modal open={booking} onClose={reset} title={done ? "" : "Book Appointment"} wide>
        {done ? (
          <div className="flex flex-col items-center py-6 text-center animate-scale-in">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-mint/15"><CheckCircle2 className="h-9 w-9 text-mint" /></div>
            <h3 className="mt-3 font-[Poppins] text-xl font-bold text-navy dark:text-white">Appointment Confirmed!</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{sel.department} with {sel.doctor}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">{sel.date} at {sel.time}</p>
            <div className="my-4 grid h-32 w-32 place-items-center rounded-2xl border-2 border-dashed border-navy/20 dark:border-white/20"><QrCode className="h-16 w-16 text-navy dark:text-white" /></div>
            <p className="text-xs text-slate-400">Scan this QR code at the clinic reception</p>
            <Button className="mt-4" onClick={reset}>Done</Button>
          </div>
        ) : (
          <>
            <div className="mb-5 flex gap-1.5">{[1, 2, 3, 4, 5, 6].map((s) => <div key={s} className={`h-1.5 flex-1 rounded-full ${step >= s ? "bg-mint" : "bg-slate-200 dark:bg-white/10"}`} />)}</div>

            {step === 1 && (
              <div className="grid grid-cols-2 gap-3 animate-fade-up">
                {DEPTS.map((d) => (
                  <button key={d.name} onClick={() => { setSel({ ...sel, department: d.name }); setStep(2); }} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition-all hover:-translate-y-1 ${sel.department === d.name ? "border-mint bg-mint/5" : "border-slate-100 dark:border-white/10"}`}>
                    <div className="grid h-11 w-11 place-items-center rounded-xl" style={{ background: `${d.color}22` }}><d.icon className="h-5 w-5" style={{ color: d.color }} /></div>
                    <div><div className="font-semibold text-navy dark:text-white">{d.name}</div><div className="text-xs text-slate-400">{d.desc}</div></div>
                  </button>
                ))}
              </div>
            )}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-3 animate-fade-up">
                {DOCTORS.map((doc) => (
                  <button key={doc.name} onClick={() => { setSel({ ...sel, doctor: doc.name }); setStep(3); }} className={`flex items-center gap-3 rounded-xl border-2 p-4 text-left transition hover:-translate-y-1 ${sel.doctor === doc.name ? "border-mint bg-mint/5" : "border-slate-100 dark:border-white/10"}`}>
                    <div className="grid h-11 w-11 place-items-center rounded-full bg-gradient-to-br from-navy to-mint text-sm font-bold text-white">{doc.name.split(" ")[1][0]}</div>
                    <div><div className="text-sm font-semibold text-navy dark:text-white">{doc.name}</div><div className="text-xs text-slate-400">{doc.spec} · ⭐ {doc.rating}</div></div>
                  </button>
                ))}
              </div>
            )}
            {step === 3 && (
              <div className="animate-fade-up">
                <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Select Date</label>
                <input type="date" min={todayStr} value={sel.date} onChange={(e) => setSel({ ...sel, date: e.target.value })} className="mb-4 w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Available Slots {" "}<span className="text-mint">✦ Recommended (AI-optimized)</span></label>
                <div className="grid grid-cols-4 gap-2">
                  {SLOTS.map((t, i) => (
                    <button key={t} onClick={() => setSel({ ...sel, time: t })} className={`relative rounded-lg border py-2 text-sm font-medium transition ${sel.time === t ? "border-mint bg-mint text-white" : "border-slate-200 text-slate-600 hover:border-cyan dark:border-white/10 dark:text-slate-300"}`}>
                      {t}{i === 2 && <span className="absolute -right-1 -top-1 text-mint">✦</span>}
                    </button>
                  ))}
                </div>
              </div>
            )}
            {step === 4 && (
              <div className="animate-fade-up">
                <h4 className="mb-3 font-[Poppins] font-bold text-navy dark:text-white">Your Information</h4>
                <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">If you&apos;re a new patient, we&apos;ll automatically create your record. Existing patients will be matched by name.</p>
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Full Name *</label>
                    <input value={sel.patientName} onChange={(e) => setSel({ ...sel, patientName: e.target.value })} placeholder="e.g. Ahmad Firdaus" className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Age</label>
                    <input type="number" value={sel.patientAge} onChange={(e) => setSel({ ...sel, patientAge: e.target.value })} className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Gender</label>
                    <select value={sel.patientGender} onChange={(e) => setSel({ ...sel, patientGender: e.target.value })} className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white">
                      <option>Male</option><option>Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Blood Type</label>
                    <select value={sel.patientBloodType} onChange={(e) => setSel({ ...sel, patientBloodType: e.target.value })} className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white">
                      {["O+", "A+", "B+", "AB+", "O-", "A-", "B-", "AB-"].map((b) => <option key={b}>{b}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Phone</label>
                    <input value={sel.patientPhone} onChange={(e) => setSel({ ...sel, patientPhone: e.target.value })} placeholder="012-3456789" className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                  <div className="col-span-2">
                    <label className="mb-1 block text-xs font-semibold text-slate-500 dark:text-slate-400">Email</label>
                    <input value={sel.patientEmail} onChange={(e) => setSel({ ...sel, patientEmail: e.target.value })} placeholder="you@student.upnm.edu.my" className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                  </div>
                </div>
              </div>
            )}
            {step === 5 && (
              <div className="animate-fade-up">
                <label className="mb-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">Common Symptoms</label>
                <div className="mb-3 flex flex-wrap gap-2">
                  {symptomChips.map((c) => {
                    const on = sel.symptoms.includes(c);
                    return <button key={c} onClick={() => setSel({ ...sel, symptoms: on ? sel.symptoms.replace(c, "").replace(/, ,/g, ",").trim() : (sel.symptoms ? sel.symptoms + ", " + c : c) })} className={`rounded-full border px-3 py-1 text-xs font-medium transition ${on ? "border-mint bg-mint/10 text-mint" : "border-slate-200 text-slate-500 dark:border-white/10"}`}>{c}</button>;
                  })}
                </div>
                <textarea value={sel.symptoms} onChange={(e) => setSel({ ...sel, symptoms: e.target.value })} placeholder="Describe your symptoms…" rows={3} className="w-full rounded-lg border border-navy/10 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
                <label className="mb-1 mt-3 block text-xs font-semibold text-slate-500 dark:text-slate-400">Urgency Level</label>
                <div className="flex gap-2">{["Routine", "Soon", "Emergency"].map((u) => <button key={u} onClick={() => setSel({ ...sel, urgency: u })} className={`flex-1 rounded-lg border py-2 text-xs font-semibold transition ${sel.urgency === u ? "border-navy bg-navy text-white dark:border-cyan dark:bg-cyan/20" : "border-slate-200 text-slate-500 dark:border-white/10"}`}>{u}</button>)}</div>
              </div>
            )}
            {step === 6 && (
              <div className="animate-fade-up rounded-xl bg-slate-50 p-4 dark:bg-white/5">
                <h4 className="mb-3 font-semibold text-navy dark:text-white">Confirm your booking</h4>
                {[["Department", sel.department], ["Doctor", sel.doctor], ["Date & Time", `${sel.date || "—"} ${sel.time}`], ["Urgency", sel.urgency], ["Symptoms", sel.symptoms || "—"]].map(([k, v]) => (
                  <div key={k} className="flex justify-between border-b border-slate-100 py-2 text-sm last:border-0 dark:border-white/5"><span className="text-slate-400">{k}</span><span className="font-medium text-navy dark:text-white">{v}</span></div>
                ))}
                <div className="mt-3 flex items-center gap-2 text-xs text-slate-400"><input type="checkbox" defaultChecked /> Send email + WhatsApp reminder</div>
              </div>
            )}

            <div className="mt-6 flex justify-between">
              <Button variant="ghost" onClick={() => (step > 1 ? setStep(step - 1) : reset())}>{step > 1 ? "Back" : "Cancel"}</Button>
              {step < 6 ? (
                <Button disabled={(step === 1 && !sel.department) || (step === 2 && !sel.doctor) || (step === 3 && (!sel.date || !sel.time)) || (step === 4 && !sel.patientName.trim())} onClick={() => setStep(step + 1)}>Next →</Button>
              ) : (
                <Button variant="mint" loading={saving} onClick={confirm}>Confirm Booking</Button>
              )}
            </div>
          </>
        )}
      </Modal>
    </Shell>
  );
}
