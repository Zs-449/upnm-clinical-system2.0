"use client";

import { useEffect, useRef, useState, useCallback, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  FileText,
  Pill,
  BarChart3,
  Bot,
  Dumbbell,
  Settings,
  LifeBuoy,
  LogOut,
  Search,
  Bell,
  Sun,
  Moon,
  Menu,
  Plus,
  ChevronLeft,
  Stethoscope,
  ShieldPlus,
  HeartPulse,
  Clock,
} from "lucide-react";
import {
  getSession,
  clearSession,
  touchSession,
  roleLabels,
  type Role,
  type SessionUser,
} from "@/lib/session";
import { toggleTheme, getTheme } from "@/lib/theme";
import { Toaster, Modal, toast } from "@/components/ui";
import CareOpsAssistant from "@/components/CareOpsAssistant";

interface NavItem {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  roles: Role[];
}

const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: ["doctor", "admin"] },
  { href: "/portal", label: "My Health", icon: HeartPulse, roles: ["student/lecturer"] },
  { href: "/mc", label: "Medical Certificates", icon: FileText, roles: ["student/lecturer"] },
  { href: "/patients", label: "Patients", icon: Users, roles: ["doctor", "admin"] },
  { href: "/appointments", label: "Appointments", icon: CalendarDays, roles: ["doctor", "admin", "student/lecturer"] },
  { href: "/emr", label: "Medical Records", icon: FileText, roles: ["doctor"] },
  { href: "/pharmacy", label: "Pharmacy", icon: Pill, roles: ["admin", "doctor"] },
  { href: "/doctor-availability", label: "Doctor Availability", icon: Stethoscope, roles: ["admin"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["admin", "doctor"] },
  // AI Screener and Fitness are ONLY for student/lecturer
  { href: "/ai-screener", label: "AI Screener", icon: Bot, roles: ["student/lecturer"] },
  { href: "/fitness", label: "UPFT Fitness", icon: Dumbbell, roles: ["student/lecturer"] },
];

const INACTIVITY_LIMIT = 15 * 60 * 1000; // 15 minutes in ms
const WARNING_BEFORE = 60 * 1000; // show warning 1 minute before logout

