import { Suspense, lazy, useEffect, useRef, useState } from "react";
import { SmilePlus, Plus, Loader2 } from "lucide-react";
import Modal from "../ui/Modal";
import { QUICK_REACTIONS, PICKER_THEME } from "../../utils/reactions";

// loaded only the first time someone opens the full picker
const EmojiPicker = lazy(() => import("emoji-picker-react"));

const BAR_WIDTH = 304;

// myEmoji: the emoji I already reacted with (highlighted), onPick(emoji): called with the chosen emoji
export default function ReactionPicker({ myEmoji, onPick }) {
  const [open, setOpen] = useState(false);
  const [full, setFull] = useState(false);
  const [pos, setPos] = useState(null);
  const btnRef = useRef(null);
  const barRef = useRef(null);

  const toggle = () => {
    if (open) return setOpen(false);

    // fixed position, so the bar is never cut off by the scrolling message list
    const r = btnRef.current.getBoundingClientRect();
    const above = r.top > 70;
    const left = Math.min(
      Math.max(8, r.left + r.width / 2 - BAR_WIDTH / 2),
      window.innerWidth - BAR_WIDTH - 8
    );
    setPos({ above, left, top: above ? r.top - 8 : r.bottom + 8 });
    setOpen(true);
  };

  // close on outside click, Esc, scrolling or resizing
  useEffect(() => {
    if (!open) return;

    const close = () => setOpen(false);
    const onDown = (e) => {
      if (btnRef.current?.contains(e.target) || barRef.current?.contains(e.target)) return;
      close();
    };
    const onKey = (e) => e.key === "Escape" && close();

    document.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", close, true);
    window.addEventListener("resize", close);
    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", close, true);
      window.removeEventListener("resize", close);
    };
  }, [open]);

  const choose = (emoji) => {
    setOpen(false);
    setFull(false);
    onPick(emoji);
  };

  return (
    <>
      <button
        ref={btnRef}
        type="button"
        onClick={toggle}
        aria-label="React to message"
        aria-expanded={open}
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-hover text-muted transition-opacity hover:text-white ${
          open
            ? "opacity-100"
            : "opacity-0 focus:opacity-100 group-hover:opacity-100 [@media(hover:none)]:opacity-100"
        }`}
      >
        <SmilePlus size={17} />
      </button>

      {open && pos && (
        <div
          ref={barRef}
          role="menu"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: BAR_WIDTH,
            transform: pos.above ? "translateY(-100%)" : undefined,
          }}
          className="z-40 flex items-center justify-between rounded-full border border-line bg-panel px-2 py-1.5 shadow-2xl shadow-black/50"
        >
          {QUICK_REACTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() => choose(emoji)}
              aria-label={`React with ${emoji}`}
              aria-pressed={myEmoji === emoji}
              className={`flex h-9 w-9 items-center justify-center rounded-full text-xl transition-transform hover:scale-125 ${
                myEmoji === emoji ? "bg-accent/30" : "hover:bg-hover"
              }`}
            >
              {emoji}
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setOpen(false);
              setFull(true);
            }}
            aria-label="More emoji"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-hover text-gray-300 transition-colors hover:text-white"
          >
            <Plus size={18} />
          </button>
        </div>
      )}

      {full && (
        <Modal title="Pick a reaction" onClose={() => setFull(false)}>
          <div className="flex justify-center">
            <Suspense
              fallback={
                <div className="flex h-[380px] w-full items-center justify-center text-muted">
                  <Loader2 className="animate-spin" size={26} />
                </div>
              }
            >
              <EmojiPicker
                theme="dark"
                emojiStyle="native"
                width="100%"
                height={380}
                lazyLoadEmojis
                searchPlaceHolder="Search emoji"
                previewConfig={{ showPreview: false }}
                style={PICKER_THEME}
                onEmojiClick={(data) => choose(data.emoji)}
              />
            </Suspense>
          </div>
        </Modal>
      )}
    </>
  );
}