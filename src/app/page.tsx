"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ShieldPlus, Stethoscope, GraduationCap,
  UserCog, Fingerprint, Eye, EyeOff, CheckCircle2,
  Activity, Lock, Sparkles, Users, CalendarCheck, Clock, Cpu,
  Mail, ArrowLeft, ArrowRight, LayoutDashboard, Pill, Package,
  ClipboardList, History, ShieldCheck, ChevronRight, Menu, X as CloseIcon, Zap,
  Search, Bell, Plus, User as UserIcon, AlertTriangle, Brain, TrendingUp, Droplet, MapPin,
  Sun, Moon, Globe
} from "lucide-react";
import { roleLabels, type Role } from "@/lib/session";
import { Toaster, toast, Modal } from "@/components/ui";

// --- TRANSLATIONS ---
const TRANSLATIONS = {
  en: {
    nav: { ecosystem: "Ecosystem", roles: "Roles", intelligence: "Intelligence", security: "Security", access: "Access System" },
    hero: {
      motto: "Kewajipan. Maruah. Integriti",
      badge: "Clinical Command Center",
      title_part1: "UPNM",
      title_part2: "CMS 2.0",
      desc: "A single system for UPNM campus healthcare — appointments, electronic medical records, and pharmacy dispensing, connected end to end.",
      btn_access: "Access Portal",
      btn_workflow: "Explore Workflow",
      card_ai: "AI Command Center",
      card_morning: "Good morning, Doctor",
      card_waiting: "Waiting Now",
      card_appt: "Appointments",
      card_alert: "Critical Alert",
      card_alert_title: "High Potassium Detected",
      card_alert_desc: "Patient #0842 — Review lab results immediately.",
      card_next: "Next Patient",
      card_wait_est: "Est. wait: 4 min"
    },
    ecosystem: {
      badge: "Everything Connected",
      title: "One Patient. One Journey.",
      desc: "UPNM CMS 2.0 bridges every clinical touchpoint into a seamless, high-performance ecosystem. Data flows instantly from the student portal to the pharmacy and beyond.",
      steps: {
        student: "Student", student_desc: "Initiates request",
        appointment: "Appointment", appointment_desc: "Automated scheduling",
        emr: "Doctor / EMR", emr_desc: "Clinical consultation",
        prescription: "Prescription", prescription_desc: "Digital medication order",
        pharmacy: "Pharmacy", pharmacy_desc: "Smart dispensing",
        inventory: "Inventory", inventory_desc: "Real-time stock sync",
        record: "Medical Record", record_desc: "Permanent persistence",
        audit: "Activity Log", audit_desc: "Immutable audit trail"
      }
    },
    roles: {
      badge: "Built Around Every Role",
      title: "Precision for every user.",
      student: "Student / Lecturer",
      student_desc: "Access campus healthcare services with ease. Manage your appointments and medical records in a single dashboard.",
      doctor: "Medical Officer",
      doctor_desc: "Empowering healthcare providers with intelligent tools, real-time clinical insights, and an optimized patient queue.",
      admin: "Administrator & Pharmacy",
      admin_desc: "Complete oversight of the UPNM Health Centre operations, from real-time inventory tracking to detailed activity logs.",
      preview_id: "UPNM Digital Health ID",
      preview_fit: "Fit for Duty ✓",
      preview_upcoming: "Upcoming Appointment",
      preview_vitals: "Vitals",
      preview_normal: "Normal",
      preview_room: "Room",
      preview_kpi_patients: "Total Patients",
      preview_kpi_health: "System Health",
      preview_inv_alert: "Inventory Alert",
      preview_low_stock: "LOW STOCK",
      preview_remaining: "units remaining",
      preview_consultation: "General Consultation",
      preview_doctor_time: "Dr. Sarah · Today, 10:30 AM",
      preview_waiting_mins: "Waiting for 14 mins",
      preview_ai_note: "Review lab results for patient #0842. Potassium flagged as high.",
      preview_drug_name: "Paracetamol 500mg"
    },
    intelligence: {
      badge: "Clinical Decision Support",
      title: "Support at every step.",
      desc: "Pattern analysis runs in the background to help prioritize patient care, surfacing details a busy clinical team could otherwise miss.",
      feature1: "Clinical Insights", feature1_desc: "Surfaces relevant history to support treatment decisions.",
      feature2: "Clinical Alerts", feature2_desc: "Flags abnormal vital signs and lab results in real-time.",
      feature3: "Real-time Queue", feature3_desc: "Optimizes patient flow and room allocation automatically.",
      feature4: "History Analysis", feature4_desc: "Detects long-term patterns in student medical records.",
      engine: "Clinical Intelligence",
      monitoring: "Monitoring",
      insight_badge: "Flagged for Review",
      insight_desc: "Patient #8472 shows a sustained blood pressure trend across recent visits. Flagged for clinician review.",
      queue_badge: "Queue Optimized",
      queue_desc: "Triage priority updated for Room B2. Estimated waiting time for current queue reduced by 14 min."
    },
    security: {
      badge: "Security & Trust",
      title: "Protected by Design.",
      desc: "Clinical data is highly sensitive. UPNM CMS 2.0 uses multi-layered security to ensure records are only accessible to authorized personnel.",
      feature1: "Role-Based Access", feature1_desc: "Granular permissions for Students, Doctors, and Administrators ensuring zero unauthorized access.",
      feature2: "Protected Records", feature2_desc: "Clinical data is isolated and encrypted, protected by advanced security protocols.",
      feature3: "Audit Logging", feature3_desc: "Every system action is logged in an immutable activity trail for total transparency and compliance."
    },
    ready: {
      badge: "Ready to Access?",
      title: "The Future of Campus Healthcare.",
      desc: "Enter the UPNM clinical command center — appointments, records, and pharmacy, all in one place.",
      btn: "Access Clinical System",
      secure: "Secure Role-Based Access Verified"
    },
    footer: {
      desc: "Clinical Management System",
      rights: "UPNM Health Centre — Kem Sungai Besi. All rights reserved.",
      privacy: "Privacy Policy",
      terms: "Terms of Service"
    }
  },
  ms: {
    nav: { ecosystem: "Ekosistem", roles: "Peranan", intelligence: "Kepintaran", security: "Keselamatan", access: "Akses Sistem" },
    hero: {
      motto: "Kewajipan. Maruah. Integriti",
      badge: "Pusat Perintah Klinikal",
      title_part1: "UPNM",
      title_part2: "CMS 2.0",
      desc: "Sistem tunggal untuk penjagaan kesihatan kampus UPNM — temu janji, rekod perubatan elektronik, dan pendispensan farmasi, disambungkan dari hujung ke hujung.",
      btn_access: "Akses Portal",
      btn_workflow: "Teroka Aliran Kerja",
      card_ai: "Pusat Perintah AI",
      card_morning: "Selamat pagi, Doktor",
      card_waiting: "Menunggu Sekarang",
      card_appt: "Temu Janji",
      card_alert: "Amaran Kritikal",
      card_alert_title: "Potasium Tinggi Dikesan",
      card_alert_desc: "Pesakit #0842 — Semak keputusan makmal dengan segera.",
      card_next: "Pesakit Seterusnya",
      card_wait_est: "Anggaran tunggu: 4 min"
    },
    ecosystem: {
      badge: "Semuanya Terhubung",
      title: "Satu Pesakit. Satu Perjalanan.",
      desc: "UPNM CMS 2.0 menghubungkan setiap titik sentuhan klinikal ke dalam ekosistem yang lancar dan berprestasi tinggi. Data mengalir serta-merta dari portal pelajar ke farmasi dan seterusnya.",
      steps: {
        student: "Pelajar", student_desc: "Memulakan permintaan",
        appointment: "Temu Janji", appointment_desc: "Penjadualan automatik",
        emr: "Doktor / EMR", emr_desc: "Konsultasi klinikal",
        prescription: "Preskripsi", prescription_desc: "Pesanan ubat digital",
        pharmacy: "Farmasi", pharmacy_desc: "Pendispensan pintar",
        inventory: "Inventori", inventory_desc: "Segerak stok masa nyata",
        record: "Rekod Perubatan", record_desc: "Ketekalan kekal",
        audit: "Log Aktiviti", audit_desc: "Jejak audit tidak berubah"
      }
    },
    roles: {
      badge: "Dibina Untuk Setiap Peranan",
      title: "Ketepatan untuk setiap pengguna.",
      student: "Pelajar / Pensyarah",
      student_desc: "Akses perkhidmatan penjagaan kesihatan kampus dengan mudah. Urus temu janji dan rekod perubatan anda dalam satu papan pemuka.",
      doctor: "Pegawai Perubatan",
      doctor_desc: "Memperkasakan penyedia penjagaan kesihatan dengan alatan pintar, cerapan klinikal masa nyata, dan barisan pesakit yang dioptimumkan.",
      admin: "Pentadbir & Farmasi",
      admin_desc: "Pengawasan lengkap operasi Pusat Kesihatan UPNM, dari penjejakan inventori masa nyata hingga log aktiviti terperinci.",
      preview_id: "ID Kesihatan Digital UPNM",
      preview_fit: "Layak Bertugas ✓",
      preview_upcoming: "Temu Janji Akan Datang",
      preview_vitals: "Vital",
      preview_normal: "Normal",
      preview_room: "Bilik",
      preview_kpi_patients: "Jumlah Pesakit",
      preview_kpi_health: "Kesihatan Sistem",
      preview_inv_alert: "Amaran Inventori",
      preview_low_stock: "STOK RENDAH",
      preview_remaining: "unit berbaki",
      preview_consultation: "Konsultasi Am",
      preview_doctor_time: "Dr. Sarah · Hari ini, 10:30 PG",
      preview_waiting_mins: "Menunggu selama 14 minit",
      preview_ai_note: "Semak keputusan makmal untuk pesakit #0842. Potasium ditandakan tinggi.",
      preview_drug_name: "Paracetamol 500mg"
    },
    intelligence: {
      badge: "Sokongan Keputusan Klinikal",
      title: "Sokongan di setiap langkah.",
      desc: "Analisis corak berjalan di latar belakang untuk membantu mengutamakan penjagaan pesakit, memaparkan butiran yang mungkin terlepas oleh pasukan klinikal yang sibuk.",
      feature1: "Cerapan Klinikal", feature1_desc: "Memaparkan sejarah berkaitan untuk menyokong keputusan rawatan.",
      feature2: "Amaran Klinikal", feature2_desc: "Menandakan tanda vital dan keputusan makmal yang tidak normal dalam masa nyata.",
      feature3: "Barisan Masa Nyata", feature3_desc: "Mengoptimumkan aliran pesakit dan peruntukan bilik secara automatik.",
      feature4: "Analisis Sejarah", feature4_desc: "Mengesan corak jangka panjang dalam rekod perubatan pelajar.",
      engine: "Kepintaran Klinikal",
      monitoring: "Pemantauan",
      insight_badge: "Ditandakan untuk Semakan",
      insight_desc: "Pesakit #8472 menunjukkan trend tekanan darah yang berterusan merentas lawatan baru-baru ini. Ditandakan untuk semakan klinikal.",
      queue_badge: "Barisan Dioptimumkan",
      queue_desc: "Keutamaan triaj dikemas kini untuk Bilik B2. Anggaran masa menunggu untuk barisan semasa dikurangkan sebanyak 14 min."
    },
    security: {
      badge: "Keselamatan & Kepercayaan",
      title: "Dilindungi oleh Reka Bentuk.",
      desc: "Data klinikal adalah sangat sensitif. UPNM CMS 2.0 menggunakan keselamatan berbilang lapisan untuk memastikan rekod hanya boleh diakses oleh kakitangan yang diberi kuasa.",
      feature1: "Akses Berasaskan Peranan", feature1_desc: "Kebenaran terperinci untuk Pelajar, Doktor, dan Pentadbir memastikan sifar akses tanpa kebenaran.",
      feature2: "Rekod Terlindung", feature2_desc: "Data klinikal diasingkan dan disulitkan, dilindungi oleh protokol keselamatan lanjutan.",
      feature3: "Log Audit", feature3_desc: "Setiap tindakan sistem direkodkan dalam jejak aktiviti yang tidak boleh diubah untuk ketelusan dan pematuhan penuh."
    },
    ready: {
      badge: "Sedia untuk Akses?",
      title: "Masa Depan Penjagaan Kesihatan Kampus.",
      desc: "Masuk ke pusat perintah klinikal UPNM — temu janji, rekod, dan farmasi, semuanya di satu tempat.",
      btn: "Akses Sistem Klinikal",
      secure: "Akses Berasaskan Peranan Selamat Disahkan"
    },
    footer: {
      desc: "Sistem Pengurusan Klinikal",
      rights: "Pusat Kesihatan UPNM — Kem Sungai Besi. Hak cipta terpelihara.",
      privacy: "Dasar Privasi",
      terms: "Syarat Perkhidmatan"
    }
  }
};