export default function Shell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<SessionUser | null>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(4);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [ready, setReady] = useState(false);
  const [clock, setClock] = useState("");
  const [search, setSearch] = useState("");
  const [inactivityWarning, setInactivityWarning] = useState(false);
  const [countdown, setCountdown] = useState(60);
  const notifRef = useRef<HTMLDivElement>(null);
  const lastActivityRef = useRef<number>(Date.now());
  const inactivityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const warningTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const countdownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const doLogout = useCallback(() => {
    clearSession();
    router.replace("/login");
  }, [router]);

  const resetInactivityTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    touchSession();
    setInactivityWarning(false);
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
    if (warningTimerRef.current) {
      clearTimeout(warningTimerRef.current);
    }
    if (inactivityTimerRef.current) {
      clearTimeout(inactivityTimerRef.current);
    }

    // Show warning 1 minute before auto-logout
    warningTimerRef.current = setTimeout(() => {
      setInactivityWarning(true);
      setCountdown(60);
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((c) => {
          if (c <= 1) {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            return 0;
          }
          return c - 1;
        });
      }, 1000);
    }, INACTIVITY_LIMIT - WARNING_BEFORE);

    // Auto-logout after 15 minutes
    inactivityTimerRef.current = setTimeout(() => {
      clearSession();
      toast("You have been logged out due to inactivity.", "error");
      setTimeout(() => router.replace("/login"), 1500);
    }, INACTIVITY_LIMIT);
  }, [router]);

  useEffect(() => {
    const u = getSession();
    if (!u) {
      router.replace("/login");
      return;
    }
    setUser(u);
    setDark(getTheme() === "dark");
    setReady(true);
    const iv = setInterval(() => setClock(new Date().toLocaleTimeString("en-GB")), 1000);

    // Start inactivity timer
    resetInactivityTimer();

    return () => {
      clearInterval(iv);
      if (inactivityTimerRef.current) clearTimeout(inactivityTimerRef.current);
      if (warningTimerRef.current) clearTimeout(warningTimerRef.current);
      if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
    };
  }, [router, resetInactivityTimer]);

  // Activity event listeners — reset timer on any user interaction
  useEffect(() => {
    const events = ["click", "keydown", "mousemove", "mousedown", "touchstart", "scroll", "wheel"];
    const h = () => resetInactivityTimer();
    events.forEach((ev) => window.addEventListener(ev, h, { passive: true }));
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, h));
    };
  }, [resetInactivityTimer]);

  useEffect(() => setMobileOpen(false), [pathname]);

  if (!ready || !user) {
    return (
      <div className="flex h-screen items-center justify-center bg-[#f0f4f8] dark:bg-[#0f1f1a]">
        <div className="spinner h-10 w-10 rounded-full border-4 border-navy/20 border-t-navy" />
      </div>
    );
  }

  const items = NAV.filter((n) => n.roles.includes(user.role));

  const notifications = [
    { icon: HeartPulse, text: "Critical lab result for UPNM-2024011", color: "#c25d5d", time: "2m" },
    { icon: Pill, text: "Cetirizine 10mg is below minimum stock", color: "#d48040", time: "18m" },
    { icon: CalendarDays, text: "3 new appointments booked today", color: "#7a9e7e", time: "1h" },
    { icon: ShieldPlus, text: "System backup completed successfully", color: "#c9955a", time: "3h" },
  ];

  return (
    <div className="flex min-h-screen bg-[#f0f4f8] dark:bg-[#0f1f1a]">
      <Toaster />
      {user.role === "admin" && <CareOpsAssistant />}

      {/* Inactivity Warning Modal */}
      {inactivityWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass mx-4 w-full max-w-sm rounded-[24px] p-6 shadow-2xl animate-scale-in">
            <div className="mb-4 flex items-center gap-3">
              <div className="grid h-12 w-12 place-items-center rounded-2xl bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h3 className="font-[Poppins] text-lg font-bold text-navy dark:text-white">Session Expiring</h3>
                <p className="text-xs text-slate-400">No activity detected</p>
              </div>
            </div>
            <p className="mb-4 text-sm text-slate-600 dark:text-slate-300">
              You will be automatically logged out in{" "}
              <span className="font-mono text-lg font-extrabold text-danger">{countdown}s</span>{" "}
              due to inactivity.
            </p>
            <div className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-white/10">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-400 to-danger transition-all duration-1000"
                style={{ width: `${(countdown / 60) * 100}%` }}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={resetInactivityTimer}
                className="flex-1 rounded-xl bg-mint py-2.5 text-sm font-semibold text-white shadow-md transition hover:brightness-105"
              >
                Stay logged in
              </button>
              <button
                onClick={doLogout}
                className="flex-1 rounded-xl border border-danger/30 bg-danger/10 py-2.5 text-sm font-semibold text-danger transition hover:bg-danger/20"
              >
                Log out now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside
        className={`fixed z-40 flex h-screen flex-col border-r border-navy/10 bg-navy text-white transition-all duration-300 dark:border-white/10 dark:bg-[#0f1f1a] ${collapsed ? "w-[76px]" : "w-64"} ${mobileOpen ? "translate-x-0" : "-translate-x-full"} lg:translate-x-0`}
      >
        <div className="flex items-center gap-3 px-4 py-5">
          <img src="/images/upnm-logo.png" alt="UPNM" className="h-11 w-11 shrink-0 rounded-xl bg-white object-contain p-0.5 shadow-lg ring-1 ring-white/20" />
          {!collapsed && (
            <div className="animate-fade-in">
              <div className="font-[Poppins] text-sm font-extrabold leading-tight">
                UPNM <span className="text-cyan">SCS</span>
              </div>
              <div className="text-[10px] text-white/50">Smart Clinical v2.0</div>
            </div>
          )}
        </div>

        {/* user */}
        <div className={`mx-3 mb-2 flex items-center gap-3 rounded-xl bg-white/5 p-2.5 ${collapsed ? "justify-center" : ""}`}>
          <div className="relative">
            <div
              className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white"
              style={{ background: user.avatarColor }}
            >
              {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-navy bg-mint pulse-dot" />
          </div>
          {!collapsed && (
            <div className="min-w-0 animate-fade-in">
              <div className="truncate text-xs font-semibold">{user.name}</div>
              <div className="truncate text-[10px] text-white/50">{roleLabels[user.role]}</div>
            </div>
          )}
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2 no-scrollbar">
          {items.map((n) => {
            const active = pathname === n.href || pathname.startsWith(n.href + "/");
            const Icon = n.icon;
            return (
              <Link
                key={n.href}
                href={n.href}
                title={collapsed ? n.label : ""}
                className={`group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-300 ${active ? "bg-gradient-to-r from-cyan/20 to-mint/10 text-white shadow-inner" : "text-white/60 hover:bg-white/5 hover:text-white hover:translate-x-1"}`}
              >
                {active && <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-cyan" />}
                <Icon className={`h-5 w-5 shrink-0 transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6 ${active ? "text-cyan" : ""}`} />
                {!collapsed && <span className="animate-fade-in">{n.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t border-white/10 p-3">
          <button onClick={() => setSettingsOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white" title="Settings">
            <Settings className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Settings</span>}
          </button>
          <button onClick={() => setHelpOpen(true)} className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-white/60 hover:bg-white/5 hover:text-white" title="Help">
            <LifeBuoy className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Help</span>}
          </button>
          <button
            onClick={doLogout}
            className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-red-300 hover:bg-danger/20"
            title="Logout"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Main */}
      <div className={`flex min-h-screen flex-1 flex-col transition-all duration-300 ${collapsed ? "lg:ml-[76px]" : "lg:ml-64"}`}>
        {/* Header */}
        <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-navy/5 bg-white/80 px-4 py-3 backdrop-blur-lg dark:border-white/5 dark:bg-[#0f1f1a]/80 no-print">
          <button className="rounded-lg p-2 text-navy hover:bg-navy/5 dark:text-white lg:hidden" onClick={() => setMobileOpen(true)}>
            <Menu className="h-5 w-5" />
          </button>
          <button
            className="hidden rounded-lg p-2 text-navy hover:bg-navy/5 dark:text-white lg:block"
            onClick={() => setCollapsed((c) => !c)}
          >
            <ChevronLeft className={`h-5 w-5 transition-transform ${collapsed ? "rotate-180" : ""}`} />
          </button>

          <div className="relative hidden max-w-md flex-1 items-center sm:flex">
            <Search className="absolute left-3 h-4 w-4 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search patients, records, appointments…"
              className="w-full rounded-xl border border-navy/10 bg-slate-50 py-2 pl-9 pr-3 text-sm outline-none transition-all focus:border-cyan focus:ring-2 focus:ring-cyan/20 dark:border-white/10 dark:bg-white/5 dark:text-white"
            />
          </div>

          <div className="ml-auto flex items-center gap-1.5">
            {(user.role === "doctor" || user.role === "admin") && (
              <Link href="/appointments" className="hidden items-center gap-1.5 rounded-lg bg-mint px-3 py-2 text-xs font-semibold text-white shadow-md shadow-mint/25 transition hover:brightness-95 md:flex">
                <Plus className="h-4 w-4" /> New Appt
              </Link>
            )}

          <button
            onClick={() => {
              setDark(toggleTheme() === "dark");
            }}
            className="rounded-lg p-2 text-navy transition-transform hover:rotate-12 hover:bg-navy/5 dark:text-amber-300 dark:hover:bg-white/5"
            title="Toggle theme"
          >
            {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>

            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative rounded-lg p-2 text-navy hover:bg-navy/5 dark:text-white dark:hover:bg-white/5"
              >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 grid h-4 w-4 place-items-center rounded-full bg-danger text-[9px] font-bold text-white">{unreadCount}</span>
                )}
              </button>
              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl card p-2 animate-scale-in">
                  <div className="flex items-center justify-between px-2 py-1.5">
                    <span className="text-sm font-bold text-navy dark:text-white">Notifications</span>
                    <button
                      onClick={() => {
                        setUnreadCount(0);
                        toast("All notifications marked as read");
                      }}
                      className="text-[11px] font-semibold text-mint hover:underline"
                    >
                      Mark all read
                    </button>
                  </div>
                  {notifications.map((n, i) => (
                    <div key={i} className="flex items-start gap-3 rounded-xl p-2.5 hover:bg-slate-50 dark:hover:bg-white/5">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${n.color}22` }}>
                        <n.icon className="h-4 w-4" style={{ color: n.color }} />
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-slate-700 dark:text-slate-200">{n.text}</p>
                        <p className="text-[10px] text-slate-400">{n.time} ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="grid h-9 w-9 place-items-center rounded-full text-sm font-bold text-white transition hover:ring-2 hover:ring-cyan/40"
                style={{ background: user.avatarColor }}
              >
                {user.name.split(" ").map((w) => w[0]).slice(0, 2).join("")}
              </button>
              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl card p-2 animate-scale-in">
                  <div className="border-b border-slate-100 px-3 py-2 dark:border-white/10">
                    <div className="text-sm font-semibold text-navy dark:text-white">{user.name}</div>
                    <div className="text-[11px] text-slate-400">{user.email}</div>
                  </div>
                  <div className="hidden px-3 py-2 font-mono text-xs text-slate-400 sm:block">🕐 {clock}</div>
                  <button onClick={doLogout} className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-danger hover:bg-danger/10">
                    <LogOut className="h-4 w-4" /> Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6">{children}</main>

        {/* Mobile bottom nav */}
        <nav className="sticky bottom-0 z-20 flex items-center justify-around border-t border-navy/10 bg-white/90 py-1.5 backdrop-blur-lg dark:border-white/10 dark:bg-[#0f1f1a]/90 lg:hidden no-print">
          {items.slice(0, 5).map((n) => {
            const active = pathname === n.href;
            const Icon = n.icon;
            return (
              <Link key={n.href} href={n.href} className={`flex flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] ${active ? "text-mint" : "text-slate-400"}`}>
                <Icon className="h-5 w-5" />
                {n.label.split(" ")[0]}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Settings modal */}
      <Modal open={settingsOpen} onClose={() => setSettingsOpen(false)} title="Settings">
        <div className="space-y-4">
          <div className="flex items-center justify-between rounded-xl border border-navy/10 p-3 dark:border-white/10">
            <div>
              <div className="text-sm font-semibold text-navy dark:text-white">Dark mode</div>
              <div className="text-xs text-slate-400">Switch between light and dark theme</div>
            </div>
            <button
              onClick={() => setDark(toggleTheme() === "dark")}
              className={`relative h-6 w-11 rounded-full transition-colors ${dark ? "bg-mint" : "bg-slate-300 dark:bg-white/20"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${dark ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-navy/10 p-3 dark:border-white/10">
            <div>
              <div className="text-sm font-semibold text-navy dark:text-white">Email alerts</div>
              <div className="text-xs text-slate-400">Get notified about critical results by email</div>
            </div>
            <button
              onClick={() => {
                setEmailAlerts((v) => !v);
                toast(!emailAlerts ? "Email alerts enabled" : "Email alerts disabled", "info");
              }}
              className={`relative h-6 w-11 rounded-full transition-colors ${emailAlerts ? "bg-mint" : "bg-slate-300 dark:bg-white/20"}`}
            >
              <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${emailAlerts ? "left-5" : "left-0.5"}`} />
            </button>
          </div>
          <div className="rounded-xl border border-amber-200/60 bg-amber-50/60 p-3 dark:border-amber-400/20 dark:bg-amber-900/10">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-400">
              <Clock className="h-3.5 w-3.5" />
              Auto-logout after 15 minutes of inactivity
            </div>
          </div>
          <div className="rounded-xl border border-navy/10 p-3 text-xs text-slate-500 dark:border-white/10 dark:text-slate-400">
            Signed in as <span className="font-semibold text-navy dark:text-white">{user.name}</span> ({user.email}) · Role: {roleLabels[user.role]}
          </div>
        </div>
      </Modal>

      {/* Help modal */}
      <Modal open={helpOpen} onClose={() => setHelpOpen(false)} title="Help & Support">
        <div className="space-y-3 text-sm text-slate-600 dark:text-slate-300">
          <p>Need a hand with UPNM Smart Clinical System? Here&apos;s how to reach us:</p>
          <div className="rounded-xl border border-navy/10 p-3 dark:border-white/10">
            <div className="font-semibold text-navy dark:text-white">IT Helpdesk</div>
            <div className="text-xs text-slate-400">helpdesk@upnm.edu.my · ext. 2233</div>
          </div>
          <div className="rounded-xl border border-navy/10 p-3 dark:border-white/10">
            <div className="font-semibold text-navy dark:text-white">Clinic Front Desk</div>
            <div className="text-xs text-slate-400">Mon–Fri, 8:00–17:00 · ext. 2200</div>
          </div>
          <p className="text-xs text-slate-400">Tip: use the search bar in the top header to quickly jump to patients, records, and appointments.</p>
        </div>
      </Modal>
    </div>
  );
}

export { Stethoscope };
