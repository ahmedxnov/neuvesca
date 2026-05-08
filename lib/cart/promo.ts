"use client";

const KEY = "neuvesca:promo";

export type StoredPromo = {
  id: string;
  code: string;
  percent: number;
};

export function readStoredPromo(): StoredPromo | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.id === "string" &&
      typeof parsed.code === "string" &&
      typeof parsed.percent === "number"
    ) {
      return parsed;
    }
  } catch {
    /* ignore */
  }
  return null;
}

export function writeStoredPromo(promo: StoredPromo | null) {
  if (typeof window === "undefined") return;
  if (promo) {
    window.sessionStorage.setItem(KEY, JSON.stringify(promo));
  } else {
    window.sessionStorage.removeItem(KEY);
  }
}
