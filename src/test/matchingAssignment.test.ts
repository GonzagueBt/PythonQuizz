import { describe, expect, it } from "vitest";
import { MATCHING_BANK_ID, assignChip } from "@/engine/matchingAssignment";

describe("assignChip", () => {
  it("assigns an unassigned chip to a slot", () => {
    const result = assignChip({}, "chipA", "slotX");
    expect(result).toEqual({ slotX: "chipA" });
  });

  it("moves a chip from one slot to another", () => {
    const result = assignChip({ slotX: "chipA" }, "chipA", "slotY");
    expect(result).toEqual({ slotY: "chipA" });
  });

  it("does not leave the chip registered under its old slot after moving", () => {
    const result = assignChip({ slotX: "chipA" }, "chipA", "slotY");
    expect(result.slotX).toBeUndefined();
  });

  it("returns a chip to the bank without assigning it anywhere", () => {
    const result = assignChip({ slotX: "chipA" }, "chipA", MATCHING_BANK_ID);
    expect(result).toEqual({});
  });

  it("displaces whichever chip already occupied the target slot", () => {
    const state = { slotX: "chipA", slotY: "chipB" };
    const result = assignChip(state, "chipB", "slotX");
    // chipB now occupies slotX; chipA is implicitly back in the bank
    // (it no longer appears as a value anywhere in the map).
    expect(result).toEqual({ slotX: "chipB" });
    expect(Object.values(result)).not.toContain("chipA");
  });

  it("does not mutate the original state object", () => {
    const state = { slotX: "chipA" };
    const frozen = Object.freeze({ ...state });
    expect(() => assignChip(frozen, "chipA", "slotY")).not.toThrow();
    expect(frozen).toEqual({ slotX: "chipA" });
  });

  it("is idempotent when re-assigning a chip to the slot it already occupies", () => {
    const state = { slotX: "chipA" };
    expect(assignChip(state, "chipA", "slotX")).toEqual({ slotX: "chipA" });
  });
});
