import { db } from "@/db";
import {
  users,
  patients,
  appointments,
  prescriptions,
  labResults,
  inventory,
  activities,
} from "@/db/schema";
import { sql } from "drizzle-orm";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";

const DEPARTMENTS = ["General", "Dental", "Mental Health", "Emergency"];
const BLOOD = ["O+", "A+", "B+", "AB+", "O-", "A-"];
const FIRST = [
  "Ahmad", "Nurul", "Faiz", "Aina", "Hakim", "Siti", "Iman", "Zul",
  "Farah", "Danial", "Aisha", "Rizal", "Liyana", "Amir", "Nadia", "Haziq",
];
const LAST = [
  "Ismail", "Rahman", "Yusof", "Karim", "Halim", "Osman", "Latif", "Salleh",
];

function rand<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function tableCount(name: string): Promise<number> {
  const res = await db.execute(sql.raw(`select count(*)::int as c from ${name}`));
  const rows = res.rows as Array<{ c: number }>;
  return Number(rows?.[0]?.c ?? 0);
}

export async function POST() {
  const existing = await tableCount("users");
  if (existing > 0) {
    return Response.json({ ok: true, seeded: false, message: "Already seeded" });
  }

  const hash = await bcrypt.hash("password123", 10);
  await db.insert(users).values([
    { name: "Ahmad Firdaus", email: "student@upnm.edu.my", password: hash, role: "student/lecturer", avatarColor: "#00D4FF" },
    { name: "Dr. Aisyah Karim", email: "doctor@upnm.edu.my", password: hash, role: "doctor", avatarColor: "#2ECC8F", specialization: "General Medicine" },
    { name: "Admin Zulkifli", email: "admin@upnm.edu.my", password: hash, role: "admin", avatarColor: "#1B3A6B" },
  ]);

  const patientRows = [];
  for (let i = 0; i < 42; i++) {
    const name = `${rand(FIRST)} ${rand(LAST)}`;
    const daysAgo = Math.floor(Math.random() * 40);
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    patientRows.push({
      patientCode: `UPNM-${String(2024000 + i).padStart(7, "0")}`,
      name,
      age: 18 + Math.floor(Math.random() * 12),
      gender: Math.random() > 0.4 ? "Male" : "Female",
      bloodType: rand(BLOOD),
      department: rand(DEPARTMENTS),
      status: rand(["Active", "Active", "Active", "Inactive", "Critical"]),
      phone: `01${Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 8999999)}`,
      email: name.toLowerCase().replace(/\s/g, ".") + "@student.upnm.edu.my",
      allergies: rand(["None", "Penicillin", "Peanuts", "None", "Dust, Pollen"]),
      chronicConditions: rand(["None", "Asthma", "None", "Hypertension", "None"]),
      emergencyContact: `${rand(FIRST)} ${rand(LAST)} — 01${Math.floor(Math.random() * 9)}-${Math.floor(1000000 + Math.random() * 8999999)}`,
      healthScore: 55 + Math.floor(Math.random() * 45),
      lastVisit: d.toISOString().slice(0, 10),
    });
  }
  const insertedPatients = await db.insert(patients).values(patientRows).returning();

  const doctors = ["Dr. Aisyah Karim", "Dr. Hakim Rashid", "Dr. Lim Wei", "Dr. Siti Aminah"];
  const times = ["08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00", "14:00", "14:30", "15:00", "16:00"];
  const apptRows = [];
  const today = new Date().toISOString().slice(0, 10);
  let q = 1;
  for (let i = 0; i < 26; i++) {
    const p = rand(insertedPatients);
    const offset = Math.floor(Math.random() * 14) - 4;
    const dt = new Date();
    dt.setDate(dt.getDate() + offset);
    const dstr = dt.toISOString().slice(0, 10);
    const isToday = dstr === today;
    apptRows.push({
      patientId: p.id,
      patientName: p.name,
      doctorName: rand(doctors),
      department: rand(DEPARTMENTS),
      date: dstr,
      time: rand(times),
      status: isToday
        ? rand(["Waiting", "In Consultation", "Scheduled", "Done"])
        : offset < 0
          ? "Done"
          : "Scheduled",
      urgency: rand(["Routine", "Routine", "Soon", "Emergency"]),
      symptoms: rand(["Fever and cough", "Headache", "Dental pain", "Anxiety", "Sprained ankle", "Sore throat"]),
      queueNumber: isToday ? q++ : null,
    });
  }
  await db.insert(appointments).values(apptRows);

  const meds = [
    { name: "Paracetamol 500mg", dose: "1 tab", freq: "TDS", duration: "5 days" },
    { name: "Amoxicillin 250mg", dose: "1 cap", freq: "BD", duration: "7 days" },
    { name: "Ibuprofen 400mg", dose: "1 tab", freq: "TDS", duration: "3 days" },
    { name: "Cetirizine 10mg", dose: "1 tab", freq: "OD", duration: "7 days" },
  ];
  const rxRows = [];
  for (let i = 0; i < 14; i++) {
    const p = rand(insertedPatients);
    rxRows.push({
      patientId: p.id,
      patientName: p.name,
      doctorName: rand(doctors),
      medications: [rand(meds), rand(meds)],
      status: rand(["Pending", "Pending", "Dispensing", "Collected"]),
      notes: "Take after meals. Complete full course.",
    });
  }
  await db.insert(prescriptions).values(rxRows);

  const labDefs = [
    { testName: "Hemoglobin", unit: "g/dL", referenceRange: "13.5-17.5", low: 10, high: 19 },
    { testName: "Fasting Glucose", unit: "mmol/L", referenceRange: "3.9-5.5", low: 3, high: 9 },
    { testName: "Total Cholesterol", unit: "mmol/L", referenceRange: "<5.2", low: 3, high: 7 },
    { testName: "White Blood Cell", unit: "10^9/L", referenceRange: "4.0-11.0", low: 2, high: 16 },
  ];
  const labRows = [];
  for (let i = 0; i < 20; i++) {
    const p = rand(insertedPatients);
    const def = rand(labDefs);
    const val = (def.low + Math.random() * (def.high - def.low)).toFixed(1);
    const num = parseFloat(val);
    const flag =
      num > def.high * 0.82 ? "High" : num < def.low * 1.2 ? "Low" : "Normal";
    labRows.push({
      patientId: p.id,
      patientName: p.name,
      testName: def.testName,
      value: val,
      unit: def.unit,
      referenceRange: def.referenceRange,
      flag: rand(["Normal", "Normal", flag]),
    });
  }
  await db.insert(labResults).values(labRows);

  await db.insert(inventory).values([
    { name: "Paracetamol 500mg", category: "Analgesic", stock: 420, minStock: 100, unit: "tablets" },
    { name: "Amoxicillin 250mg", category: "Antibiotic", stock: 45, minStock: 80, unit: "capsules" },
    { name: "Ibuprofen 400mg", category: "NSAID", stock: 210, minStock: 100, unit: "tablets" },
    { name: "Cetirizine 10mg", category: "Antihistamine", stock: 18, minStock: 50, unit: "tablets" },
    { name: "Salbutamol Inhaler", category: "Bronchodilator", stock: 12, minStock: 20, unit: "units" },
    { name: "Surgical Masks", category: "PPE", stock: 1200, minStock: 300, unit: "pieces" },
    { name: "Insulin Glargine", category: "Antidiabetic", stock: 8, minStock: 15, unit: "vials" },
    { name: "Bandage Rolls", category: "Consumable", stock: 340, minStock: 100, unit: "rolls" },
  ]);

  const actRows = [];
  const actions = [
    "checked in for consultation",
    "completed appointment with Dr. Aisyah",
    "prescription dispensed",
    "lab result ready",
    "registered as new patient",
    "vital signs recorded",
  ];
  for (let i = 0; i < 12; i++) {
    const p = rand(insertedPatients);
    actRows.push({
      patientName: p.name,
      action: rand(actions),
      urgency: rand(["normal", "normal", "warning", "critical"]),
    });
  }
  await db.insert(activities).values(actRows);

  // Medical certificates
  const { medicalCertificates } = await import("@/db/schema");
  const mcRows = [];
  const dxOptions = [
    "Acute viral fever", "Upper respiratory tract infection",
    "Gastroenteritis", "Muscle strain", "Migraine",
    "Tonsillitis", "Sprained ankle", "Food poisoning",
  ];
  for (let i = 0; i < 6; i++) {
    const p = rand(insertedPatients);
    const days = 1 + Math.floor(Math.random() * 4);
    const start = new Date();
    start.setDate(start.getDate() - (i * 7 + Math.floor(Math.random() * 5)));
    const end = new Date(start);
    end.setDate(end.getDate() + days - 1);
    mcRows.push({
      patientId: p.id,
      patientName: p.name,
      patientCode: p.patientCode,
      doctorName: rand(doctors),
      diagnosis: rand(dxOptions),
      reason: "Recommended rest due to medical condition.",
      startDate: start.toISOString().slice(0, 10),
      endDate: end.toISOString().slice(0, 10),
      days,
      status: i === 0 ? "Active" : "Expired",
      certificateNo: `UPNM/MC/${new Date().getFullYear()}/${String(1000 + i)}`,
      notes: "Patient advised to rest and hydrate. Follow-up if symptoms persist.",
    });
  }
  await db.insert(medicalCertificates).values(mcRows);

  return Response.json({ ok: true, seeded: true });
}
