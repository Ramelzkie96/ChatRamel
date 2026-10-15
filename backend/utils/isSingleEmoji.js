// One emoji and nothing else: plain, with skin tone, joined (family, couple), flag or keycap.
const EMOJI_RE = new RegExp(
  "^(?:" +
    "\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?" +
    "(?:\\u200D\\p{Extended_Pictographic}(?:\\uFE0F|\\p{Emoji_Modifier})?)*" +
    "[\\u{E0020}-\\u{E007F}]*" + // subdivision flags such as England
    "|\\p{Regional_Indicator}{2}" + // country flags
    "|[#*0-9]\\uFE0F?\\u20E3" + // keycaps such as 1️⃣
    ")$",
  "u"
);

export default function isSingleEmoji(value) {
  if (typeof value !== "string") return false;
  const text = value.trim();
  if (!text || text.length > 32) return false;
  return EMOJI_RE.test(text);
}