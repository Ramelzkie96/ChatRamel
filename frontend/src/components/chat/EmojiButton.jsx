import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Smile, Loader2 } from "lucide-react";

// loaded only the first time the button is clicked
const EmojiPicker = lazy(() => import("emoji-picker-react"));

const THEME_VARS = {
  "--epr-bg-color": "#0b1226",
  "--epr-category-label-bg-color": "#0b1226",
  "--epr-picker-border-color": "#1a2340",
  "--epr-search-border-color": "#1a2340",
  "--epr-search-input-bg-color": "#0a1226",
  "--epr-hover-bg-color": "#121b34",
  "--epr-focus-bg-color": "#121b34",
  "--epr-text-color": "#d1d5db",
  "--epr-highlight-color": "#2563eb",
};

export default function EmojiButton({ onPick, disabled }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  // close on outside click or Esc
  useEffect(() => {
    if (!open) return;

    const onDown = (e) => {
      if (!wrapRef.current?.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative flex">
      <button
        type="button"
        aria-label="Emoji"
        aria-expanded={open}
        disabled={disabled}
        // keeps the caret in the text box when you click the button
        onMouseDown={(e) => e.preventDefault()}
        onClick={() => setOpen((v) => !v)}
        className={`transition-colors hover:text-white disabled:opacity-60 ${
          open ? "text-blue-400" : "text-muted"
        }`}
      >
        <Smile size={22} />
      </button>

      {open && (
        <div className="absolute bottom-full right-0 z-40 mb-4 overflow-hidden rounded-2xl shadow-2xl shadow-black/50">
          <Suspense
            fallback={
              <div className="flex h-[380px] w-[320px] items-center justify-center rounded-2xl border border-line bg-panel text-muted">
                <Loader2 className="animate-spin" size={26} />
              </div>
            }
          >
            <EmojiPicker
              theme="dark"
              emojiStyle="native"
              width={320}
              height={380}
              lazyLoadEmojis
              skinTonesDisabled
              searchPlaceHolder="Search emoji"
              previewConfig={{ showPreview: false }}
              style={THEME_VARS}
              // the picker stays open, so you can add several emoji in a row
              onEmojiClick={(data) => onPick(data.emoji)}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}