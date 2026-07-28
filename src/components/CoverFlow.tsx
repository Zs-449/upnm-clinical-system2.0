"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, FileText, FlaskConical, Pill, ClipboardList, HeartPulse, ScanLine, ShieldCheck, Activity } from "lucide-react";

export interface CoverFlowItem {
  label: string;
  tag: string;
  icon: "file" | "flask" | "pill" | "clipboard" | "heart" | "scan" | "shield" | "activity";
  gradient: [string, string];
  sublabel?: string;
}

const ICONS: Record<CoverFlowItem["icon"], typeof FileText> = {
  file: FileText, flask: FlaskConical, pill: Pill, clipboard: ClipboardList,
  heart: HeartPulse, scan: ScanLine, shield: ShieldCheck, activity: Activity,
};

export const MEDICAL_DOCS: CoverFlowItem[] = [
  { label: "Blood Test — CBC", tag: "LAB", icon: "flask", gradient: ["#1f3d3a", "#2d5551"], sublabel: "20 Jul 2026" },
  { label: "Chest X-Ray", tag: "IMG", icon: "scan", gradient: ["#a8825a", "#c9955a"], sublabel: "18 Jul 2026" },
  { label: "Prescription — Amoxicillin", tag: "RX", icon: "pill", gradient: ["#7a9e7e", "#5f8563"], sublabel: "19 Jul 2026" },
  { label: "Referral Letter", tag: "DOC", icon: "clipboard", gradient: ["#b87a32", "#d48040"], sublabel: "15 Jul 2026" },
  { label: "Vaccination Record", tag: "PDF", icon: "shield", gradient: ["#9c4848", "#c25d5d"], sublabel: "01 Jun 2026" },
  { label: "Vitals Trend", tag: "LOG", icon: "activity", gradient: ["#8a6b4a", "#a88c6a"], sublabel: "Live" },
];

export const QUICK_ACTIONS: CoverFlowItem[] = [
  { label: "Schedule Visit", tag: "NEW", icon: "clipboard", gradient: ["#7a9e7e", "#5f8563"] },
  { label: "My Patients", tag: "VIEW", icon: "heart", gradient: ["#1f3d3a", "#2d5551"] },
  { label: "Medical Records", tag: "OPEN", icon: "file", gradient: ["#a8825a", "#c9955a"] },
  { label: "Lab Results", tag: "VIEW", icon: "flask", gradient: ["#d48040", "#b87a32"] },
  { label: "Pharmacy", tag: "GO", icon: "pill", gradient: ["#c25d5d", "#9c4848"] },
  { label: "Analytics", tag: "INSIGHT", icon: "activity", gradient: ["#8a6b4a", "#a88c6a"] },
];

export const REPORT_CATEGORIES: CoverFlowItem[] = [
  { label: "Patient Volume", tag: "LINE", icon: "activity", gradient: ["#c9955a", "#a8825a"] },
  { label: "Department Stats", tag: "BAR", icon: "clipboard", gradient: ["#1f3d3a", "#2d5551"] },
  { label: "Diagnosis Mix", tag: "DONUT", icon: "flask", gradient: ["#7a9e7e", "#5f8563"] },
  { label: "Outbreak Monitor", tag: "HEAT", icon: "shield", gradient: ["#c25d5d", "#9c4848"] },
  { label: "Satisfaction", tag: "KPI", icon: "heart", gradient: ["#d48040", "#b87a32"] },
];

export default function CoverFlow({
  items = MEDICAL_DOCS,
  height = 200,
}: {
  items?: CoverFlowItem[];
  height?: number;
}) {
  const [active, setActive] = useState(Math.floor(items.length / 2));

  const go = (i: number) => setActive(Math.max(0, Math.min(items.length - 1, i)));

  return (
    <div className="relative w-full select-none overflow-hidden rounded-2xl" style={{ perspective: 1200, height }}>
      <div className="relative mx-auto flex h-full items-center justify-center" style={{ transformStyle: "preserve-3d" }}>
        {items.map((item, i) => {
          const offset = i - active;
          const abs = Math.abs(offset);
          const Icon = ICONS[item.icon];
          const isActive = i === active;
          return (
            <button
              key={i}
              onClick={() => go(i)}
              className="absolute flex aspect-[3/4] w-[110px] cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl p-3 text-white transition-all duration-500"
              style={{
                background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                transform: `translateX(${offset * 68}px) translateZ(${isActive ? 50 : -abs * 60}px) rotateY(${offset === 0 ? 0 : offset < 0 ? 36 : -36}deg) scale(${isActive ? 1.08 : Math.max(0.7, 1 - abs * 0.1)})`,
                opacity: abs > 2 ? 0 : 1 - abs * 0.28,
                zIndex: 100 - abs,
                transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
                boxShadow: isActive ? "0 25px 50px -12px rgba(0,0,0,0.4)" : "0 10px 30px -10px rgba(0,0,0,0.3)",
              }}
            >
              <Icon className="h-7 w-7" style={{ filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.3))" }} />
              <span className="text-[10px] font-bold tracking-wider opacity-90">{item.tag}</span>
            </button>
          );
        })}
      </div>

      {/* label */}
      <div className="pointer-events-none absolute bottom-0 left-0 right-0 flex flex-col items-center pb-1">
        <div className="font-[Poppins] text-sm font-bold text-navy dark:text-white">
          {items[active].label}
        </div>
        {items[active].sublabel && (
          <div className="text-[10px] text-slate-400">{items[active].sublabel}</div>
        )}
      </div>

      {/* controls */}
      <div className="absolute -bottom-1 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-white/80 px-2 py-1 text-slate-700 shadow-lg backdrop-blur-md dark:bg-[#0f1f1a]/80 dark:text-white">
        <button onClick={() => go(active - 1)} className="grid h-6 w-6 place-items-center rounded-full transition hover:bg-navy/10">
          <ChevronLeft className="h-3.5 w-3.5" />
        </button>
        <div className="flex items-center gap-1">
          {items.map((_, i) => (
            <span
              key={i}
              onClick={() => go(i)}
              className={`h-1.5 cursor-pointer rounded-full transition-all duration-300 ${active === i ? "w-4 bg-mint" : "w-1.5 bg-slate-300 hover:bg-slate-400 dark:bg-white/20"}`}
            />
          ))}
        </div>
        <button onClick={() => go(active + 1)} className="grid h-6 w-6 place-items-center rounded-full transition hover:bg-navy/10">
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
