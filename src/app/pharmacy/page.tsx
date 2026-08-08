"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Badge, statusColor, Button, Skeleton, toast } from "@/components/ui";
import CardTimeMachine, { type TimelineItem } from "@/components/CardTimeMachine";
import { Pill, Package, AlertTriangle, CheckCircle2, Search } from "lucide-react";
import { useState } from "react";

// Timeline card colors, cycled per real dispensing-history entry (purely
// cosmetic — not tied to any specific medicine).
const HISTORY_GRADIENTS: [string, string][] = [
  ["#7a9e7e", "#5f8563"],
  ["#a8825a", "#c9955a"],
  ["#d48040", "#b87a32"],
  ["#1f3d3a", "#2d5551"],
  ["#c25d5d", "#9c4848"],
];

interface Rx { id: number; patientName: string; doctorName: string; medications: { name: string; dose: string; freq: string; duration: string; quantity?: number }[]; status: string; }
interface Inv { id: number; name: string; category: string; stock: number; minStock: number; unit: string | null; }
interface Activity { id: number; patientName: string; action: string; urgency: string | null; createdAt: string; }

function relativeDay(iso: string): string {
  const days = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000);
  if (days <= 0) return "Today";
  if (days === 1) return "1 day ago";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} week${Math.floor(days / 7) > 1 ? "s" : ""} ago`;
  return `${Math.floor(days / 30)} month${Math.floor(days / 30) > 1 ? "s" : ""} ago`;
}

// Builds real timeline entries from actual dispense/collect activity log
// rows (see /api/prescriptions PATCH) instead of hardcoded sample data.
function toTimeline(rows: Activity[]): TimelineItem[] {
  return rows
    .filter((a) => /^medication (dispensing started|collected by patient)/.test(a.action))
    .slice(0, 8)
    .map((a, i) => {
      const isCollected = a.action.startsWith("medication collected");
      const rxMatch = a.action.match(/Rx #(\d+)/);
      const medsMatch = a.action.match(/— (.+?) \(Dr\./);
      const time = new Date(a.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      return {
        date: relativeDay(a.createdAt),
        label: isCollected ? `Rx #${rxMatch?.[1] ?? "?"} collected` : (medsMatch?.[1].split(",")[0].trim() ?? `Rx #${rxMatch?.[1] ?? "?"}`),
        icon: "pill" as const,
        gradient: HISTORY_GRADIENTS[i % HISTORY_GRADIENTS.length],
        subtitle: isCollected ? `Collected by ${a.patientName}` : `Dispensed to ${a.patientName}`,
        meta: `${time}${!isCollected && medsMatch ? " · " + medsMatch[1] : ""}`,
      };
    });
}

