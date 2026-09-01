import { DOCTORS, SLOTS, slotsForPeriod, type Doctor } from "@/lib/clinic";

export interface AppointmentLike {
  doctorName: string;
  date: string;
  time: string;
  status: string;
}

export interface DoctorAvailability extends Doctor {
  available: boolean;
  slots: string[];
}

export function isValidDateString(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function isClinicOpen(date: string): boolean {
  if (!isValidDateString(date)) return false;
  const weekday = new Date(`${date}T12:00:00Z`).getUTCDay();
  return weekday >= 1 && weekday <= 5;
}

export function doctorByName(name: string): Doctor | undefined {
  return DOCTORS.find((doctor) => doctor.name === name);
}

export function getAvailableSlots(
  date: string,
  doctorName: string,
  appointments: AppointmentLike[],
  period: "morning" | "afternoon" | "any" = "any",
): string[] {
  if (!isClinicOpen(date) || !doctorByName(doctorName)) return [];
  const taken = new Set(
    appointments
      .filter((appointment) => appointment.doctorName === doctorName && appointment.date === date && appointment.status !== "Cancelled")
      .map((appointment) => appointment.time),
  );
  return slotsForPeriod(period).filter((slot) => !taken.has(slot));
}

export function buildAvailability(
  date: string,
  appointments: AppointmentLike[],
  department?: string,
  doctorName?: string,
  period: "morning" | "afternoon" | "any" = "any",
): DoctorAvailability[] {
  return DOCTORS
    .filter((doctor) => (!department || doctor.department === department) && (!doctorName || doctor.name === doctorName))
    .map((doctor) => {
      const slots = getAvailableSlots(date, doctor.name, appointments, period);
      return { ...doctor, available: slots.length > 0, slots };
    });
}

export function isBookableSlot(
  date: string,
  doctorName: string,
  time: string,
  appointments: AppointmentLike[],
): boolean {
  return SLOTS.includes(time) && getAvailableSlots(date, doctorName, appointments).includes(time);
}
