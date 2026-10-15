import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { Smile, Loader2 } from "lucide-react";
import useMediaQuery from "../../hooks/useMediaQuery";
import { PICKER_THEME } from "../../utils/reactions";

// loaded only the first time the button is clicked
const EmojiPicker = lazy(() => import("emoji-picker-react"));

export default function EmojiButton({ onPick, disabled }) {
  const [open, setOpen] = useState(false);
  const narrow = useMediaQuery("(max-width: 639px)");
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
        className={`p-1 transition-colors hover:text-white disabled:opacity-60 ${
          open ? "text-blue-400" : "text-muted"
        }`}
      >
        <Smile size={22} />
      </button>

      {open && (
        <div className="fixed inset-x-2 bottom-24 z-40 overflow-hidden rounded-2xl shadow-2xl shadow-black/50 sm:absolute sm:inset-x-auto sm:bottom-full sm:right-0 sm:mb-4">
          <Suspense
            fallback={
              <div className="flex h-[340px] w-full items-center justify-center rounded-2xl border border-line bg-panel text-muted sm:h-[380px] sm:w-[320px]">
                <Loader2 className="animate-spin" size={26} />
              </div>
            }
          >
            <EmojiPicker
              theme="dark"
              emojiStyle="native"
              width={narrow ? "100%" : 320}
              height={narrow ? 340 : 380}
              lazyLoadEmojis
              skinTonesDisabled
              searchPlaceHolder="Search emoji"
              previewConfig={{ showPreview: false }}
              style={PICKER_THEME}
              // the picker stays open, so you can add several emoji in a row
              onEmojiClick={(data) => onPick(data.emoji)}
            />
          </Suspense>
        </div>
      )}
    </div>
  );
}