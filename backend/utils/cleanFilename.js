import path from "path";

// multer may hand us UTF-8 names decoded as latin1; fix that when it's safe to
const fromLatin1 = (name) => {
  if ([...name].some((ch) => ch.charCodeAt(0) > 255)) return name; // already real unicode
  const decoded = Buffer.from(name, "latin1").toString("utf8");
  return decoded.includes("\uFFFD") ? name : decoded;
};

// The cleaned name is only used for display and the download name.
// The file on disk always has a random name.
export default function cleanFilename(raw = "file") {
  const base = path.basename(fromLatin1(String(raw)).replace(/\\/g, "/"));
  const cleaned = base
    .replace(/[\u0000-\u001f\u007f<>:"/\\|?*]/g, "")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return "file";
  if (cleaned.length <= 120) return cleaned;

  const ext = path.extname(cleaned);
  return cleaned.slice(0, 120 - ext.length) + ext;
}