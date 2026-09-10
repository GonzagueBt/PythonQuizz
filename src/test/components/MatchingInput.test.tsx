import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MatchingInput } from "@/components/question/inputs/MatchingInput";
import type { MatchingQuestion } from "@/types";

const question: MatchingQuestion = {
  id: "test-matching-1",
  type: "matching",
  kind: "knowledge",
  level: 1,
  topic: "fundamentals",
  subtopics: ["test"],
  difficulty: 1,
  cognitiveLevel: "decouverte",
  tags: ["test"],
  prompt: "Associe chaque terme à sa définition.",
  hints: [],
  explanation: "Explication.",
  pairs: [
    { id: "p1", left: "list", right: "mutable" },
    { id: "p2", left: "tuple", right: "immutable" },
  ],
};

describe("MatchingInput", () => {
  it("renders every left label and every right chip in the bank when nothing is assigned", () => {
    render(<MatchingInput question={question} value={{}} onChange={vi.fn()} disabled={false} reveal={false} />);
    expect(screen.getByText("list")).toBeInTheDocument();
    expect(screen.getByText("tuple")).toBeInTheDocument();
    expect(screen.getByText("mutable")).toBeInTheDocument();
    expect(screen.getByText("immutable")).toBeInTheDocument();
    expect(screen.getAllByText("Dépose une réponse ici")).toHaveLength(2);
  });

  it("shows an assigned chip inside its slot instead of the placeholder, and removes it from the bank", () => {
    render(
      <MatchingInput
        question={question}
        value={{ p1: "p1" }}
        onChange={vi.fn()}
        disabled={false}
        reveal={false}
      />,
    );
    // "mutable" now lives inside the slot as a draggable chip, not in the bank pool.
    expect(screen.getByText("mutable")).toBeInTheDocument();
    expect(screen.getAllByText("Dépose une réponse ici")).toHaveLength(1);
  });

  it("does not reveal correctness while reveal is false, even when disabled (exam mode)", () => {
    render(
      <MatchingInput
        question={question}
        value={{ p1: "p2" }}
        onChange={vi.fn()}
        disabled
        reveal={false}
      />,
    );
    expect(screen.queryByText(/Attendu :/)).not.toBeInTheDocument();
  });

  it("marks a correct assignment and shows the expected answer for a wrong one once reveal is true", () => {
    render(
      <MatchingInput
        question={question}
        value={{ p1: "p1", p2: "p1" }}
        onChange={vi.fn()}
        disabled
        reveal
      />,
    );
    // p2 was assigned p1's answer ("mutable") instead of its own ("immutable") -> wrong.
    expect(screen.getByText("Attendu : immutable")).toBeInTheDocument();
  });

  it("disables every chip button once disabled is true", () => {
    render(<MatchingInput question={question} value={{}} onChange={vi.fn()} disabled reveal={false} />);
    for (const chip of screen.getAllByRole("button")) {
      expect(chip).toBeDisabled();
    }
  });
});
