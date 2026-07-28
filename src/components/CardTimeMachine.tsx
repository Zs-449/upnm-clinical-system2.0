"use client";

import { useState, useMemo } from "react";
import { Pill, Clock, Calendar, User } from "lucide-react";

export interface TimelineItem {
  date: string;
  label: string;
  icon: "pill" | "clock" | "calendar";
  gradient: [string, string];
  subtitle?: string;
  meta?: string;
  qty?: string;
}

const ICONS = { pill: Pill, clock: Clock, calendar: Calendar };

export const DEFAULT_TIMELINE: TimelineItem[] = [
  { date: "Today", label: "Paracetamol 500mg", icon: "pill", gradient: ["#7a9e7e", "#5f8563"], subtitle: "Siti Fatimah", meta: "10:24 AM", qty: "20 tablets" },
  { date: "1d ago", label: "Amoxicillin 250mg", icon: "pill", gradient: ["#c9955a", "#a8825a"], subtitle: "Raj Anand", meta: "Yesterday · 3:15 PM", qty: "14 capsules" },
  { date: "3d ago", label: "Ibuprofen 400mg", icon: "pill", gradient: ["#d48040", "#b87a32"], subtitle: "Faris Danial", meta: "17 Jul · 11:08 AM", qty: "15 tablets" },
  { date: "1w ago", label: "Cetirizine 10mg", icon: "pill", gradient: ["#2d5551", "#1f3d3a"], subtitle: "Tan Wei Ling", meta: "13 Jul · 2:42 PM", qty: "10 tablets" },
  { date: "1m ago", label: "Salbutamol Inhaler", icon: "pill", gradient: ["#c25d5d", "#9c4848"], subtitle: "Aina Zahra", meta: "20 Jun · 9:15 AM", qty: "1 unit" },
];

