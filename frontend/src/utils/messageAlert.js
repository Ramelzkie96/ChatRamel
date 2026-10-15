import { playPing } from "./sound";
import { getAlertSettings } from "./alertSettings";
import { assetUrl } from "./api";

const firstName = (n = "") => n.split(" ")[0];

const previewOf = (m) => {
  if (m.image) return m.text ? `📷 ${m.text}` : "📷 Photo";
  if (m.file?.name) return `📎 ${m.text || m.file.name}`;
  return m.text || "";
};

const clip = (s, max = 120) => (s.length > max ? `${s.slice(0, max)}…` : s);

// message: the live message:new payload, chat: my copy of that chat,
// viewing: that chat is open in a visible tab, onOpen: opens the chat
export function alertNewMessage({ message, chat, viewing, onOpen }) {
  if (!chat || message.type === "system") return;
  if (viewing) return; // you can already see it

  const settings = getAlertSettings();
  if (settings.sound) playPing();

  const tabActive = document.visibilityState === "visible" && document.hasFocus();
  const canNotify =
    settings.desktop && "Notification" in window && Notification.permission === "granted";
  if (!canNotify || tabActive) return;

  const sender = message.sender?.name ?? "Someone";
  const preview = previewOf(message);
  const icon = chat.isGroup ? assetUrl(chat.cover) : assetUrl(message.sender?.avatar);

  try {
    const n = new Notification(chat.isGroup ? chat.name : sender, {
      body: clip(chat.isGroup ? `${firstName(sender)}: ${preview}` : preview),
      tag: `chat-${chat._id}`, // newer messages from the same chat replace the old one
      renotify: true,
      silent: true, // we play our own sound, so the system doesn't double it
      ...(icon ? { icon } : {}),
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