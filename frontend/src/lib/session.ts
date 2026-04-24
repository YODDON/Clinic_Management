import type { LoginResponse } from "@/types/api";

export type Session = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  user: LoginResponse["user"];
};

const STORAGE_KEY = "dentalpro.session";
const listeners = new Set<() => void>();
let cachedSession: Session | null | undefined;

function canUseStorage() {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function readSessionFromStorage(): Session | null {
  if (!canUseStorage()) return null;

  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as Session;
  } catch {
    window.localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function notify() {
  for (const listener of listeners) {
    listener();
  }
}

export function getSession(): Session | null {
  if (cachedSession === undefined) {
    cachedSession = readSessionFromStorage();
  }

  return cachedSession;
}

export function setSession(payload: LoginResponse) {
  if (!canUseStorage()) return;

  const session: Session = {
    accessToken: payload.accessToken || payload.token,
    tokenType: payload.tokenType || "Bearer",
    expiresIn: payload.expiresIn,
    user: payload.user,
  };

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  cachedSession = session;
  notify();
}

export function clearSession() {
  if (!canUseStorage()) return;

  window.localStorage.removeItem(STORAGE_KEY);
  cachedSession = null;
  notify();
}

export function subscribeSession(listener: () => void) {
  if (listeners.size === 0 && canUseStorage()) {
    window.addEventListener("storage", handleStorageChange);
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);

    if (listeners.size === 0 && canUseStorage()) {
      window.removeEventListener("storage", handleStorageChange);
    }
  };
}

function handleStorageChange(event: StorageEvent) {
  if (event.key !== STORAGE_KEY) return;

  cachedSession = readSessionFromStorage();
  notify();
}
