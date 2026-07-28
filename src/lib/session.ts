"use client";

export type Role = "student/lecturer" | "doctor" | "admin";

export interface SessionUser {
  id: number;
  name: string;
  email: string;
  role: Role;
  avatarColor: string;
  specialization?: string | null;
}

const KEY = "upnm_scs_session";
const INACTIVITY_MS = 15 * 60 * 1000; // 15 minutes

export function saveSession(user: SessionUser) {
  try {
    localStorage.setItem(
      KEY,
      JSON.stringify({ user, ts: Date.now() })
    );
  } catch {
    /* ignore */
  }
}

export function getSession(): SessionUser | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    // 15 min inactivity auto-logout
    if (Date.now() - parsed.ts > INACTIVITY_MS) {
      localStorage.removeItem(KEY);
      return null;
    }
    return parsed.user as SessionUser;
  } catch {
    return null;
  }
}

export function touchSession() {
  const u = getSession();
  if (u) saveSession(u);
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export const roleLabels: Record<Role, string> = {
  "student/lecturer": "Student / Lecturer",
  doctor: "Medical Officer",
  admin: "Administrator & Pharmacy",
};
