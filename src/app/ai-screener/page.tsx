"use client";

import Shell from "@/components/Shell";
import { Bot, Send, User, Stethoscope } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";

interface Msg { role: "bot" | "user"; text: string; analysis?: Analysis }
interface Analysis { conditions: string[]; department: string; urgency: string; advice: string }

const URGENCY_COLOR: Record<string, string> = { "Can wait": "#7a9e7e", "See doctor soon": "#d48040", Emergency: "#c25d5d" };
const QUICK = ["I have a fever and cough", "My tooth hurts badly", "I feel very anxious lately", "Sprained my ankle during training", "Stomach ache and nausea"];

export default function AiScreenerPage() {
  const [msgs, setMsgs] = useState<Msg[]>([{ role: "bot", text: "Hi! I'm MediBot 🤖 — your UPNM health assistant. Tell me what symptoms you're experiencing, and I'll help guide you. (This is not a medical diagnosis.)" }]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [msgs, typing]);

  async function send(text: string) {
    if (!text.trim()) return;
    setMsgs((m) => [...m, { role: "user", text }]);
    setInput("");
    setTyping(true);
    try {
      const res = await fetch("/api/ai/symptom", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ message: text }) });
      const data = await res.json();
      setTimeout(() => {
        setTyping(false);
        setMsgs((m) => [...m, { role: "bot", text: data.reply, analysis: data.analysis }]);
      }, 900);
    } catch {
      setTyping(false);
      setMsgs((m) => [...m, { role: "bot", text: "Sorry, I had trouble processing that. Please try again." }]);
    }
  }

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">AI Symptom Pre-Screener</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Describe your symptoms — MediBot will suggest next steps</p>
      </div>

      <div className="mx-auto flex max-w-2xl flex-col card overflow-hidden" style={{ height: "70vh" }}>
        <div className="flex items-center gap-3 border-b border-slate-100 bg-gradient-to-r from-navy to-[#2d5551] p-4 text-white dark:border-white/10">
          <div className="grid h-10 w-10 place-items-center rounded-full bg-white/15"><Bot className="h-6 w-6 text-cyan" /></div>
          <div><div className="font-bold">MediBot</div><div className="flex items-center gap-1 text-xs text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" /> Online</div></div>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">
          {msgs.map((m, i) => (
            <div key={i} className={`flex gap-2 ${m.role === "user" ? "flex-row-reverse" : ""} animate-fade-up`}>
              <div className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${m.role === "bot" ? "bg-navy text-cyan" : "bg-mint text-white"}`}>{m.role === "bot" ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}</div>
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${m.role === "bot" ? "bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200" : "bg-mint text-white"}`}>
                {m.text}
                {m.analysis && (
                  <div className="mt-3 space-y-2 rounded-xl bg-white p-3 dark:bg-[#0f1f1a]">
                    <div className="flex items-center justify-between"><span className="text-xs font-semibold text-slate-400">Urgency</span><span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: URGENCY_COLOR[m.analysis.urgency] }}>{m.analysis.urgency}</span></div>
                    <div><span className="text-xs font-semibold text-slate-400">Possible conditions</span><div className="mt-1 flex flex-wrap gap-1">{m.analysis.conditions.map((c) => <span key={c} className="rounded-full bg-cyan/10 px-2 py-0.5 text-xs text-cyan-700 dark:text-cyan-300">{c}</span>)}</div></div>
                    <div className="flex items-center gap-1.5 text-xs text-navy dark:text-white"><Stethoscope className="h-3.5 w-3.5" /> Recommended: <span className="font-bold">{m.analysis.department}</span></div>
                    <Link href="/appointments" className="mt-1 block rounded-lg bg-navy py-2 text-center text-xs font-semibold text-white">Book {m.analysis.department} appointment →</Link>
                  </div>
                )}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex gap-2 animate-fade-in">
              <div className="grid h-8 w-8 place-items-center rounded-full bg-navy text-cyan"><Bot className="h-4 w-4" /></div>
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
            <input value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send(input)} placeholder="Describe your symptoms…" className="flex-1 rounded-xl border border-navy/10 bg-slate-50 px-4 py-2.5 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
            <button onClick={() => send(input)} className="grid h-11 w-11 place-items-center rounded-xl bg-mint text-white transition hover:brightness-95"><Send className="h-5 w-5" /></button>
          </div>
        </div>
      </div>
    </Shell>
  );
}
