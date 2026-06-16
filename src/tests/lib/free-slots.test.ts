import { describe, it, expect } from "vitest";
import { calculateFreeSlots } from "../../lib/free-slots-pure";

describe("calculateFreeSlots", () => {
  it("retorna el día completo si no hay clases", () => {
    const result = calculateFreeSlots([]);
    expect(result).toHaveLength(1);
    expect(result[0].startTime).toBe("07:00");
    expect(result[0].endTime).toBe("21:00");
    expect(result[0].durationMinutes).toBe(840);
  });
  it("detecta hueco entre dos clases", () => {
    const result = calculateFreeSlots([
      { startTime: "08:00", endTime: "10:00" },
      { startTime: "12:00", endTime: "14:00" },
    ]);
    const libre = result.find((s) => s.startTime === "10:00");
    expect(libre).toBeDefined();
    expect(libre?.endTime).toBe("12:00");
    expect(libre?.durationMinutes).toBe(120);
  });
  it("filtra huecos menores a 30 minutos", () => {
    const result = calculateFreeSlots([
      { startTime: "08:00", endTime: "09:50" },
      { startTime: "10:00", endTime: "12:00" },
    ]);
    const corto = result.find((s) => s.startTime === "09:50");
    expect(corto).toBeUndefined();
  });
  it("detecta hueco al inicio del día", () => {
    const result = calculateFreeSlots([{ startTime: "09:00", endTime: "11:00" }]);
    const inicio = result.find((s) => s.startTime === "07:00");
    expect(inicio).toBeDefined();
    expect(inicio?.endTime).toBe("09:00");
  });
  it("detecta hueco al final del día", () => {
    const result = calculateFreeSlots([{ startTime: "07:00", endTime: "15:00" }]);
    const fin = result.find((s) => s.endTime === "21:00");
    expect(fin).toBeDefined();
    expect(fin?.startTime).toBe("15:00");
  });
});
