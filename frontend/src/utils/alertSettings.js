import { useSyncExternalStore } from "react";

const KEY = "chatramel_alerts";

const read = () => {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY));
    return { sound: raw?.sound !== false, desktop: raw?.desktop === true };
  } catch {
    return { sound: true, desktop: false };
  }
};

let state = read();
const listeners = new Set();

const subscribe = (cb) => {
  listeners.add(cb);
  return () => listeners.delete(cb);
};

export const getAlertSettings = () => state;

export function updateAlertSettings(patch) {
  state = { ...state, ...patch };
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // storage blocked: the setting still works until the page reloads
  }
  listeners.forEach((l) => l());
}

export const useAlertSettings = () => useSyncExternalStore(subscribe, getAlertSettings);