const ROLES_LIST: { key: Role; icon: typeof GraduationCap }[] = [
  { key: "student/lecturer", icon: GraduationCap },
  { key: "doctor", icon: Stethoscope },
  { key: "admin", icon: UserCog },
];

const ECOSYSTEM_STEPS_LIST = [
  { id: "student", icon: GraduationCap, color: "#7a9e7e" },
  { id: "appointment", icon: CalendarCheck, color: "#c9955a" },
  { id: "emr", icon: Stethoscope, color: "#1f3d3a" },
  { id: "prescription", icon: Pill, color: "#c25d5d" },
  { id: "pharmacy", icon: Package, color: "#d48040" },
  { id: "inventory", icon: Activity, color: "#7a9e7e" },
  { id: "record", icon: History, color: "#c9955a" },
  { id: "audit", icon: ShieldCheck, color: "#1f3d3a" },
];

export default function LandingPage() {
  const router = useRouter();
  const [now, setNow] = useState<Date>(new Date());
  const [mouse, setMouse] = useState({ x: 50, y: 50 });
  const [scrolled, setScrolled] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState<Role>("student/lecturer");
  const [isVisible, setIsVisible] = useState<Record<string, boolean>>({});
  
  // --- BILINGUAL & THEME STATE ---
  const [lang, setLang] = useState<"en" | "ms">("en");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const t = TRANSLATIONS[lang];

  useEffect(() => {
    const c = setInterval(() => setNow(new Date()), 1000);
    const onMove = (e: MouseEvent) => {
      setMouse({ x: (e.clientX / window.innerWidth) * 100, y: (e.clientY / window.innerHeight) * 100 });
    };
    const onScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("scroll", onScroll);

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setIsVisible(prev => ({ ...prev, [entry.target.id]: true }));
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -10% 0px" });

    document.querySelectorAll('section[id]').forEach(section => observer.observe(section));

    return () => { 
      clearInterval(c); 
      window.removeEventListener("mousemove", onMove); 
      window.removeEventListener("scroll", onScroll);
      observer.disconnect();
    };
  }, []);

  // Theme initialization effect
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next = !isDarkMode;
    setIsDarkMode(next);
    if (next) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
    toast(
      next
        ? (lang === "en" ? "Dark mode activated" : "Mod gelap diaktifkan")
        : (lang === "en" ? "Light mode activated" : "Mod cerah diaktifkan")
    );
  };

  const toggleLang = () => {
    const next = lang === "en" ? "ms" : "en";
    setLang(next);
    toast(next === "en" ? "Language set to English" : "Bahasa ditukar ke Melayu");
  };

  return (
    <div className={`relative min-h-screen transition-colors duration-500 bg-[#f7f3ec] text-[#2d2a24] dark:bg-[#0f1f1a] dark:text-[#e8e4da] selection:bg-mint/30 overflow-x-hidden`}>
      <Toaster />

      {/* ===================== NAVIGATION ===================== */}
      <nav className={`fixed top-0 z-[100] w-full transition-all duration-700 ${scrolled ? "bg-white/80 py-3 shadow-2xl backdrop-blur-xl dark:bg-[#0f1f1a]/80" : "bg-transparent py-6"}`}>
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-12">
          <div className="flex items-center gap-3">
            <img src="/images/upnm-logo.png" alt="UPNM" className="h-10 w-10 object-contain drop-shadow-lg" />
            <div>
              <h1 className="font-[Poppins] text-lg font-extrabold tracking-tight text-navy dark:text-white">
                UPNM <span className="bg-gradient-to-r from-cyan to-mint bg-clip-text text-transparent">CMS 2.0</span>
              </h1>
            </div>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            {["Ecosystem", "Roles", "Intelligence", "Security"].map((item) => (
              <button
                key={item}
                onClick={() => document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" })}
                className="text-xs font-bold uppercase tracking-widest text-slate-500 transition-all hover:text-mint hover:tracking-[0.2em] dark:text-slate-400 dark:hover:text-cyan"
              >
                {t.nav[item.toLowerCase() as keyof typeof t.nav]}
              </button>
            ))}

            {/* Language Switcher */}
            <button 
              onClick={toggleLang}
              className="flex items-center gap-2 rounded-full border border-navy/10 bg-navy/5 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest transition-all hover:bg-navy/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Globe className="h-3 w-3 text-mint" />
              {lang === "en" ? "EN" : "BM"}
            </button>

            {/* Theme Toggle */}
            <button 
              onClick={toggleTheme}
              className="grid h-9 w-9 place-items-center rounded-full border border-navy/10 bg-navy/5 transition-all hover:bg-navy/10 dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-navy" />}
            </button>

            <Link
              href="/dashboard"
              className="group relative overflow-hidden rounded-full bg-navy px-8 py-2.5 text-xs font-bold uppercase tracking-widest text-white shadow-xl transition-all hover:scale-105 hover:shadow-navy/40 dark:bg-mint"
            >
              <span className="relative z-10">{t.nav.access}</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover:translate-x-full" />
            </Link>
          </div>
          <button
            className="md:hidden grid h-9 w-9 place-items-center rounded-full border border-navy/10 bg-navy/5 dark:border-white/10 dark:bg-white/5"
            onClick={() => setMobileMenuOpen((v) => !v)}
            aria-label="Toggle menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <CloseIcon className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu panel */}
        {mobileMenuOpen && (
          <div className="md:hidden mx-6 mt-3 flex flex-col gap-2 rounded-3xl border border-navy/10 bg-white/95 p-5 shadow-2xl backdrop-blur-xl dark:border-white/10 dark:bg-[#0f1f1a]/95">
            {["Ecosystem", "Roles", "Intelligence", "Security"].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setMobileMenuOpen(false);
                  document.getElementById(item.toLowerCase())?.scrollIntoView({ behavior: "smooth" });
                }}
                className="rounded-xl px-3 py-3 text-left text-xs font-bold uppercase tracking-widest text-slate-500 hover:bg-navy/5 dark:text-slate-400 dark:hover:bg-white/5"
              >
                {t.nav[item.toLowerCase() as keyof typeof t.nav]}
              </button>
            ))}

            <div className="mt-2 flex items-center gap-3 border-t border-navy/5 pt-4 dark:border-white/5">
              <button
                onClick={toggleLang}
                className="flex flex-1 items-center justify-center gap-2 rounded-full border border-navy/10 bg-navy/5 px-3 py-2.5 text-[11px] font-bold uppercase tracking-widest dark:border-white/10 dark:bg-white/5"
              >
                <Globe className="h-3.5 w-3.5 text-mint" />
                {lang === "en" ? "EN" : "BM"}
              </button>
              <button
                onClick={toggleTheme}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-navy/10 bg-navy/5 dark:border-white/10 dark:bg-white/5"
              >
                {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-navy" />}
              </button>
            </div>

            <Link
              href="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="mt-2 rounded-full bg-navy px-8 py-3 text-center text-xs font-bold uppercase tracking-widest text-white dark:bg-mint"
            >
              {t.nav.access}
            </Link>
          </div>
        )}
      </nav>

      {/* ===================== HERO SECTION ===================== */}
      <section id="hero" className="relative flex min-h-screen items-center justify-center overflow-hidden pt-20">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img 
            src="/images/upnm-campus.png" 
            alt="UPNM Campus" 
            className="h-full w-full object-cover transition-transform duration-[10s] ease-out scale-105" 
            style={{ transform: scrolled ? 'scale(1.1) translateY(20px)' : 'scale(1.05)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f1a]/95 via-[#0f1f1a]/80 to-[#f7f3ec] dark:to-[#0f1f1a] transition-colors duration-500" />
          
          <div
            className="pointer-events-none absolute h-[800px] w-[800px] rounded-full transition-all duration-1000 opacity-40"
            style={{
              left: `${mouse.x}%`,
              top: `${mouse.y}%`,
              transform: "translate(-50%, -50%)",
              background: "radial-gradient(circle, rgba(0,212,255,0.4), transparent 70%)",
              filter: "blur(80px)",
            }}
          />
          <div className="pointer-events-none absolute inset-0 opacity-[0.07]" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,.8) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.8) 1px, transparent 1px)", backgroundSize: "64px 64px" }} />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-6 text-center lg:px-12">
          <div className="flex flex-col items-center">
            <div className="mb-6 animate-fade-in opacity-0" style={{ animationDelay: '200ms', animationFillMode: 'forwards' }}>
              <span className="font-[Poppins] text-xs font-bold uppercase tracking-[0.5em] text-cyan/80">
                {t.hero.motto}
              </span>
            </div>

            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.2em] text-cyan backdrop-blur-md animate-fade-up">
              <Sparkles className="h-3.5 w-3.5" /> {t.hero.badge}
            </div>
            
            <h1 className="font-[Poppins] text-6xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-7xl lg:text-9xl animate-fade-up" style={{ animationDelay: '300ms' }}>
              {t.hero.title_part1} <span className="bg-gradient-to-r from-cyan via-mint to-cyan bg-[length:200%_auto] bg-clip-text text-transparent animated-gradient">{t.hero.title_part2}</span>
            </h1>
            
            <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/60 lg:text-xl animate-fade-up" style={{ animationDelay: '500ms' }}>
              {t.hero.desc}
            </p>
            
            <div className="mt-12 flex flex-wrap items-center justify-center gap-6 animate-fade-up" style={{ animationDelay: '700ms' }}>
              <Link
                href="/dashboard"
                className="group relative flex items-center gap-3 rounded-full bg-gradient-to-r from-cyan to-mint px-10 py-5 font-bold text-navy shadow-2xl transition-all hover:scale-105 hover:shadow-mint/40 active:scale-95"
              >
                {t.hero.btn_access} <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1.5" />
              </Link>
              <button
                onClick={() => document.getElementById("ecosystem")?.scrollIntoView({ behavior: "smooth" })}
                className="flex items-center gap-2 rounded-full border border-white/20 bg-white/5 px-10 py-5 font-bold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:border-white/40"
              >
                {t.hero.btn_workflow}
              </button>
            </div>

            <div className="mt-24 relative w-full max-w-5xl h-[400px] flex items-center justify-center perspective-1000">
              <div className="absolute z-20 w-full max-w-lg rounded-3xl glass p-6 shadow-2xl animate-float transition-all duration-700 hover:scale-[1.02] border-white/20 bg-white/10 backdrop-blur-2xl" style={{ animationDelay: '0s' }}>
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3 text-left">
                    <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-cyan to-mint text-navy">
                      <Cpu className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold uppercase tracking-widest text-cyan">{t.hero.card_ai}</div>
                      <div className="text-sm font-bold text-white">{t.hero.card_morning}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-mono text-sm font-bold text-white">{now.toLocaleTimeString(lang === "en" ? "en-GB" : "ms-MY", { hour: '2-digit', minute: '2-digit' })}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t.hero.card_waiting}</div>
                    <div className="font-mono text-2xl font-extrabold text-mint">04</div>
                  </div>
                  <div className="rounded-2xl bg-white/5 p-4 border border-white/10">
                    <div className="text-[9px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t.hero.card_appt}</div>
                    <div className="font-mono text-2xl font-extrabold text-cyan">12</div>
                  </div>
                </div>
              </div>

              <div className="absolute z-30 left-[-5%] top-[10%] w-64 rounded-2xl glass p-4 shadow-2xl animate-float hidden lg:block border-white/20 bg-white/5 backdrop-blur-xl" style={{ animationDelay: '-2s', transform: 'rotate(-5deg) translateZ(50px)' }}>
                <div className="flex items-center gap-2 mb-2 text-danger">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">{t.hero.card_alert}</span>
                </div>
                <div className="text-[11px] font-bold text-white mb-1">{t.hero.card_alert_title}</div>
                <div className="text-[9px] text-white/60 leading-relaxed text-left">{t.hero.card_alert_desc}</div>
              </div>

              <div className="absolute z-30 right-[-5%] bottom-[10%] w-64 rounded-2xl glass p-4 shadow-2xl animate-float hidden lg:block border-white/20 bg-white/5 backdrop-blur-xl" style={{ animationDelay: '-4s', transform: 'rotate(5deg) translateZ(80px)' }}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="h-1.5 w-1.5 rounded-full bg-mint pulse-dot" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-mint">{t.hero.card_next}</span>
                </div>
                <div className="flex items-center gap-3 text-left">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-mint/20 text-xs font-bold text-mint">#08</div>
                  <div>
                    <div className="text-[11px] font-bold text-white">Ahmad Firdaus</div>
                    <div className="text-[9px] text-white/50">{t.hero.card_wait_est}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce text-white/30">
          <div className="h-12 w-7 rounded-full border-2 border-current p-1">
            <div className="h-3 w-1.5 mx-auto rounded-full bg-current" />
          </div>
        </div>
      </section>

      {/* ===================== ECOSYSTEM SECTION ===================== */}
      <section id="ecosystem" className={`relative py-32 transition-all duration-500 ${isVisible.ecosystem ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="mb-24 text-center">
            <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-mint">{t.ecosystem.badge}</h2>
            <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight text-navy dark:text-white lg:text-6xl">
              {t.ecosystem.title}
            </h3>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-slate-500 dark:text-slate-400">
              {t.ecosystem.desc}
            </p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 hidden h-0.5 w-full -translate-y-1/2 bg-gradient-to-r from-mint/20 via-cyan/20 to-navy/20 lg:block" />
            
            <div className="grid grid-cols-2 gap-8 md:grid-cols-4 lg:grid-cols-8">
              {ECOSYSTEM_STEPS_LIST.map((step, i) => (
                <div key={step.id} className="relative flex flex-col items-center group">
                  <div className={`z-10 grid h-20 w-20 place-items-center rounded-[28px] bg-white shadow-2xl transition-all duration-500 group-hover:-translate-y-3 group-hover:scale-110 group-hover:shadow-mint/20 dark:bg-[#1a2b25] ${i % 2 === 0 ? "lg:mt-12" : "lg:mb-12"}`}>
                    <div className="absolute inset-0 rounded-[28px] opacity-0 transition-opacity group-hover:opacity-100" style={{ background: `radial-gradient(circle at center, ${step.color}22, transparent 70%)` }} />
                    <step.icon className="h-8 w-8 transition-colors duration-500" style={{ color: step.color }} />
                    <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full border-4 border-white bg-mint dark:border-[#1a2b25] pulse-dot" style={{ backgroundColor: step.color }} />
                  </div>
                  <div className={`mt-6 text-center transition-all duration-500 group-hover:scale-105 ${i % 2 === 0 ? "lg:mt-8" : "lg:absolute lg:top-[-100px]"}`}>
                    <div className="text-[12px] font-bold uppercase tracking-widest text-navy dark:text-white">{t.ecosystem.steps[step.id as keyof typeof t.ecosystem.steps]}</div>
                    <div className="mt-2 text-[10px] leading-tight text-slate-400 max-w-[100px]">{t.ecosystem.steps[`${step.id}_desc` as keyof typeof t.ecosystem.steps]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ROLE-BASED EXPERIENCE ===================== */}
      <section id="roles" className={`relative bg-white/40 py-32 dark:bg-black/10 transition-all duration-500 ${isVisible.roles ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="grid grid-cols-1 items-center gap-20 lg:grid-cols-2">
            <div>
              <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-cyan">{t.roles.badge}</h2>
              <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight text-navy dark:text-white lg:text-6xl">
                {t.roles.title}
              </h3>
              
              <div className="mt-16 space-y-6">
                {ROLES_LIST.map((r) => {
                  const active = activeRoleTab === r.key;
                  const Icon = r.icon;
                  return (
                    <button
                      key={r.key}
                      onClick={() => setActiveRoleTab(r.key)}
                      className={`group flex w-full items-start gap-8 rounded-[32px] p-8 text-left transition-all duration-700 ${active ? "bg-white shadow-[0_30px_60px_-15px_rgba(0,0,0,0.08)] dark:bg-[#1a2b25]" : "hover:bg-white/50 dark:hover:bg-white/5"}`}
                    >
                      <div className={`grid h-16 w-16 shrink-0 place-items-center rounded-2xl transition-all duration-700 ${active ? "bg-navy text-white dark:bg-mint shadow-xl shadow-navy/20" : "bg-slate-100 text-slate-400 dark:bg-white/5 group-hover:bg-white"}`}>
                        <Icon className={`h-7 w-7 transition-transform duration-500 ${active ? "scale-110" : "group-hover:rotate-6"}`} />
                      </div>
                      <div>
                        <div className={`text-xl font-bold transition-colors ${active ? "text-navy dark:text-white" : "text-slate-500"}`}>{t.roles[r.key.split('/')[0] as keyof typeof t.roles]}</div>
                        {active && (
                          <div className="animate-fade-up mt-3">
                            <p className="text-base leading-relaxed text-slate-500 dark:text-slate-400">
                              {t.roles[`${r.key.split('/')[0]}_desc` as keyof typeof t.roles]}
                            </p>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="relative group">
              <div className="animate-scale-in relative z-10 overflow-hidden rounded-[40px] bg-white p-10 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.12)] dark:bg-[#1a2b25] min-h-[450px] flex items-center justify-center border border-navy/5 dark:border-white/5 transition-transform duration-700 group-hover:scale-[1.01]">
                {activeRoleTab === "student/lecturer" && (
                  <div className="w-full max-w-sm space-y-8 animate-fade-in">
                    <div className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-navy via-[#2d5551] to-[#2d5551] p-8 text-white shadow-2xl transition-all duration-500 hover:-translate-y-2">
                      <ShieldPlus className="absolute right-[-10%] top-[-10%] h-40 w-40 text-white/5" />
                      <div className="mb-6 text-[10px] font-bold uppercase tracking-[0.3em] text-white/60 text-left">{t.roles.preview_id}</div>
                      <div className="flex items-center gap-5 text-left">
                        <div className="grid h-16 w-16 place-items-center rounded-2xl bg-white/10 text-2xl font-bold ring-1 ring-white/20">AF</div>
                        <div>
                          <div className="font-[Poppins] text-xl font-extrabold">Ahmad Firdaus</div>
                          <div className="font-mono text-xs text-cyan">UPNM-2024-0084</div>
                        </div>
                      </div>
                      <div className="mt-8 flex gap-3">
                        <span className="rounded-full bg-white/10 px-4 py-1.5 text-[11px] font-bold backdrop-blur-md"><Droplet className="inline h-3.5 w-3.5 mr-2 text-danger" /> O+</span>
                        <span className="rounded-full bg-mint/30 px-4 py-1.5 text-[11px] font-bold backdrop-blur-md">{t.roles.preview_fit}</span>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-navy/5 bg-slate-50 p-5 dark:border-white/5 dark:bg-white/5 shadow-sm">
                      <div className="mb-4 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400 text-left">{t.roles.preview_upcoming}</div>
                      <div className="flex items-center gap-4 text-left">
                        <div className="grid h-12 w-12 place-items-center rounded-xl bg-navy/5 text-navy dark:bg-white/5 dark:text-cyan shadow-inner">
                          <CalendarCheck className="h-6 w-6" />
                        </div>
                        <div>
                          <div className="text-sm font-bold">{t.roles.preview_consultation}</div>
                          <div className="text-xs text-slate-400">{t.roles.preview_doctor_time}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === "doctor" && (
                  <div className="w-full max-w-sm space-y-8 animate-fade-in">
                    <div className="rounded-[32px] border border-mint/20 bg-mint/[0.03] p-8 shadow-sm transition-all duration-500 hover:-translate-y-2">
                      <div className="mb-6 flex items-center gap-2">
                        <span className="h-2 w-2 rounded-full bg-mint pulse-dot" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em] text-mint">{t.hero.card_next}</span>
                      </div>
                      <div className="flex items-center gap-5 text-left">
                        <div className="grid h-20 w-20 place-items-center rounded-2xl bg-gradient-to-br from-mint to-cyan text-2xl font-bold text-navy shadow-lg shadow-mint/20">#08</div>
                        <div>
                          <div className="text-xl font-extrabold text-navy dark:text-white">Ahmad Firdaus</div>
                          <div className="text-xs text-slate-400">{t.roles.preview_waiting_mins}</div>
                        </div>
                      </div>
                      <div className="mt-8 grid grid-cols-2 gap-4">
                        <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-white/5 border border-navy/5">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t.roles.preview_vitals}</div>
                          <div className="text-sm font-bold text-navy dark:text-white">{t.roles.preview_normal}</div>
                        </div>
                        <div className="rounded-2xl bg-white p-4 text-center shadow-sm dark:bg-white/5 border border-navy/5">
                          <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">{t.roles.preview_room}</div>
                          <div className="text-sm font-bold text-navy dark:text-white">B2</div>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-2xl border border-cyan/20 bg-cyan/[0.03] p-5 flex gap-5 shadow-sm text-left">
                      <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-cyan/10 text-cyan">
                        <Brain className="h-6 w-6" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-navy dark:text-white">{t.intelligence.feature1}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400">{t.roles.preview_ai_note}</div>
                      </div>
                    </div>
                  </div>
                )}

                {activeRoleTab === "admin" && (
                  <div className="w-full max-w-sm space-y-8 animate-fade-in">
                    <div className="grid grid-cols-2 gap-6">
                      <div className="rounded-[28px] border border-navy/5 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-white/5 transition-all duration-500 hover:-translate-y-2 text-left">
                        <TrendingUp className="mb-6 h-8 w-8 text-mint" />
                        <div className="text-3xl font-extrabold text-navy dark:text-white tracking-tighter">2,847</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{t.roles.preview_kpi_patients}</div>
                      </div>
                      <div className="rounded-[28px] border border-navy/5 bg-white p-8 shadow-sm dark:border-white/5 dark:bg-white/5 transition-all duration-500 hover:-translate-y-2 text-left">
                        <Activity className="mb-6 h-8 w-8 text-cyan" />
                        <div className="text-3xl font-extrabold text-navy dark:text-white tracking-tighter">98.7%</div>
                        <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mt-1">{t.roles.preview_kpi_health}</div>
                      </div>
                    </div>
                    <div className="rounded-[28px] border border-danger/20 bg-danger/[0.03] p-6 shadow-sm text-left">
                      <div className="flex items-center gap-3 mb-4 text-danger">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="text-[11px] font-bold uppercase tracking-[0.3em]">{t.roles.preview_inv_alert}</span>
                      </div>
                      <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-bold text-navy dark:text-white">{t.roles.preview_drug_name}</div>
                        <div className="rounded-full bg-danger/20 px-3 py-1 text-[10px] font-bold text-danger">{t.roles.preview_low_stock}</div>
                      </div>
                      <div className="mt-4 h-2 w-full rounded-full bg-navy/5 dark:bg-white/5 overflow-hidden">
                        <div className="h-full w-[15%] rounded-full bg-danger animate-pulse" />
                      </div>
                      <div className="mt-2 text-right text-[10px] font-bold text-danger">12 {t.roles.preview_remaining}</div>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute top-[-30px] left-[-30px] h-24 w-24 border-l-2 border-t-2 border-navy/10 dark:border-white/10 rounded-tl-[40px] pointer-events-none" />
              <div className="absolute bottom-[-30px] right-[-30px] h-24 w-24 border-r-2 border-b-2 border-navy/10 dark:border-white/10 rounded-br-[40px] pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ===================== INTELLIGENCE & SECURITY ===================== */}
      <section id="intelligence" className={`relative py-32 transition-all duration-500 ${isVisible.intelligence ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-20 lg:flex-row">
            <div className="max-w-xl text-left">
              <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-mint">{t.intelligence.badge}</h2>
              <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight text-navy dark:text-white lg:text-6xl">
                {t.intelligence.title}
              </h3>
              <p className="mt-8 text-lg text-slate-500 dark:text-slate-400 leading-relaxed">
                {t.intelligence.desc}
              </p>
              
              <div className="mt-12 grid grid-cols-1 gap-8 sm:grid-cols-2">
                {[
                  { icon: Sparkles, id: "feature1" },
                  { icon: Activity, id: "feature2" },
                  { icon: Zap, id: "feature3" },
                  { icon: ShieldPlus, id: "feature4" },
                ].map((item, i) => (
                  <div key={i} className="flex gap-5 group">
                    <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint/10 text-mint transition-transform duration-500 group-hover:scale-110 group-hover:bg-mint/20">
                      <item.icon className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="font-bold text-navy dark:text-white text-base">{t.intelligence[item.id as keyof typeof t.intelligence]}</div>
                      <div className="text-sm text-slate-400 mt-1 leading-snug">{t.intelligence[`${item.id}_desc` as keyof typeof t.intelligence]}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative w-full max-w-md rounded-[40px] bg-navy p-10 dark:bg-black/20 overflow-hidden shadow-[0_60px_100px_-20px_rgba(31,61,58,0.4)]">
              <div className="absolute inset-0 bg-gradient-to-br from-cyan/20 via-transparent to-mint/10" />
              <div className="relative z-10 text-left">
                <div className="mb-8 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-cyan to-mint text-navy shadow-lg shadow-cyan/20">
                      <Cpu className="h-7 w-7" />
                    </div>
                    <div className="text-sm font-bold uppercase tracking-[0.2em] text-white">{t.intelligence.engine}</div>
                  </div>
                  <div className="rounded-full bg-cyan/20 px-4 py-1.5 text-[10px] font-bold text-cyan border border-cyan/30">{t.intelligence.monitoring}</div>
                </div>
                <div className="space-y-6">
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-500 hover:bg-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <ShieldPlus className="h-5 w-5 text-cyan" />
                      <div className="text-[11px] font-bold text-cyan uppercase tracking-widest">{t.intelligence.insight_badge}</div>
                    </div>
                    <div className="text-sm leading-relaxed text-white/80">
                      {t.intelligence.insight_desc}
                    </div>
                  </div>
                  <div className="rounded-[24px] border border-white/10 bg-white/5 p-6 backdrop-blur-md transition-all duration-500 hover:bg-white/10">
                    <div className="flex items-center gap-3 mb-3">
                      <Activity className="h-5 w-5 text-mint" />
                      <div className="text-[11px] font-bold text-mint uppercase tracking-widest">{t.intelligence.queue_badge}</div>
                    </div>
                    <div className="text-sm leading-relaxed text-white/80">
                      {t.intelligence.queue_desc}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="security" className={`relative bg-navy py-32 text-white dark:bg-black/20 transition-all duration-500 ${isVisible.security ? 'opacity-100 translate-y-0' : 'opacity-60 translate-y-6'}`}>
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="text-center mb-24">
            <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.4em] text-cyan">{t.security.badge}</h2>
            <h3 className="mt-6 font-[Poppins] text-5xl font-extrabold tracking-tight lg:text-6xl">
              {t.security.title}
            </h3>
            <p className="mx-auto mt-8 max-w-2xl text-lg text-white/50 leading-relaxed">
              {t.security.desc}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-10 md:grid-cols-3">
            {[
              { icon: UserCog, id: "feature1" },
              { icon: Lock, id: "feature2" },
              { icon: ShieldCheck, id: "feature3" },
            ].map((item, i) => (
              <div key={i} className="group rounded-[40px] border border-white/10 bg-white/5 p-10 transition-all duration-700 hover:bg-white/10 hover:-translate-y-3 text-left">
                <div className="mb-8 grid h-16 w-16 place-items-center rounded-2xl bg-cyan/20 text-cyan transition-all duration-500 group-hover:scale-110 group-hover:bg-cyan group-hover:text-navy shadow-xl shadow-cyan/10">
                  <item.icon className="h-8 w-8" />
                </div>
                <h4 className="text-2xl font-bold">{t.security[item.id as keyof typeof t.security]}</h4>
                <p className="mt-6 text-base leading-relaxed text-white/40">{t.security[`${item.id}_desc` as keyof typeof t.security]}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== FINAL CTA SECTION ===================== */}
      <section id="ready" className="relative flex min-h-[80vh] items-center justify-center overflow-hidden py-32">
        <div className="absolute inset-0 z-0 overflow-hidden">
          <img src="/images/upnm-campus.png" alt="UPNM Campus" className="h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0f1f1a]/95 via-[#0f1f1a]/80 to-[#0f1f1a]/95 transition-colors duration-500" />
        </div>

        <div className="relative z-10 mx-auto max-w-4xl px-6 text-center">
          <h2 className="font-[Poppins] text-sm font-bold uppercase tracking-[0.5em] text-mint mb-8">{t.ready.badge}</h2>
          <h3 className="font-[Poppins] text-5xl font-extrabold tracking-tight text-white lg:text-8xl leading-tight">
            {t.ready.title}
          </h3>
          <p className="mt-10 text-xl text-white/60 max-w-2xl mx-auto leading-relaxed">
            {t.ready.desc}
          </p>
          <div className="mt-16 flex flex-col items-center gap-8">
            <Link
              href="/dashboard"
              className="group relative flex items-center gap-4 rounded-full bg-gradient-to-r from-cyan to-mint px-16 py-6 text-xl font-bold text-navy shadow-[0_30px_60px_-15px_rgba(122,158,126,0.6)] transition-all hover:scale-105 hover:shadow-mint/50 active:scale-95"
            >
              {t.ready.btn} <ArrowRight className="h-6 w-6 transition-transform group-hover:translate-x-2" />
            </Link>
            <div className="flex items-center gap-3 text-white/40 text-sm font-bold uppercase tracking-widest">
              <ShieldCheck className="h-5 w-5 text-mint" />
              {t.ready.secure}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white py-20 dark:bg-black/40 border-t border-navy/5 dark:border-white/5 transition-colors duration-500">
        <div className="mx-auto max-w-7xl px-6 lg:px-12">
          <div className="flex flex-col items-center justify-between gap-10 md:flex-row">
            <div className="flex items-center gap-4 text-left">
              <img src="/images/upnm-logo.png" alt="UPNM" className="h-10 w-10 drop-shadow-md" />
              <div>
                <span className="text-lg font-extrabold tracking-tight text-navy dark:text-white">UPNM CMS 2.0</span>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{t.footer.desc}</div>
              </div>
            </div>
            <div className="text-sm text-slate-400 font-medium">
              © {new Date().getFullYear()} {t.footer.rights}
            </div>
            <div className="flex gap-10">
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-mint transition-colors">{t.footer.privacy}</button>
              <button className="text-xs font-bold uppercase tracking-[0.2em] text-slate-400 hover:text-mint transition-colors">{t.footer.terms}</button>
            </div>
          </div>
          <div className="mt-10 pt-10 border-t border-navy/5 dark:border-white/5 text-center">
             <span className="font-[Poppins] text-[10px] font-bold uppercase tracking-[0.8em] text-slate-300 dark:text-white/10">
                {t.hero.motto}
             </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
