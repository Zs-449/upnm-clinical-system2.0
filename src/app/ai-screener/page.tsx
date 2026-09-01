"use client";

import Shell from "@/components/Shell";
import { Send, User, Stethoscope, CalendarDays, Clock3, CheckCircle2, MapPin, CalendarPlus } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { getSession } from "@/lib/session";
import { toast } from "@/components/ui";
import { slotsForPeriod } from "@/lib/clinic";

interface Analysis { conditions: string[]; department: string; urgency: string; advice: string }
type Stage = "chat" | "askDate" | "askPeriod" | "askSlot" | "confirm";

interface Msg {
  id: string;
  role: "bot" | "user";
  text?: string;
  analysis?: Analysis;
  bookingChoice?: { resolved: boolean };
  dateHelp?: boolean;
  periodHelp?: boolean;
  slotOptions?: string[];
  summary?: { department: string; doctor: string; date: string; time: string };
  confirmed?: boolean;
  noFlow?: boolean;
}

const URGENCY_COLOR: Record<string, string> = { "Can wait": "#7a9e7e", "See doctor soon": "#d48040", Emergency: "#c25d5d" };
const QUICK = ["I feel sometimes hot and sometimes cold", "I have a fever and cough", "My tooth hurts badly", "I feel very anxious lately", "Sprained my ankle during training", "Stomach ache and nausea"];

function uid() {
  return Math.random().toString(36).slice(2);
}

function todayStr() {
  return new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kuala_Lumpur" })).toLocaleDateString("en-CA");
}

// Understands "today", "tomorrow", weekday names, and most typed date
// formats (e.g. "5 September", "2026-09-05"). Returns an ISO date string
// (>= today) or null if it couldn't confidently parse one.
function parseDateInput(raw: string): string | null {
  const t = raw.trim().toLowerCase();
  const tStr = todayStr();
  const today = new Date(`${tStr}T00:00:00`);
  if (!t) return null;
  if (t === "today") return tStr;
  if (t === "tomorrow" || t === "tmr" || t === "tmrw") {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d.toLocaleDateString("en-CA");
  }
  const weekdays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const wIdx = weekdays.findIndex((w) => t.includes(w));
  if (wIdx >= 0) {
    const d = new Date(today);
    let diff = (wIdx - d.getDay() + 7) % 7;
    if (diff === 0) diff = 7;
    d.setDate(d.getDate() + diff);
    return d.toLocaleDateString("en-CA");
  }
  const parsed = new Date(t);
  if (!isNaN(parsed.getTime())) {
    const iso = parsed.toLocaleDateString("en-CA");
    if (iso >= tStr) return iso;
  }
  return null;
}

function parsePeriodInput(raw: string): "morning" | "afternoon" | "any" | null {
  const t = raw.trim().toLowerCase();
  if (["morning", "am", "early"].some((w) => t.includes(w))) return "morning";
  if (["afternoon", "pm", "late"].some((w) => t.includes(w))) return "afternoon";
  if (["any", "anytime", "any time", "no preference", "doesn't matter", "whatever"].some((w) => t.includes(w))) return "any";
  return null;
}

