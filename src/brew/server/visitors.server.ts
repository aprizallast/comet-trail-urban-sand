const sessions = new Map<string, number>();
const known = new Set<string>();
let totalVisits = 0;
const ACTIVE_MS = 45_000;

function prune(now: number) {
  for (const [id, seen] of sessions) {
    if (now - seen > ACTIVE_MS) sessions.delete(id);
  }
}

export function pingVisitor(sessionId: string) {
  const id = sessionId.slice(0, 80) || "anon";
  const now = Date.now();
  if (!known.has(id)) {
    known.add(id);
    totalVisits += 1;
  }
  sessions.set(id, now);
  prune(now);
  return {
    activeVisitors: Math.max(1, sessions.size),
    totalVisits,
    uniqueVisitors: known.size,
  };
}

export function leaveVisitor(sessionId: string) {
  if (sessionId) sessions.delete(sessionId.slice(0, 80));
  prune(Date.now());
  return {
    activeVisitors: Math.max(0, sessions.size),
    totalVisits,
    uniqueVisitors: known.size,
  };
}
