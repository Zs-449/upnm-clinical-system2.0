"use client";

import Shell from "@/components/Shell";
import { useApi } from "@/lib/useApi";
import { Badge, statusColor, Button, Skeleton } from "@/components/ui";
import { getSession } from "@/lib/session";
import { FileText, Download, Calendar, User, Stethoscope, ShieldCheck, Plus } from "lucide-react";
import { useEffect, useState } from "react";

interface MC {
  id: number;
  patientName: string;
  patientCode: string;
  doctorName: string;
  diagnosis: string;
  reason: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  certificateNo: string;
  createdAt: string;
}

export default function MCPage() {
  const { data, loading } = useApi<{ certificates: MC[] }>("/api/medical-certificates");
  const [selected, setSelected] = useState<MC | null>(null);
  const [name, setName] = useState("Cadet");

  useEffect(() => {
    const u = getSession();
    if (u) setName(u.name);
  }, []);

  const certs = data?.certificates ?? [];
  const activeCerts = certs.filter((c) => c.status === "Active");
  const expiredCerts = certs.filter((c) => c.status !== "Active");

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Medical Certificates</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">Your issued MCs and sick leave records</p>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="card-premium lift p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-mint/15">
              <ShieldCheck className="h-6 w-6 text-mint" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Active MCs</div>
              <div className="font-mono text-2xl font-extrabold text-navy dark:text-white">{activeCerts.length}</div>
            </div>
          </div>
        </div>
        <div className="card-premium lift p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-amber/20">
              <Calendar className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Days Taken</div>
              <div className="font-mono text-2xl font-extrabold text-navy dark:text-white">{certs.reduce((s, c) => s + c.days, 0)}</div>
            </div>
          </div>
        </div>
        <div className="card-premium lift p-5">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-cyan/15">
              <FileText className="h-6 w-6 text-cyan" />
            </div>
            <div>
              <div className="text-xs text-slate-400">Total Certificates</div>
              <div className="font-mono text-2xl font-extrabold text-navy dark:text-white">{certs.length}</div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">{[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}</div>
      ) : certs.length === 0 ? (
        <div className="card-premium flex flex-col items-center justify-center py-16">
          <div className="grid h-16 w-16 place-items-center rounded-2xl bg-slate-100 text-3xl dark:bg-white/10">📄</div>
          <h3 className="mt-4 font-[Poppins] text-lg font-bold text-navy dark:text-white">No certificates yet</h3>
          <p className="mt-1 text-sm text-slate-400">You haven&apos;t been issued any MCs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Active MCs */}
          {activeCerts.length > 0 && (
            <div>
              <h2 className="mb-3 font-[Poppins] text-lg font-bold text-navy dark:text-white">Active Certificates</h2>
              <div className="space-y-3">
                {activeCerts.map((mc) => (
                  <div key={mc.id} className="card-premium lift cursor-pointer p-5" onClick={() => setSelected(mc)}>
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-4">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-gradient-to-br from-mint to-cyan">
                          <ShieldCheck className="h-6 w-6 text-navy" />
                        </div>
                        <div>
                          <div className="font-mono text-xs text-slate-400">{mc.certificateNo}</div>
                          <div className="mt-1 font-semibold text-navy dark:text-white">{mc.diagnosis}</div>
                          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">Issued by {mc.doctorName}</div>
                        </div>
                      </div>
                      <Badge color="mint">Active</Badge>
                    </div>
                    <div className="mt-4 grid grid-cols-3 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-white/5">
                      <div>
                        <div className="text-slate-400">From</div>
                        <div className="font-mono font-semibold text-navy dark:text-white">{mc.startDate}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">To</div>
                        <div className="font-mono font-semibold text-navy dark:text-white">{mc.endDate}</div>
                      </div>
                      <div>
                        <div className="text-slate-400">Days</div>
                        <div className="font-mono font-semibold text-mint">{mc.days} day{mc.days > 1 ? "s" : ""}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Expired MCs */}
          {expiredCerts.length > 0 && (
            <div>
              <h2 className="mb-3 font-[Poppins] text-lg font-bold text-navy dark:text-white">Past Certificates</h2>
              <div className="space-y-3">
                {expiredCerts.map((mc) => (
                  <div key={mc.id} className="card lift cursor-pointer p-4 opacity-80" onClick={() => setSelected(mc)}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="grid h-10 w-10 place-items-center rounded-lg bg-slate-100 dark:bg-white/10">
                          <FileText className="h-5 w-5 text-slate-400" />
                        </div>
                        <div>
                          <div className="font-mono text-[10px] text-slate-400">{mc.certificateNo}</div>
                          <div className="text-sm font-semibold text-navy dark:text-white">{mc.diagnosis}</div>
                          <div className="text-xs text-slate-400">{mc.startDate} → {mc.endDate} ({mc.days}d)</div>
                        </div>
                      </div>
                      <Badge color="gray">Expired</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* MC Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="card-premium w-full max-w-2xl p-6 animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <div className="mb-5 flex items-start justify-between">
              <div>
                <div className="font-mono text-xs text-slate-400">{selected.certificateNo}</div>
                <h2 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">Medical Certificate</h2>
              </div>
              <button onClick={() => setSelected(null)} className="rounded-lg p-2 hover:bg-slate-100 dark:hover:bg-white/10">✕</button>
            </div>

            <div className="space-y-4">
              <div className="rounded-xl bg-gradient-to-br from-navy to-[#2d5551] p-5 text-white">
                <div className="mb-3 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-cyan" />
                  <span className="text-xs font-bold uppercase tracking-widest text-cyan">UPNM Health Centre</span>
                </div>
                <div className="font-[Poppins] text-lg font-bold">This is to certify that</div>
                <div className="mt-1 font-[Poppins] text-2xl font-extrabold text-cyan">{selected.patientName}</div>
                <div className="mt-1 font-mono text-sm text-white/60">{selected.patientCode}</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Diagnosis</div>
                  <div className="mt-1 text-sm font-semibold text-navy dark:text-white">{selected.diagnosis}</div>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Issued By</div>
                  <div className="mt-1 flex items-center gap-1.5 text-sm font-semibold text-navy dark:text-white">
                    <Stethoscope className="h-3.5 w-3.5 text-mint" /> {selected.doctorName}
                  </div>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valid From</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-navy dark:text-white">{selected.startDate}</div>
                </div>
                <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Valid Until</div>
                  <div className="mt-1 font-mono text-sm font-semibold text-navy dark:text-white">{selected.endDate}</div>
                </div>
              </div>

              <div className="rounded-xl border border-slate-100 p-3 dark:border-white/10">
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Reason</div>
                <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">{selected.reason}</div>
              </div>

              <div className="rounded-xl bg-mint/10 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-navy dark:text-white">Duration</span>
                  <span className="font-mono text-2xl font-extrabold text-mint">{selected.days} day{selected.days > 1 ? "s" : ""}</span>
                </div>
              </div>
            </div>

            <div className="mt-5 flex gap-2">
              <Button variant="mint" onClick={() => window.print()}>
                <Download className="h-4 w-4" /> Download PDF
              </Button>
              <Button variant="ghost" onClick={() => setSelected(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </Shell>
  );
}
