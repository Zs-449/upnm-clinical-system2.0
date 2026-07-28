"use client";

import { useState } from "react";

/* ---------------- Sparkline ---------------- */
export function Sparkline({
  data,
  color = "#7a9e7e",
  width = 90,
  height = 30,
}: {
  data: number[];
  color?: string;
  width?: number;
  height?: number;
}) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const pts = data
    .map((d, i) => {
      const x = (i / (data.length - 1)) * width;
      const y = height - ((d - min) / range) * height;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/* ---------------- Area / Line Chart ---------------- */
export function AreaChart({
  data,
  labels,
  color = "#c9955a",
}: {
  data: number[];
  labels: string[];
  color?: string;
}) {
  const W = 640;
  const H = 240;
  const pad = 30;
  const [hover, setHover] = useState<number | null>(null);
  if (data.length === 0) return null;
  const max = Math.max(...data, 1);
  const stepX = (W - pad * 2) / Math.max(data.length - 1, 1);
  const pts = data.map((d, i) => ({
    x: pad + i * stepX,
    y: H - pad - (d / max) * (H - pad * 2),
    v: d,
    l: labels[i],
  }));
  const line = pts.map((p) => `${p.x},${p.y}`).join(" ");
  const area = `${pad},${H - pad} ${line} ${W - pad},${H - pad}`;
  return (
    <div className="relative w-full">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity="0.35" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0, 0.25, 0.5, 0.75, 1].map((f) => (
          <line
            key={f}
            x1={pad}
            x2={W - pad}
            y1={pad + f * (H - pad * 2)}
            y2={pad + f * (H - pad * 2)}
            stroke="currentColor"
            className="text-slate-200 dark:text-white/10"
            strokeWidth={1}
          />
        ))}
        <polygon points={area} fill="url(#areaFill)" />
        <polyline
          points={line}
          fill="none"
          stroke={color}
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{
            strokeDasharray: 2000,
            strokeDashoffset: 0,
            animation: "dash 1.4s ease forwards",
          }}
        />
        {pts.map((p, i) => (
          <g key={i}>
            <rect
              x={p.x - stepX / 2}
              y={0}
              width={stepX}
              height={H}
              fill="transparent"
              onMouseEnter={() => setHover(i)}
              onMouseLeave={() => setHover(null)}
            />
            {hover === i && (
              <circle cx={p.x} cy={p.y} r={5} fill={color} stroke="#fff" strokeWidth={2} />
            )}
          </g>
        ))}
        <style>{`@keyframes dash{from{stroke-dashoffset:2000}to{stroke-dashoffset:0}}`}</style>
      </svg>
      {hover !== null && (
        <div
          className="pointer-events-none absolute -translate-x-1/2 rounded-lg bg-navy px-2.5 py-1.5 text-xs font-semibold text-white shadow-lg"
          style={{
            left: `${(pts[hover].x / W) * 100}%`,
            top: `${(pts[hover].y / H) * 100 - 12}%`,
          }}
        >
          {pts[hover].l}: {pts[hover].v}
        </div>
      )}
    </div>
  );
}

/* ---------------- Donut Chart ---------------- */
export function DonutChart({
  data,
}: {
  data: { label: string; value: number; color: string }[];
}) {
  const total = data.reduce((s, d) => s + d.value, 0) || 1;
  let acc = 0;
  const R = 70;
  const C = 2 * Math.PI * R;
  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
      <svg viewBox="0 0 180 180" className="h-40 w-40 -rotate-90">
        <circle cx="90" cy="90" r={R} fill="none" stroke="currentColor" className="text-slate-200 dark:text-white/10" strokeWidth="22" />
        {data.map((d, i) => {
          const frac = d.value / total;
          const dash = frac * C;
          const el = (
            <circle
              key={i}
              cx="90"
              cy="90"
              r={R}
              fill="none"
              stroke={d.color}
              strokeWidth="22"
              strokeDasharray={`${dash} ${C - dash}`}
              strokeDashoffset={-acc}
              strokeLinecap="butt"
              style={{ transition: "stroke-dasharray 1s ease" }}
            />
          );
          acc += dash;
          return el;
        })}
      </svg>
      <div className="space-y-2">
        {data.map((d, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <span className="h-3 w-3 rounded-full" style={{ background: d.color }} />
            <span className="font-medium text-slate-600 dark:text-slate-300">{d.label}</span>
            <span className="ml-auto font-mono font-bold text-navy dark:text-white">
              {Math.round((d.value / total) * 100)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Bar Chart ---------------- */
export function BarChart({
  data,
  color = "#1f3d3a",
}: {
  data: { label: string; value: number }[];
  color?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex h-56 items-end justify-between gap-3">
      {data.map((d, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-2">
          <span className="font-mono text-xs font-bold text-navy dark:text-white">
            {d.value}
          </span>
          <div
            className="w-full rounded-t-lg transition-all"
            style={{
              height: `${(d.value / max) * 160}px`,
              background: `linear-gradient(180deg, ${color}, #7a9e7e)`,
              animation: `growBar 0.8s ease ${i * 0.08}s both`,
            }}
          />
          <span className="text-center text-[11px] text-slate-500 dark:text-slate-400">
            {d.label}
          </span>
        </div>
      ))}
      <style>{`@keyframes growBar{from{height:0}}`}</style>
    </div>
  );
}

/* ---------------- Gauge (health score) ---------------- */
export function Gauge({ value }: { value: number }) {
  const R = 60;
  const C = Math.PI * R; // semicircle
  const frac = Math.min(Math.max(value, 0), 100) / 100;
  const color = value >= 75 ? "#7a9e7e" : value >= 50 ? "#d48040" : "#c25d5d";
  return (
    <div className="relative flex flex-col items-center">
      <svg viewBox="0 0 160 90" className="w-44">
        <path
          d="M 20 85 A 60 60 0 0 1 140 85"
          fill="none"
          stroke="currentColor"
          className="text-slate-200 dark:text-white/10"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M 20 85 A 60 60 0 0 1 140 85"
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={C}
          strokeDashoffset={C * (1 - frac)}
          style={{ transition: "stroke-dashoffset 1.2s ease" }}
        />
      </svg>
      <div className="-mt-8 text-center">
        <div className="font-mono text-3xl font-bold" style={{ color }}>
          {value}
        </div>
        <div className="text-xs text-slate-500 dark:text-slate-400">Health Score</div>
      </div>
    </div>
  );
}

/* ---------------- Heatmap ---------------- */
export function Heatmap() {
  const hours = ["8", "9", "10", "11", "12", "1", "2", "3", "4"];
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri"];
  return (
    <div className="overflow-x-auto">
      <div className="inline-block">
        <div className="flex gap-1 pl-10">
          {hours.map((h) => (
            <div key={h} className="w-7 text-center text-[10px] text-slate-400">
              {h}
            </div>
          ))}
        </div>
        {days.map((day) => (
          <div key={day} className="flex items-center gap-1">
            <div className="w-9 text-right text-[10px] text-slate-400">{day}</div>
            {hours.map((h) => {
              const intensity = Math.random();
              return (
                <div
                  key={h}
                  title={`${day} ${h}:00 — ${Math.round(intensity * 20)} visits`}
                  className="h-7 w-7 rounded"
                  style={{
                    background: `rgba(46,204,143,${0.15 + intensity * 0.85})`,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