export default function CardTimeMachine({
  items = DEFAULT_TIMELINE,
  className = "",
}: {
  items?: TimelineItem[];
  className?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  const handleTimelineHover = (index: number) => {
    setHoveredIndex(index);
    setActiveIndex(Math.round(index));
  };

  // main node per item, plus 2 decorative sub-nodes between each (matches reference)
  const timelineNodes = useMemo(() => {
    const nodes: { type: "main" | "sub"; index: number; date?: string }[] = [];
    items.forEach((item, i) => {
      nodes.push({ type: "main", index: i, date: item.date });
      if (i < items.length - 1) {
        for (let j = 0; j < 2; j++) nodes.push({ type: "sub", index: i + (j + 1) * 0.33 });
      }
    });
    return nodes;
  }, [items]);

  return (
    <div
      className={`relative flex h-[300px] w-full flex-row items-center justify-center gap-4 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-br from-[#0f1f1a] via-[#16302a] to-[#0f1f1a] p-5 ${className}`}
    >
      {/* gooey blur filter — makes card edges melt together premium-style */}
      <svg className="absolute h-0 w-0" version="1.1">
        <defs>
          <filter id="tmGoo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="5" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 20 -8" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>

      {/* ambient glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(122,158,126,0.10),transparent_70%)]" />
      <div className="pointer-events-none absolute left-1/4 top-1/2 h-40 w-40 -translate-y-1/2 rounded-full bg-mint/10 blur-3xl" />

      {/* header label */}
      <div className="pointer-events-none absolute left-5 top-4 z-40">
        <div className="text-[10px] font-bold uppercase tracking-[0.25em] text-mint/70">Dispensing Timeline</div>
        <div className="text-[11px] text-white/40">Scroll the rail to travel back in time →</div>
      </div>

      {/* ===== 3D STACKED CARD DECK ===== */}
      <div className="relative flex flex-1 items-center justify-center" style={{ perspective: "1000px" }}>
        <div className="relative h-[210px] w-[250px]" style={{ transformStyle: "preserve-3d" }}>
          {items.map((item, i) => {
            const offset = i - activeIndex;
            const isPast = i < activeIndex;
            const Icon = ICONS[item.icon];
            return (
              <div
                key={i}
                className="absolute inset-0 flex origin-center flex-col overflow-hidden rounded-2xl"
                style={{
                  transform: isPast
                    ? "translateZ(220px) translateY(320px) rotateX(-24deg) scale(1.35)"
                    : `translateZ(${-offset * 65}px) translateY(${-offset * 14}px) rotateX(${offset * 2.5}deg) scale(1)`,
                  opacity: isPast ? 0 : 1 - Math.abs(offset) * 0.22,
                  zIndex: items.length - i,
                  filter: "url(#tmGoo)",
                  transition: "transform 0.6s cubic-bezier(0.34,1.56,0.64,1), opacity 0.5s ease",
                  background: `linear-gradient(135deg, ${item.gradient[0]}, ${item.gradient[1]})`,
                  boxShadow: offset === 0 ? "0 30px 60px -15px rgba(0,0,0,0.6)" : "0 15px 40px -10px rgba(0,0,0,0.4)",
                }}
              >
                {/* subtle texture */}
                <div className="pointer-events-none absolute inset-0 opacity-[0.08]" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 to-transparent" />

                {/* card content */}
                <div className="relative z-10 flex h-full flex-col justify-between p-5 text-white">
                  <div className="flex items-start justify-between">
                    <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/20 backdrop-blur-sm ring-1 ring-white/30">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="rounded-full bg-white/20 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm ring-1 ring-white/20">
                      {item.date}
                    </span>
                  </div>
                  <div>
                    <div className="font-[Poppins] text-xl font-extrabold leading-tight drop-shadow">{item.label}</div>
                    {item.qty && <div className="mt-0.5 text-sm font-semibold text-white/85">{item.qty}</div>}
                    <div className="mt-3 flex items-center gap-1.5 text-xs text-white/80">
                      <User className="h-3.5 w-3.5" /> {item.subtitle}
                    </div>
                    <div className="mt-1 flex items-center gap-1.5 font-mono text-[11px] text-white/60">
                      <Clock className="h-3 w-3" /> {item.meta}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== VERTICAL TIMELINE RAIL ===== */}
      <div className="relative z-50 flex flex-col items-end py-2 pr-1" onMouseLeave={() => setHoveredIndex(null)}>
        {timelineNodes.map((node) => {
          if (node.type === "main") {
            const index = node.index;
            const isSelected = activeIndex === index;
            return (
              <button
                key={`main-${index}`}
                className="group relative inline-flex w-24 cursor-pointer items-center justify-end border-0 bg-transparent py-[2px]"
                onMouseEnter={() => handleTimelineHover(index)}
                onClick={(e) => { e.stopPropagation(); setActiveIndex(index); }}
              >
                {hoveredIndex === index && (
                  <span
                    className={`absolute right-11 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-0.5 text-[10px] font-bold shadow-lg ${isSelected ? "bg-mint text-white" : "bg-white/10 text-white/90"}`}
                    style={{ animation: "fadeIn 0.15s ease" }}
                  >
                    {node.date}
                  </span>
                )}
                <div
                  className="h-[3px] w-7 origin-right rounded-full transition-all duration-300"
                  style={{
                    background: isSelected ? "#7a9e7e" : "rgba(255,255,255,0.5)",
                    transform: `scaleX(${hoveredIndex === null ? 1 : isSelected ? 1.5 : Math.abs(index - hoveredIndex) < 0.5 ? 1.3 : 1})`,
                    boxShadow: isSelected ? "0 0 10px rgba(122,158,126,0.7)" : "none",
                  }}
                />
              </button>
            );
          }
          const isNear = hoveredIndex !== null && Math.abs(node.index - hoveredIndex) <= 0.5;
          return (
            <div
              key={`sub-${node.index}`}
              className="flex w-24 cursor-pointer justify-end py-[2px]"
              onMouseEnter={() => handleTimelineHover(node.index)}
              onClick={(e) => { e.stopPropagation(); setActiveIndex(Math.round(node.index)); }}
            >
              <div
                className="h-[3px] w-7 origin-right rounded-full bg-white/20 transition-all duration-300"
                style={{
                  transform: `scaleX(${hoveredIndex === null ? 1 : isNear ? 1.2 : 1})`,
                  opacity: hoveredIndex === null ? 0.3 : isNear ? 0.55 : 0.3,
                }}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
