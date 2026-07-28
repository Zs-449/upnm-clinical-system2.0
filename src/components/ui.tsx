"use client";

import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type ButtonHTMLAttributes,
} from "react";

/* ---------------- Animated Counter ---------------- */
export function Counter({
  value,
  duration = 1000,
  className = "",
}: {
  value: number;
  duration?: number;
  className?: string;
}) {
  const [display, setDisplay] = useState(0);
  const ref = useRef<number | undefined>(undefined);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const step = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(Math.round(from + (value - from) * eased));
      if (p < 1) ref.current = requestAnimationFrame(step);
    };
    ref.current = requestAnimationFrame(step);
    return () => {
      if (ref.current) cancelAnimationFrame(ref.current);
    };
  }, [value, duration]);
  return <span className={className}>{display.toLocaleString()}</span>;
}

/* ---------------- Ripple Button ---------------- */
export function Button({
  children,
  variant = "primary",
  loading = false,
  className = "",
  ...props
}: {
  children: ReactNode;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "mint";
  loading?: boolean;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  const variants: Record<string, string> = {
    primary:
      "bg-navy text-white hover:bg-[#12294e] shadow-lg shadow-navy/20",
    secondary:
      "bg-white dark:bg-[#22375a] text-navy dark:text-white border border-navy/15 dark:border-white/10 hover:border-navy/40",
    mint: "bg-mint text-white hover:brightness-95 shadow-lg shadow-mint/25",
    ghost:
      "bg-transparent text-navy dark:text-slate-200 hover:bg-navy/5 dark:hover:bg-white/5",
    danger: "bg-danger text-white hover:brightness-95 shadow-lg shadow-danger/25",
  };
  return (
    <button
      {...props}
      disabled={loading || props.disabled}
      className={`ripple relative inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      onClick={(e) => {
        const el = e.currentTarget;
        const circle = document.createElement("span");
        const d = Math.max(el.clientWidth, el.clientHeight);
        const rect = el.getBoundingClientRect();
        circle.style.width = circle.style.height = `${d}px`;
        circle.style.left = `${e.clientX - rect.left - d / 2}px`;
        circle.style.top = `${e.clientY - rect.top - d / 2}px`;
        circle.style.position = "absolute";
        circle.style.borderRadius = "9999px";
        circle.style.background = "rgba(255,255,255,0.4)";
        circle.style.transform = "scale(0)";
        circle.style.animation = "rippleFx 0.6s ease-out";
        circle.style.pointerEvents = "none";
        el.appendChild(circle);
        setTimeout(() => circle.remove(), 600);
        props.onClick?.(e);
      }}
    >
      {loading && (
        <span className="spinner h-4 w-4 rounded-full border-2 border-white/40 border-t-white" />
      )}
      {children}
      <style>{`@keyframes rippleFx{to{transform:scale(2.5);opacity:0}}`}</style>
    </button>
  );
}

/* ---------------- Badge ---------------- */
export function Badge({
  children,
  color = "navy",
}: {
  children: ReactNode;
  color?: "navy" | "mint" | "amber" | "danger" | "cyan" | "gray";
}) {
  const map: Record<string, string> = {
    navy: "bg-navy/10 text-navy dark:bg-navy/30 dark:text-blue-200",
    mint: "bg-mint/15 text-emerald-700 dark:bg-mint/20 dark:text-emerald-300",
    amber: "bg-amber/20 text-amber-700 dark:text-amber-300",
    danger: "bg-danger/15 text-red-600 dark:text-red-300",
    cyan: "bg-cyan/15 text-cyan-700 dark:text-cyan-300",
    gray: "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300",
  };
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[color]}`}
    >
      {children}
    </span>
  );
}

export function statusColor(status: string): "navy" | "mint" | "amber" | "danger" | "cyan" | "gray" {
  const s = status.toLowerCase();
  if (["active", "done", "collected", "normal", "scheduled"].includes(s)) return "mint";
  if (["critical", "emergency", "high"].includes(s)) return "danger";
  if (["waiting", "pending", "dispensing", "soon", "low"].includes(s)) return "amber";
  if (["in consultation"].includes(s)) return "cyan";
  if (["inactive"].includes(s)) return "gray";
  return "navy";
}

/* ---------------- Modal ---------------- */
export function Modal({
  open,
  onClose,
  children,
  title,
  wide = false,
}: {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  title?: string;
  wide?: boolean;
}) {
  const [shake, setShake] = useState(false);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-navy/40 backdrop-blur-sm animate-fade-in"
        onClick={() => {
          setShake(true);
          setTimeout(() => setShake(false), 400);
        }}
      />
      <div
        className={`relative z-10 w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-[20px] card p-6 animate-scale-in max-h-[90vh] overflow-y-auto ${shake ? "animate-shake" : ""}`}
      >
        {title && (
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-[Poppins] text-lg font-bold text-navy dark:text-white">
              {title}
            </h3>
            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

/* ---------------- Toast system ---------------- */
type Toast = { id: number; msg: string; type: "success" | "error" | "info" };
let toastListeners: ((t: Toast) => void)[] = [];
export function toast(msg: string, type: Toast["type"] = "success") {
  toastListeners.forEach((l) => l({ id: Date.now() + Math.random(), msg, type }));
}
export function Toaster() {
  const [items, setItems] = useState<Toast[]>([]);
  useEffect(() => {
    const l = (t: Toast) => {
      setItems((prev) => [...prev, t]);
      setTimeout(() => setItems((prev) => prev.filter((x) => x.id !== t.id)), 4000);
    };
    toastListeners.push(l);
    return () => {
      toastListeners = toastListeners.filter((x) => x !== l);
    };
  }, []);
  return (
    <div className="fixed right-4 top-4 z-[100] flex flex-col gap-2">
      {items.map((t) => (
        <div
          key={t.id}
          className="animate-slide-right flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-xl"
          style={{
            background:
              t.type === "success"
                ? "#7a9e7e"
                : t.type === "error"
                  ? "#c25d5d"
                  : "#1f3d3a",
          }}
        >
          <span>{t.type === "success" ? "✓" : t.type === "error" ? "!" : "i"}</span>
          {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ---------------- Skeleton ---------------- */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-lg bg-slate-200/70 dark:bg-white/10 ${className}`}
    />
  );
}
