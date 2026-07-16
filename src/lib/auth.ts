import type { Zone } from "./types";

const STORAGE_KEY = "urvox.citizen";

export type CitizenSession = {
  name: string;
  zone: Zone;
};

export function getSession(): CitizenSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed.name === "string" &&
      (parsed.zone === "A" || parsed.zone === "B")
    ) {
      return parsed as CitizenSession;
    }
    return null;
  } catch {
    return null;
  }
}

export function setSession(session: CitizenSession) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function clearSession() {
  window.localStorage.removeItem(STORAGE_KEY);
}
