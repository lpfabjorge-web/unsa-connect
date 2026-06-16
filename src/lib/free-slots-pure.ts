const DAY_START = "07:00";
const DAY_END = "21:00";

export function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type Block = { startTime: string; endTime: string };

export function calculateFreeSlots(blocks: Block[]): { startTime: string; endTime: string; durationMinutes: number }[] {
  const sorted = [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const free: { startTime: string; endTime: string; durationMinutes: number }[] = [];
  let cursor = timeToMinutes(DAY_START);
  const dayEnd = timeToMinutes(DAY_END);
  for (const block of sorted) {
    const start = timeToMinutes(block.startTime);
    if (start > cursor) {
      free.push({ startTime: minutesToTime(cursor), endTime: minutesToTime(start), durationMinutes: start - cursor });
    }
    cursor = Math.max(cursor, timeToMinutes(block.endTime));
  }
  if (cursor < dayEnd) {
    free.push({ startTime: minutesToTime(cursor), endTime: DAY_END, durationMinutes: dayEnd - cursor });
  }
  return free.filter((s) => s.durationMinutes >= 30);
}