export default function AiScreenerPage() {
  const [msgs, setMsgs] = useState<Msg[]>([
    { id: uid(), role: "bot", text: "Hi! I'm MediBot 🤖 — your UPNM health assistant. Tell me what symptoms you're experiencing, and I'll help guide you. This is not a medical diagnosis." },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  // MediBot conversation memory
  const [labels, setLabels] = useState<string[]>([]);
  const [lastAnalysis, setLastAnalysis] = useState<Analysis | null>(null);
  const [symptomText, setSymptomText] = useState("");
  const [stage, setStage] = useState<Stage>("chat");
  const [booking, setBooking] = useState<{ department: string; doctor: string; date: string; time: string }>({ department: "", doctor: "", date: "", time: "" });
  const [confirming, setConfirming] = useState(false);
  const [patientName, setPatientName] = useState("");

  useEffect(() => {
    const u = getSession();
    if (u) setPatientName(u.name);
  }, []);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  function pushBot(partial: Omit<Msg, "id" | "role">) {
    setMsgs((m) => [...m, { id: uid(), role: "bot", ...partial }]);
  }
  function pushUser(text: string) {
    setMsgs((m) => [...m, { id: uid(), role: "user", text }]);
  }
  function resolveBookingChoice(id: string) {
    setMsgs((m) => m.map((x) => (x.id === id ? { ...x, bookingChoice: { resolved: true } } : x)));
  }

  async function delay(ms: number) {
    return new Promise((res) => setTimeout(res, ms));
  }

  async function handleSymptomMessage(text: string) {
    pushUser(text);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/ai/symptom", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, previousLabels: labels }),
      });
      const data = await res.json();
      await delay(700);
      setTyping(false);
      pushBot({ text: data.reply, analysis: data.analysis ?? undefined });
      if (data.labels) setLabels(data.labels);
      setSymptomText((s) => (s ? `${s}; ${text}` : text));
      if (data.analysis) {
        setLastAnalysis(data.analysis);
        await delay(300);
        pushBot({ text: "Would you like me to help you arrange an appointment with a medical officer?", bookingChoice: { resolved: false } });
      }
    } catch {
      setTyping(false);
      pushBot({ text: "Sorry, I had trouble processing that. Please try again." });
    }
  }

  async function startBooking(promptId: string) {
    resolveBookingChoice(promptId);
    pushUser("Yes, help me book");
    const department = lastAnalysis?.department || "General";
    setBooking({ department, doctor: "", date: "", time: "" });
    setTyping(true);
    await delay(500);
    setTyping(false);
    pushBot({ text: "Sure. I'll help you arrange an appointment.\nWhat date would you prefer? (e.g. \"today\", \"tomorrow\", or a specific date)", dateHelp: true });
    setStage("askDate");
  }

  function declineBooking(promptId: string) {
    resolveBookingChoice(promptId);
    pushUser("No, I'll decide later");
    pushBot({ text: "No problem — whenever you're ready, you can book directly here.", noFlow: true });
  }

  async function handleDateReply(text: string) {
    pushUser(text);
    setInput("");
    const parsed = parseDateInput(text);
    if (!parsed) {
      setTyping(true);
      await delay(400);
      setTyping(false);
      pushBot({ text: "Sorry, I couldn't quite understand that date. Try \"today\", \"tomorrow\", or a date like 2026-09-05.", dateHelp: true });
      return;
    }
    setBooking((b) => ({ ...b, date: parsed }));
    setTyping(true);
    await delay(500);
    setTyping(false);
    pushBot({ text: `Got it — ${parsed}. What time would you prefer?`, periodHelp: true });
    setStage("askPeriod");
  }

  async function handlePeriodReply(text: string) {
    pushUser(text);
    setInput("");
    const period = parsePeriodInput(text) ?? "any";
    setTyping(true);
    await delay(500);
    await loadSlots(period);
  }

  async function loadSlots(period: "morning" | "afternoon" | "any") {
    const department = booking.department || lastAnalysis?.department || "General";
    let doctorName = booking.doctor;
    let available: string[] = [];
    try {
      const res = await fetch(`/api/appointments?available=1&date=${booking.date}&department=${encodeURIComponent(department)}`);
      const data = await res.json();
      const doctors = (data.doctors ?? []) as { name: string; slots: string[] }[];
      const doctor = doctors.find((item) => item.name === booking.doctor) ?? doctors[0];
      doctorName = doctor?.name ?? "";
      available = slotsForPeriod(period).filter((slot) => doctor?.slots.includes(slot));
      if (!booking.doctor && doctorName) setBooking((current) => ({ ...current, doctor: doctorName }));
    } catch {
      available = [];
    }
    setTyping(false);
    if (available.length === 0) {
      pushBot({ text: `${doctorName || "No Medical Officer"} has no available slots on ${booking.date}. Would you like to try a different date instead?`, dateHelp: true });
      setStage("askDate");
      return;
    }
    pushBot({ text: "Here are the available slots:", slotOptions: available });
    setStage("askSlot");
  }

  function pickSlot(time: string) {
    const department = booking.department || lastAnalysis?.department || "General";
    const doctor = booking.doctor;
    pushUser(time);
    setBooking((b) => ({ ...b, time }));
    pushBot({
      text: "Appointment Summary",
      summary: { department, doctor, date: booking.date, time },
    });
    setStage("confirm");
  }

  async function confirmAppointment() {
    const department = booking.department || lastAnalysis?.department || "General";
    const doctor = booking.doctor;
    setConfirming(true);
    try {
      const res = await fetch("/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientName,
          doctorName: doctor,
          department,
          date: booking.date,
          time: booking.time,
          symptoms: symptomText,
          urgency: lastAnalysis?.urgency === "Emergency" ? "Emergency" : "Routine",
        }),
      });
      const data = await res.json();
      setConfirming(false);
      if (!data.ok) {
        toast(data.error || "Booking failed", "error");
        pushBot({ text: `${data.error || "That slot is no longer available."} Let's try another time.`, slotOptions: undefined, dateHelp: true });
        setStage("askDate");
        return;
      }
      pushBot({ text: "Appointment confirmed successfully.", confirmed: true, summary: { department, doctor, date: booking.date, time: booking.time } });
      toast("Appointment confirmed!", "success");
      setStage("chat");
      setBooking({ department: "", doctor: "", date: "", time: "" });
    } catch {
      setConfirming(false);
      toast("Network error. Please try again.", "error");
    }
  }

  async function send(text: string) {
    if (!text.trim()) return;
    if (stage === "askDate") return handleDateReply(text);
    if (stage === "askPeriod") return handlePeriodReply(text);
    return handleSymptomMessage(text);
  }

  const placeholder =
    stage === "askDate" ? "e.g. tomorrow, or 2026-09-05…" : stage === "askPeriod" ? "e.g. morning, afternoon, any time…" : "Describe your symptoms…";

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">MediBot — AI Health Assistant</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Describe your symptoms — MediBot will suggest next steps and can book your appointment</p>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col card overflow-hidden" style={{ height: "72vh" }}>
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-navy to-[#2d5551] p-4 text-white dark:border-white/10">
          <div className="grid h-10 w-10 place-items-center overflow-hidden rounded-full bg-white/15"><img src="/images/upnm-clinic-bot-transparent.png" alt="MediBot" className="h-full w-full object-contain" /></div>
          <div><div className="font-bold">MediBot</div><div className="flex items-center gap-1 text-xs text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" /> Online</div></div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {msgs.map((m) => (
            <div key={m.id} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""} animate-fade-up`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === "bot" ? "bg-navy text-cyan" : "bg-mint text-white"}`}>{m.role === "bot" ? <img src="/images/upnm-clinic-bot-transparent.png" alt="MediBot" className="h-8 w-8 object-contain" /> : <User className="h-4 w-4" />}</div>
              <div className={`max-w-[82%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "bot" ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200" : "bg-mint text-white"}`}>
                {m.text && <p className="whitespace-pre-line">{m.text}</p>}

                {m.analysis && (
                  <div className="mt-3 space-y-2 rounded-xl bg-white p-3 dark:bg-[#0f1f1a]">
                    <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">Urgency</span><span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: URGENCY_COLOR[m.analysis.urgency] }}>{m.analysis.urgency}</span></div>
                    <div><span className="text-xs font-semibold text-slate-400">Possible explanations</span><div className="mt-1 flex flex-wrap gap-1">{m.analysis.conditions.map((c) => <span key={c} className="rounded-full bg-cyan/10 px-2 py-0.5 text-xs text-cyan-700 dark:text-cyan-300">{c}</span>)}</div></div>
                    <div className="flex items-center gap-1.5 text-xs text-navy dark:text-white"><Stethoscope className="h-3.5 w-3.5" /> Suggested department: <span className="font-bold">{m.analysis.department}</span></div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{m.analysis.advice}</p>
                  </div>
                )}

                {m.bookingChoice && (
                  <div className="mt-3 flex gap-2">
                    <button
                      disabled={m.bookingChoice.resolved}
                      onClick={() => startBooking(m.id)}
                      className="flex-1 rounded-lg bg-mint py-2 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-40"
                    >
                      Yes, help me book
                    </button>
                    <button
                      disabled={m.bookingChoice.resolved}
                      onClick={() => declineBooking(m.id)}
                      className="flex-1 rounded-lg border border-navy/15 py-2 text-xs font-semibold text-slate-600 transition hover:bg-navy/5 disabled:opacity-40 dark:border-white/15 dark:text-slate-300"
                    >
                      No, I&apos;ll decide later
                    </button>
                  </div>
                )}

                {m.noFlow && (
                  <Link href="/appointments" className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-navy py-2 text-xs font-semibold text-white dark:bg-cyan/20">
                    <CalendarPlus className="h-3.5 w-3.5" /> Book an Appointment
                  </Link>
                )}

                {m.dateHelp && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Today", "Tomorrow"].map((q) => (
                      <button key={q} onClick={() => handleDateReply(q)} className="rounded-full border border-navy/10 bg-white px-3 py-1 text-xs text-slate-600 hover:border-mint hover:text-mint dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <CalendarDays className="mr-1 inline h-3 w-3" />{q}
                      </button>
                    ))}
                  </div>
                )}

                {m.periodHelp && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {["Morning", "Afternoon", "Any time"].map((q) => (
                      <button key={q} onClick={() => handlePeriodReply(q)} className="rounded-full border border-navy/10 bg-white px-3 py-1 text-xs text-slate-600 hover:border-mint hover:text-mint dark:border-white/10 dark:bg-white/5 dark:text-slate-300">
                        <Clock3 className="mr-1 inline h-3 w-3" />{q}
                      </button>
                    ))}
                  </div>
                )}

                {m.slotOptions && (
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {m.slotOptions.map((t) => (
                      <button key={t} onClick={() => pickSlot(t)} className="rounded-lg border border-navy/10 bg-white px-2 py-1.5 text-xs font-semibold text-navy transition hover:border-mint hover:text-mint dark:border-white/10 dark:bg-white/5 dark:text-white">
                        {t}
                      </button>
                    ))}
                  </div>
                )}

                {m.summary && (
                  <div className="mt-3 space-y-2 rounded-xl bg-white p-3 dark:bg-[#0f1f1a]">
                    {[["Date", m.summary.date], ["Time", m.summary.time], ["Medical Officer", m.summary.doctor], ["Clinic", `UPNM Health Centre · ${m.summary.department}`]].map(([k, v]) => (
                      <div key={k} className="flex justify-between text-xs"><span className="text-slate-400">{k}</span><span className="font-semibold text-navy dark:text-white">{v}</span></div>
                    ))}
                    {!m.confirmed && stage === "confirm" && (
                      <button onClick={confirmAppointment} disabled={confirming} className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg bg-mint py-2 text-xs font-semibold text-white transition hover:brightness-95 disabled:opacity-60">
                        {confirming ? "Confirming…" : "Confirm Appointment"}
                      </button>
                    )}
                    {m.confirmed && (
                      <Link href="/appointments" className="mt-1 flex items-center justify-center gap-1.5 rounded-lg bg-navy py-2 text-xs font-semibold text-white dark:bg-cyan/20">
                        <MapPin className="h-3.5 w-3.5" /> View my appointments
                      </Link>
                    )}
                  </div>
                )}

                {m.confirmed && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-mint"><CheckCircle2 className="h-3.5 w-3.5" /> Confirmed</div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2 animate-fade-in">
              <div className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-navy"><img src="/images/upnm-clinic-bot-transparent.png" alt="MediBot is typing" className="h-full w-full object-contain" /></div>
              <div className="flex items-center gap-1 rounded-2xl bg-slate-100 px-4 py-3 dark:bg-white/10">{[0, 1, 2].map((i) => <span key={i} className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>
            </div>
          )}
          <div ref={endRef} />
        </div>

        <div className="border-t border-slate-100 p-3 dark:border-white/10">
          {msgs.length <= 1 && (
            <div className="mb-2 flex flex-wrap gap-1.5">{QUICK.map((q) => <button key={q} onClick={() => send(q)} className="rounded-full border border-navy/10 px-3 py-1 text-xs text-slate-500 transition hover:border-mint hover:text-mint dark:border-white/10">{q}</button>)}</div>
          )}
          <div className="flex gap-2">
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder={placeholder} className="flex-1 rounded-xl border border-navy/10 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <button onClick={() => send(input)} className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-white transition hover:brightness-95"><Send className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
