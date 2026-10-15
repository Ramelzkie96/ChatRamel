// userId -> Set of socket ids (one user can have several tabs open)
const online = new Map();

// returns true if this is the user's first connection (they just came online)
export function addSocket(userId, socketId) {
  const sockets = online.get(userId) ?? new Set();
  const wasOffline = sockets.size === 0;
  sockets.add(socketId);
  online.set(userId, sockets);
  return wasOffline;
}

// returns true if that was the user's last connection (they just went offline)
export function removeSocket(userId, socketId) {
  const sockets = online.get(userId);
  if (!sockets) return false;

  sockets.delete(socketId);
  if (sockets.size === 0) {
    online.delete(userId);
    return true;
  }
  return false;
}

export const getOnlineIds = () => [...online.keys()];
export const isOnline = (userId) => online.has(String(userId));