export default function PharmacyPage() {
  const { data: rd, loading: rl, reload } = useApi<{ prescriptions: Rx[] }>("/api/prescriptions");
  const { data: id, loading: il } = useApi<{ inventory: Inv[] }>("/api/inventory");
  const { data: ad } = useApi<{ activities: Activity[] }>("/api/activities");
  const [tab, setTab] = useState<"queue" | "inventory">("queue");
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<number | null>(null);

  const dispenseHistory = toTimeline(ad?.activities ?? []);

  async function advance(rx: Rx) {
    const next = rx.status === "Pending" ? "Dispensing" : "Collected";
    setBusyId(rx.id);
    try {
      const res = await fetch("/api/prescriptions", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: rx.id, status: next }) });
      const result = await res.json();
      if (!result.ok) {
        toast(result.error || "Unable to update this prescription.", "error");
      } else {
        toast(next === "Dispensing" ? "Dispensing started successfully." : `Prescription #${rx.id} → Collected`);
      }
    } catch {
      toast("Network error — could not reach the pharmacy service.", "error");
    } finally {
      setBusyId(null);
      // Always resync with the real database state, whether the request
      // succeeded or failed, so the UI never trusts optimistic local state.
      reload();
    }
  }

  const lowStock = (id?.inventory ?? []).filter((i) => i.stock < i.minStock);
  const invFiltered = (id?.inventory ?? []).filter((i) => i.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Pharmacy Module</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Dispensing queue & inventory control</p>
      </div>

      {lowStock.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-3 rounded-xl border border-amber/40 bg-amber/10 p-4 animate-slide-right">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <span className="text-sm font-semibold text-amber-700">{lowStock.length} items below minimum stock:</span>
          {lowStock.map((i) => <Badge key={i.id} color="amber">{i.name} ({i.stock})</Badge>)}
        </div>
      )}

      {/* Dispensing History — Time Machine (built from real activity log entries) */}
      {dispenseHistory.length > 0 ? (
        <div className="mb-5">
          <CardTimeMachine items={dispenseHistory} />
        </div>
      ) : (
        <div className="card mb-5 p-5 text-center text-sm text-slate-400">No dispensing activity recorded yet.</div>
      )}

      <div className="mb-5 flex gap-1 rounded-lg bg-slate-100 p-0.5 dark:bg-white/5 w-fit">
        {(["queue", "inventory"] as const).map((t) => (
          <button key={t} onClick={() => setTab(t)} className={`flex items-center gap-1.5 rounded-md px-4 py-2 text-sm font-semibold capitalize transition ${tab === t ? "bg-white text-navy shadow dark:bg-navy dark:text-white" : "text-slate-400"}`}>
            {t === "queue" ? <Pill className="h-4 w-4" /> : <Package className="h-4 w-4" />}{t}
          </button>
        ))}
      </div>

      {tab === "queue" ? (
        rl ? <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-48" />)}</div> : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(rd?.prescriptions ?? []).map((rx, i) => (
              <div key={rx.id} className="card p-5 animate-fade-up" style={{ animationDelay: `${i * 40}ms` }}>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-sm font-bold text-navy dark:text-cyan">Rx #{rx.id}</span>
                  <Badge color={statusColor(rx.status)}>{rx.status}</Badge>
                </div>
                <div className="mt-2 font-semibold text-navy dark:text-white">{rx.patientName}</div>
                <div className="text-xs text-slate-400">{rx.doctorName}</div>
                <ul className="mt-3 space-y-1 text-xs text-slate-500 dark:text-slate-400">
                  {rx.medications.map((m, j) => <li key={j}>💊 {m.name} — {m.dose} {m.freq}</li>)}
                </ul>
                {rx.status !== "Collected" ? (
                  <Button variant="mint" className="mt-4 w-full" disabled={busyId === rx.id} onClick={() => advance(rx)}>
                    {busyId === rx.id ? "Please wait…" : rx.status === "Pending" ? "Start Dispensing" : "Mark Collected"}
                  </Button>
                ) : (
                  <div className="mt-4 flex items-center justify-center gap-1 rounded-lg bg-mint/10 py-2 text-sm font-semibold text-mint"><CheckCircle2 className="h-4 w-4" /> Collected</div>
                )}
              </div>
            ))}
          </div>
        )
      ) : (
        <div className="card p-5">
          <div className="relative mb-4 max-w-xs">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search medication…" className="w-full rounded-lg border border-navy/10 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none focus:border-cyan dark:border-white/10 dark:bg-white/5 dark:text-white" />
          </div>
          {il ? <Skeleton className="h-64 w-full" /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase text-slate-400"><tr>{["Medication", "Category", "Stock Level", "Status"].map((h) => <th key={h} className="py-2">{h}</th>)}</tr></thead>
                <tbody>
                  {invFiltered.map((i) => {
                    const pct = Math.min((i.stock / (i.minStock * 2.5)) * 100, 100);
                    const low = i.stock < i.minStock;
                    return (
                      <tr key={i.id} className="border-t border-slate-100 dark:border-white/5">
                        <td className="py-3 font-semibold text-navy dark:text-white">{i.name}</td>
                        <td className="py-3 text-slate-400">{i.category}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-2">
                            <div className="h-2 w-28 rounded-full bg-slate-200 dark:bg-white/10"><div className="h-full rounded-full" style={{ width: `${pct}%`, background: low ? "#c25d5d" : pct < 50 ? "#d48040" : "#7a9e7e" }} /></div>
                            <span className="font-mono text-xs">{i.stock} {i.unit}</span>
                          </div>
                        </td>
                        <td className="py-3"><Badge color={low ? "danger" : "mint"}>{low ? "Low Stock" : "In Stock"}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </Shell>
  );
}
