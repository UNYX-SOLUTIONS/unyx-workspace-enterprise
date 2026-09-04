import { describe, expect, it } from "vitest";
import { getInitials } from "./stringUtils";

describe("getInitials", () => {
  it("toma la primera letra de la primera y última palabra", () => {
    expect(getInitials("Juan Pérez")).toBe("JP");
  });

  it("devuelve las dos primeras letras con una sola palabra", () => {
    expect(getInitials("UNYX")).toBe("UN");
  });

  it("usa el fallback con valores vacíos", () => {
    expect(getInitials("")).toBe("U");
    expect(getInitials(null)).toBe("U");
    expect(getInitials(undefined, "X")).toBe("X");
  });
});
