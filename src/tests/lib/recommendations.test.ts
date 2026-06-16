import { describe, it, expect } from "vitest";

function timeToMinutes(time: string): number {
  const [h, m] = time.split(":").map(Number);
  return h * 60 + m;
}

function overlaps(freeStart: string, freeEnd: string, actStart: string, actEnd: string): boolean {
  return timeToMinutes(actStart) >= timeToMinutes(freeStart) && timeToMinutes(actEnd) <= timeToMinutes(freeEnd);
}

describe("overlaps (motor de recomendación)", () => {
  it("detecta actividad que cabe exactamente en el hueco", () => {
    expect(overlaps("10:00", "12:00", "10:00", "12:00")).toBe(true);
  });
  it("detecta actividad dentro del hueco", () => {
    expect(overlaps("10:00", "14:00", "11:00", "13:00")).toBe(true);
  });
  it("rechaza actividad que empieza antes del hueco", () => {
    expect(overlaps("10:00", "12:00", "09:00", "11:00")).toBe(false);
  });
  it("rechaza actividad que termina después del hueco", () => {
    expect(overlaps("10:00", "12:00", "11:00", "13:00")).toBe(false);
  });
  it("rechaza actividad fuera del hueco", () => {
    expect(overlaps("10:00", "12:00", "14:00", "16:00")).toBe(false);
  });
});
