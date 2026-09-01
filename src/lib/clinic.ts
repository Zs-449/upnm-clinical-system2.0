// Shared clinic reference data — single source of truth for the department /
// doctor / slot lists used by both the Appointments booking page and the
// MediBot conversational booking flow, so the two can never drift apart.

export interface Department {
  name: string;
  desc: string;
  color: string;
}

export interface Doctor {
  name: string;
  spec: string;
  rating: number;
  department: string;
}

export const DEPTS: Department[] = [
  { name: "General", desc: "Fever, cough, general checkup", color: "#1f3d3a" },
  { name: "Dental", desc: "Toothache, cleaning, oral care", color: "#7a9e7e" },
  { name: "Mental Health", desc: "Counselling & wellbeing", color: "#c9955a" },
  { name: "Emergency", desc: "Urgent medical attention", color: "#c25d5d" },
];

export const DOCTORS: Doctor[] = [
  { name: "Dr. Aisyah Karim", spec: "General Medicine", rating: 4.9, department: "General" },
  { name: "Dr. Hakim Rashid", spec: "Dental Surgery", rating: 4.7, department: "Dental" },
  { name: "Dr. Lim Wei", spec: "Psychiatry", rating: 4.8, department: "Mental Health" },
  { name: "Dr. Siti Aminah", spec: "Emergency Med", rating: 4.9, department: "Emergency" },
];

export const SLOTS = [
  "08:00", "08:30", "09:00", "09:30", "10:00", "10:30", "11:00",
  "14:00", "14:30", "15:00", "15:30", "16:00",
];

export const DEPT_COLORS: Record<string, string> = Object.fromEntries(
  DEPTS.map((d) => [d.name, d.color])
);

export function doctorForDepartment(department: string): Doctor | undefined {
  return DOCTORS.find((d) => d.department === department);
}

// Morning = before 12:00, Afternoon = 12:00 and later (matches the 08:00-11:00 /
// 14:00-16:00 slot bands above).
export function slotsForPeriod(period: "morning" | "afternoon" | "any"): string[] {
  if (period === "morning") return SLOTS.filter((s) => s < "12:00");
  if (period === "afternoon") return SLOTS.filter((s) => s >= "12:00");
  return SLOTS;
}
