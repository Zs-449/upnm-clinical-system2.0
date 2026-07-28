"use client";

import { useEffect, useState, useCallback } from "react";

export function useApi<T>(url: string, refreshMs?: number) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error();
      const json = await res.json();
      setData(json);
      setError(false);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => {
    load();
    if (refreshMs) {
      const iv = setInterval(load, refreshMs);
      return () => clearInterval(iv);
    }
  }, [load, refreshMs]);

  return { data, loading, error, reload: load };
}
