"use client";

export function toggleTheme(): "dark" | "light" {
  const isDark = document.documentElement.classList.toggle("dark");
  try {
    localStorage.theme = isDark ? "dark" : "light";
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("themechange"));
  return isDark ? "dark" : "light";
}

export function getTheme(): "dark" | "light" {
  if (typeof document === "undefined") return "light";
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
