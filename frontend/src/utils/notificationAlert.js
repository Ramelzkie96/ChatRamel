import toast from "react-hot-toast";
import { playPing } from "./sound";
import { getAlertSettings } from "./alertSettings";

// these already show their own toast somewhere else (call screen / chat list)
const TOASTED_ELSEWHERE = new Set(["missed_call", "group_added", "group_removed"]);

// notification: the live notification:new payload, onOpen: opens the related chat
export function alertNotification({ notification, onOpen }) {
  const settings = getAlertSettings();
  if (settings.sound) playPing();

  const tabActive = document.visibilityState === "visible" && document.hasFocus();

  if (tabActive) {
    if (!TOASTED_ELSEWHERE.has(notification.type)) toast(notification.text);
    return;
  }

  const canNotify =
    settings.desktop && "Notification" in window && Notification.permission === "granted";
  if (!canNotify) return;

  try {
    const n = new Notification("ChatRamel", {
      body: notification.text,
      tag: `notif-${notification._id}`,
      silent: true, // we play our own sound
    });

    n.onclick = () => {
      window.focus();
      onOpen();
      n.close();
    };
    setTimeout(() => n.close(), 6000);
  } catch {
    // some browsers refuse to create notifications from the page; the sound still played
  }
}