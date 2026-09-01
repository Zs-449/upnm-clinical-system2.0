"use client";

import { useState } from "react";
import { Bot, Check, ChevronDown, Loader2, MessageCircle, Send, X } from "lucide-react";
import { toast } from "@/components/ui";

type Item = { id: number; name: string; stock: number; minStock: number; unit?: string | null };
type Message = { from: "assistant" | "admin"; text: string; action?: { type: "add-stock"; item: Item } };

const quickActions = ["Check low stock", "Medication operations", "Doctor availability", "Today's appointments"];

export default function CareOpsAssistant() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<Message[]>([{ from: "assistant", text: "How can I assist you today?" }]);
  const [pending, setPending] = useState<Item | null>(null);
  const [amount, setAmount] = useState("");

  async function ask(nextQuery: string) {
    if (!nextQuery.trim() || busy) return;
    setQuery("");
    setMessages((current) => [...current, { from: "admin", text: nextQuery }]);
    setBusy(true);
    try {
      const response = await fetch("/api/ai/careops", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query: nextQuery }) });
      const data = await response.json();
      setMessages((current) => [...current, { from: "assistant", text: data.ok ? data.text : data.error ?? "I could not complete that request." }]);
      if (data.action?.type === "add-stock") setPending(data.action.item);
    } catch {
      setMessages((current) => [...current, { from: "assistant", text: "I could not reach the clinic operations service." }]);
    } finally { setBusy(false); }
  }

  async function updateStock() {
    if (!pending || !amount) return;
    setBusy(true);
    try {
      const response = await fetch("/api/inventory", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: pending.id, add: Number(amount) }) });
      const data = await response.json();
      if (!data.ok) throw new Error(data.error);
      setMessages((current) => [...current, { from: "assistant", text: `Stock updated successfully.\n\n${pending.name}\n${pending.stock} → ${data.inventory.stock} ${data.inventory.unit ?? "units"}` }]);
      setPending(null); setAmount(""); toast("Inventory updated successfully", "success");
    } catch (error) { toast(error instanceof Error ? error.message : "Unable to update stock", "error"); }
    finally { setBusy(false); }
  }

  return <div className="fixed bottom-4 right-4 z-30 sm:bottom-6 sm:right-6">
    {open && <div className="mb-3 w-[min(calc(100vw-2rem),360px)] overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-2xl shadow-navy/20 animate-scale-in dark:border-white/10 dark:bg-[#1a2b25]">
      <div className="flex items-center justify-between bg-navy px-4 py-3 text-white"><div className="flex items-center gap-2"><div className="grid h-8 w-8 place-items-center rounded-xl bg-white/10"><Bot className="h-4 w-4 text-cyan" /></div><div><div className="text-sm font-bold">CareOps Assistant</div><div className="text-[10px] text-white/60">Operational support · live data</div></div></div><button aria-label="Minimize CareOps Assistant" onClick={() => setOpen(false)} className="rounded-lg p-1.5 text-white/60 hover:bg-white/10 hover:text-white"><ChevronDown className="h-4 w-4" /></button></div>
      <div className="max-h-72 space-y-2 overflow-y-auto p-3">{messages.map((message, index) => <div key={index} className={`flex ${message.from === "admin" ? "justify-end" : "justify-start"}`}><div className={`max-w-[88%] whitespace-pre-line rounded-2xl px-3 py-2 text-xs leading-relaxed ${message.from === "admin" ? "rounded-br-md bg-mint text-white" : "rounded-bl-md bg-slate-100 text-slate-700 dark:bg-white/10 dark:text-slate-200"}`}>{message.text}</div></div>)}{busy && <div className="flex items-center gap-2 px-2 text-xs text-slate-400"><Loader2 className="h-3.5 w-3.5 animate-spin" /> Checking clinic data…</div>}</div>
      {pending && <div className="border-t border-slate-100 bg-amber/5 p-3 dark:border-white/10"><label className="mb-1 block text-[11px] font-semibold text-slate-600 dark:text-slate-300">Add stock to {pending.name}</label><div className="flex gap-2"><input autoFocus type="number" min="1" value={amount} onChange={(event) => setAmount(event.target.value)} placeholder="Quantity" className="min-w-0 flex-1 rounded-lg border border-navy/10 bg-white px-2.5 py-2 text-xs outline-none focus:border-mint dark:border-white/10 dark:bg-white/5 dark:text-white" /><button onClick={updateStock} disabled={busy || !amount} className="rounded-lg bg-navy px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"><Check className="mr-1 inline h-3.5 w-3.5" />Confirm</button></div></div>}
      <div className="border-t border-slate-100 p-3 dark:border-white/10"><div className="mb-2 flex flex-wrap gap-1.5">{quickActions.map((action) => <button key={action} onClick={() => ask(action)} className="rounded-full border border-mint/25 bg-mint/5 px-2.5 py-1.5 text-[10px] font-semibold text-mint transition hover:bg-mint/15">{action}</button>)}</div><form onSubmit={(event) => { event.preventDefault(); void ask(query); }} className="flex gap-2"><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Ask about clinic operations…" className="min-w-0 flex-1 rounded-xl border border-navy/10 bg-slate-50 px-3 py-2 text-xs outline-none focus:border-mint dark:border-white/10 dark:bg-white/5 dark:text-white" /><button aria-label="Send message" className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-navy text-white transition hover:bg-navy-light disabled:opacity-50" disabled={busy || !query.trim()}><Send className="h-3.5 w-3.5" /></button></form></div>
    </div>}
    <button onClick={() => setOpen((value) => !value)} aria-label={open ? "Close CareOps Assistant" : "Open CareOps Assistant"} className={`group ml-auto flex items-center gap-2 rounded-full bg-navy px-3.5 py-3 text-xs font-bold text-white shadow-xl shadow-navy/25 transition hover:-translate-y-1 hover:bg-navy-light ${open ? "hidden" : ""}`}><span className="grid h-7 w-7 place-items-center rounded-full bg-cyan/20"><MessageCircle className="h-4 w-4 text-cyan" /></span><span className="hidden sm:inline">CareOps AI</span></button>
  </div>;
}
