import { CURRENT_SEMESTER } from "./constants";
import { db } from "./db";
import { schedules, freeSlots } from "./db/schema";
import { eq, and } from "drizzle-orm";

const DAY_START = "07:00";
const DAY_END = "21:00";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function minutesToTime(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

type Block = { startTime: string; endTime: string };

export function calculateFreeSlots(blocks: Block[]): { startTime: string; endTime: string; durationMinutes: number }[] {
  const sorted = [...blocks].sort((a, b) => timeToMinutes(a.startTime) - timeToMinutes(b.startTime));
  const free = [];
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

export async function recalculateFreeSlots(userId: string) {
  const schedule = await db.query.schedules.findFirst({
    where: and(eq(schedules.userId, userId), eq(schedules.semester, CURRENT_SEMESTER)),
    with: { blocks: true },
  });
  if (!schedule) return;
  await db.delete(freeSlots).where(eq(freeSlots.userId, userId));
  const days = ["lunes", "martes", "miercoles", "jueves", "viernes", "sabado"] as const;
  for (const day of days) {
    const blocks = schedule.blocks.filter((b) => b.dayOfWeek === day);
    const slots = calculateFreeSlots(blocks);
    for (const slot of slots) {
      await db.insert(freeSlots).values({ userId, dayOfWeek: day, ...slot, calculatedAt: new Date() });
    }
  }
}
