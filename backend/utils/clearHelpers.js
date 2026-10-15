// when did this user last clear this chat? (null = never)
export function getClearedAt(chat, userId) {
  const entry = chat.clearedAt?.find((e) => String(e.user) === String(userId));
  return entry ? new Date(entry.at) : null;
}