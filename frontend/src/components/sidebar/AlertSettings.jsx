import { Bell, BellOff, Volume2, VolumeX } from "lucide-react";
import toast from "react-hot-toast";
import { useAlertSettings, updateAlertSettings } from "../../utils/alertSettings";
import { playPing, unlockAudio } from "../../utils/sound";

const supported = typeof window !== "undefined" && "Notification" in window;

function Pill({ active, onClick, label, OnIcon, OffIcon }) {
  const Icon = active ? OnIcon : OffIcon;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`flex flex-1 items-center justify-center gap-2 rounded-xl border px-3 py-2 text-sm transition-colors ${
        active
          ? "border-accent bg-accent/15 text-blue-300"
          : "border-line text-muted hover:bg-hover hover:text-white"
      }`}
    >
      <Icon size={17} />
      {label}
    </button>
  );
}

export default function AlertSettings() {
  const { sound, desktop } = useAlertSettings();
  const permission = supported ? Notification.permission : "denied";
  const desktopOn = desktop && permission === "granted";

  const toggleSound = () => {
    unlockAudio();
    const next = !sound;
    updateAlertSettings({ sound: next });
    if (next) playPing(true); // preview, so you know what it sounds like
  };

  const toggleDesktop = async () => {
    if (!supported) {
      return toast.error("This browser doesn't support desktop notifications.");
    }
    if (desktopOn) return updateAlertSettings({ desktop: false });

    let result = Notification.permission;
    if (result === "default") {
      try {
        result = await Notification.requestPermission(); // must happen inside this click
      } catch {
        result = "denied";
      }
    }

    if (result !== "granted") {
      updateAlertSettings({ desktop: false });
      return toast.error(
        "Notifications are blocked. Allow them with the lock icon next to the address bar, then try again."
      );
    }

    updateAlertSettings({ desktop: true });
    try {
      new Notification("Desktop alerts are on", {
        body: "You'll be notified when a message arrives while ChatRamel is in the background.",
        silent: true,
      });
    } catch {
      // ignore
    }
  };

  return (
    <div className="flex gap-2 border-t border-line px-4 py-3">
      <Pill active={desktopOn} onClick={toggleDesktop} label="Alerts" OnIcon={Bell} OffIcon={BellOff} />
      <Pill active={sound} onClick={toggleSound} label="Sound" OnIcon={Volume2} OffIcon={VolumeX} />
    </div>
  );
}