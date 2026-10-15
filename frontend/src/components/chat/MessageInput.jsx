import { useEffect, useRef, useState } from "react";
import { Plus, Image as ImageIcon, Send } from "lucide-react";
import toast from "react-hot-toast";
import ImagePreview from "./ImagePreview";
import FileChip from "./FileChip";
import EmojiButton from "./EmojiButton";

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const IMAGE_MAX = 5 * 1024 * 1024;

const DOC_EXTENSIONS = ["pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx", "txt", "csv", "zip"];
const DOC_ACCEPT = DOC_EXTENSIONS.map((e) => `.${e}`).join(",");
const DOC_MAX = 10 * 1024 * 1024;

const MAX_TEXT = 2000;
const extOf = (name = "") => name.split(".").pop().toLowerCase();

export default function MessageInput({ onSend, onSendImage, onSendFile, onTyping }) {
  const [text, setText] = useState("");
  const [image, setImage] = useState(null);
  const [doc, setDoc] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [sending, setSending] = useState(false);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const docRef = useRef(null);

  // make (and clean up) a temporary URL for the photo thumbnail
  useEffect(() => {
    if (!image) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(image);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [image]);

  // puts the emoji where the caret is (or replaces the selected text)
  const insertEmoji = (emoji) => {
    const el = textRef.current;
    const start = el?.selectionStart ?? text.length;
    const end = el?.selectionEnd ?? text.length;
    const next = text.slice(0, start) + emoji + text.slice(end);

    if (next.length > MAX_TEXT) return;

    setText(next);
    onTyping?.();

    // put the caret right after the emoji
    requestAnimationFrame(() => {
      if (!el) return;
      const pos = start + emoji.length;
      el.focus();
      el.setSelectionRange(pos, pos);
    });
  };

  // one attachment at a time: picking a photo replaces a document and the other way around
  const attachImage = (picked) => {
    if (!picked) return;
    if (!IMAGE_TYPES.includes(picked.type)) {
      return toast.error("Only JPG, PNG, WEBP or GIF images are allowed.");
    }
    if (picked.size > IMAGE_MAX) return toast.error("Image is too large (5 MB max).");
    setDoc(null);
    setImage(picked);
  };

  const attachDoc = (picked) => {
    if (!picked) return;
    if (!DOC_EXTENSIONS.includes(extOf(picked.name))) {
      return toast.error("Only PDF, Word, Excel, PowerPoint, TXT, CSV or ZIP files are allowed.");
    }
    if (picked.size > DOC_MAX) return toast.error("File is too large (10 MB max).");
    setImage(null);
    setDoc(picked);
  };

  const pick = (handler) => (e) => {
    const picked = e.target.files?.[0];
    e.target.value = ""; // lets you pick the same file again later
    handler(picked);
  };

  // Ctrl+V with an image on the clipboard attaches it; normal text paste is untouched
  const handlePaste = (e) => {
    const item = [...(e.clipboardData?.items ?? [])].find(
      (i) => i.kind === "file" && i.type.startsWith("image/")
    );
    if (!item) return;

    const pasted = item.getAsFile();
    if (!pasted) return;

    e.preventDefault();
    attachImage(pasted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = text.trim();
    if ((!trimmed && !image && !doc) || sending) return;

    try {
      setSending(true);
      if (image) await onSendImage(image, trimmed);
      else if (doc) await onSendFile(doc, trimmed);
      else await onSend(trimmed);

      setText("");
      setImage(null);
      setDoc(null);
    } catch {
      // the error toast is shown by useMessages; the text and attachment stay in place
    } finally {
      setSending(false);
    }
  };

  const hasAttachment = Boolean(image || doc);

  return (
    <div className="border-t border-line pb-safe">
      {image && (
        <ImagePreview
          src={previewUrl}
          name={image.name}
          disabled={sending}
          onRemove={() => setImage(null)}
        />
      )}
      {doc && <FileChip file={doc} disabled={sending} onRemove={() => setDoc(null)} />}

      <form
        onSubmit={handleSubmit}
        className="flex items-center gap-2 px-3 py-3 sm:gap-3 sm:px-8 sm:py-4"
      >
        <input
          ref={docRef}
          type="file"
          accept={DOC_ACCEPT}
          onChange={pick(attachDoc)}
          className="hidden"
        />
        <button
          type="button"
          aria-label="Attach file"
          disabled={sending}
          onClick={() => docRef.current?.click()}
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-hover transition-colors hover:text-white disabled:opacity-60 sm:h-12 sm:w-12 ${
            doc ? "text-blue-400" : "text-gray-300"
          }`}
        >
          <Plus size={22} />
        </button>

        <div className="flex min-w-0 flex-1 items-center gap-2 rounded-xl border border-line bg-panel px-3 py-2.5 sm:gap-3 sm:px-4 sm:py-3">
          <input
            ref={textRef}
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (e.target.value) onTyping?.();
            }}
            onPaste={handlePaste}
            maxLength={MAX_TEXT}
            placeholder={hasAttachment ? "Add a caption..." : "Type a message..."}
            // 16px on phones stops iPhones from zooming the page when you tap the box
            className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-muted sm:text-[15px]"
          />

          <EmojiButton onPick={insertEmoji} disabled={sending} />

          <input
            ref={imageRef}
            type="file"
            accept={IMAGE_TYPES.join(",")}
            onChange={pick(attachImage)}
            className="hidden"
          />
          <button
            type="button"
            aria-label="Attach image"
            disabled={sending}
            onClick={() => imageRef.current?.click()}
            className={`p-1 transition-colors hover:text-white disabled:opacity-60 ${
              image ? "text-blue-400" : "text-muted"
            }`}
          >
            <ImageIcon size={22} />
          </button>
        </div>

        <button
          type="submit"
          disabled={sending}
          aria-label="Send"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent text-white shadow-lg shadow-blue-500/30 transition-colors hover:bg-blue-500 disabled:opacity-60 sm:h-12 sm:w-12"
        >
          <Send size={20} />
        </button>
      </form>
    </div>
  );
}