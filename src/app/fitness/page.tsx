"use client";

import Shell from "@/components/Shell";
import { AreaChart } from "@/components/charts";
import { Badge } from "@/components/ui";
import { Dumbbell, Award, ShieldCheck, HeartPulse, Timer } from "lucide-react";

const RANKS = [
  { name: "Recruit", min: 0 }, { name: "Private", min: 40 }, { name: "Corporal", min: 55 },
  { name: "Sergeant", min: 70 }, { name: "Lieutenant", min: 85 },
];

export default function FitnessPage() {
  const score = 78;
  const rank = [...RANKS].reverse().find((r) => score >= r.min)!;
  const nextRank = RANKS.find((r) => r.min > score);

  const tests = [
    { name: "2.4 km Run", result: "11:42", target: "≤ 12:00", pass: true, icon: Timer },
    { name: "Push-ups (1 min)", result: "42", target: "≥ 35", pass: true, icon: Dumbbell },
    { name: "Sit-ups (1 min)", result: "38", target: "≥ 40", pass: false, icon: Dumbbell },
    { name: "Pull-ups", result: "9", target: "≥ 8", pass: true, icon: Dumbbell },
  ];

  const badges = [
    { name: "Iron Runner", emoji: "🏃", earned: true }, { name: "Endurance", emoji: "🎖️", earned: true },
    { name: "Perfect Score", emoji: "🏅", earned: false }, { name: "Zero Sick Leave", emoji: "🛡️", earned: true },
    { name: "Team Leader", emoji: "⭐", earned: false }, { name: "Marksman Fit", emoji: "🎯", earned: false },
  ];

  return (
    <Shell>
      <div className="mb-6">
        <h1 className="font-[Poppins] text-2xl font-extrabold text-navy dark:text-white">UPFT — Military Fitness Tracker</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400">UPNM Physical Fitness Test results & clearance</p>
      </div>

      {/* Rank progression */}
      <div className="card mb-5 overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-r from-navy via-[#2d5551] to-navy bg-[length:200%_100%] p-6 text-white animated-gradient">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/15 text-3xl animate-float motion-reduce:animate-none">🎖️</div>
              <div>
                <div className="text-xs text-white/60">Current Fitness Rank</div>
                <div className="font-[Poppins] text-2xl font-extrabold">{rank.name}</div>
                <div className="font-mono text-sm text-cyan">Score: {score}/100</div>
              </div>
            </div>
            <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-mint" /><span className="text-sm font-semibold">Medically Cleared for Training</span></div>
          </div>
          {/* progress */}
          <div className="mt-5">
            <div className="mb-1 flex justify-between text-xs text-white/60"><span>{rank.name}</span>{nextRank && <span>{nextRank.name} at {nextRank.min}</span>}</div>
            <div className="flex gap-1">
              {RANKS.map((r, i) => {
                const filled = score >= r.min;
                return <div key={r.name} className="h-2.5 flex-1 rounded-full overflow-hidden bg-white/20"><div className="h-full transition-all" style={{ width: filled ? "100%" : "0%", background: "linear-gradient(90deg,#c9955a,#7a9e7e)", transitionDelay: `${i * 100}ms` }} /></div>;
              })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Test results */}
        <div className="card p-5 lg:col-span-2">
          <h2 className="mb-4 font-[Poppins] font-bold text-navy dark:text-white">Latest UPFT Results</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {tests.map((t) => (
              <div key={t.name} className="flex items-center gap-3 rounded-xl border border-slate-100 p-4 dark:border-white/10">
                <div className={`grid h-11 w-11 place-items-center rounded-xl ${t.pass ? "bg-mint/15 text-mint" : "bg-danger/15 text-danger"}`}><t.icon className="h-5 w-5" /></div>
                <div className="flex-1"><div className="text-sm font-semibold text-navy dark:text-white">{t.name}</div><div className="text-xs text-slate-400">Target {t.target}</div></div>
                <div className="text-right"><div className="font-mono text-lg font-bold text-navy dark:text-white">{t.result}</div><Badge color={t.pass ? "mint" : "danger"}>{t.pass ? "PASS" : "RETEST"}</Badge></div>
              </div>
            ))}
          </div>
          <div className="mt-5">
            <h3 className="mb-2 text-sm font-semibold text-navy dark:text-white">Fitness Trend (per semester)</h3>
            <AreaChart data={[62, 68, 71, 74, 78]} labels={["Sem 1", "Sem 2", "Sem 3", "Sem 4", "Sem 5"]} color="#7a9e7e" />
          </div>
        </div>

        {/* Badges + recommendations */}
        <div className="space-y-5">
          <div className="card p-5">
            <h2 className="mb-4 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white"><Award className="h-4 w-4 text-amber-500" /> Achievements</h2>
            <div className="grid grid-cols-3 gap-3">
              {badges.map((b) => (
                <div key={b.name} className={`flex flex-col items-center gap-1 rounded-xl border p-3 text-center ${b.earned ? "border-mint/40 bg-mint/5" : "border-slate-100 opacity-40 dark:border-white/10"}`}>
                  <span className="text-2xl grayscale-0">{b.emoji}</span>
                  <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">{b.name}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card p-5">
            <h2 className="mb-3 flex items-center gap-2 font-[Poppins] font-bold text-navy dark:text-white"><HeartPulse className="h-4 w-4 text-cyan" /> Recommendations</h2>
            <ul className="space-y-2 text-sm text-slate-500 dark:text-slate-400">
              <li>💪 Focus on core strength to improve sit-up performance.</li>
              <li>🥗 Increase protein intake for muscle recovery.</li>
              <li>😴 Maintain 7-8h sleep before field training.</li>
              <li>🩹 No active injuries reported — cleared for full duty.</li>
            </ul>
          </div>
        </div>
      </div>
    </Shell>
  );
}
