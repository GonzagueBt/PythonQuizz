/**
 * Pure state-update logic for the drag-and-drop "matching" question type:
 * assigning a chip (a right-hand answer) to a slot (a left-hand item), or
 * back to the unassigned pool ("bank"). Kept separate from the React
 * component so it can be unit-tested without simulating pointer/drag
 * events in a DOM environment.
 */

export const MATCHING_BANK_ID = "bank";

export function assignChip(
  current: Record<string, string>,
  chipId: string,
  target: string,
): Record<string, string> {
  const next = { ...current };
  for (const key of Object.keys(next)) {
    if (next[key] === chipId) delete next[key];
  }
  if (target !== MATCHING_BANK_ID) {
    next[target] = chipId;
  }
  return next;
}
