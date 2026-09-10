import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { OrderingInput } from "@/components/question/inputs/OrderingInput";
import type { OrderingQuestion } from "@/types";

const question: OrderingQuestion = {
  id: "test-ordering-1",
  type: "ordering",
  kind: "knowledge",
  level: 1,
  topic: "fundamentals",
  subtopics: ["test"],
  difficulty: 1,
  cognitiveLevel: "decouverte",
  tags: ["test"],
  prompt: "Classe ces étapes.",
  hints: [],
  explanation: "Explication.",
  items: [
    { id: "a", label: "Étape A" },
    { id: "b", label: "Étape B" },
    { id: "c", label: "Étape C" },
  ],
  correctOrder: ["a", "b", "c"],
};

describe("OrderingInput", () => {
  it("renders items in the order given by value, numbered from 1", () => {
    render(<OrderingInput question={question} value={["b", "a", "c"]} onChange={vi.fn()} disabled={false} reveal={false} />);
    const labels = screen.getAllByText(/Étape/).map((el) => el.textContent);
    expect(labels).toEqual(["Étape B", "Étape A", "Étape C"]);
  });

  it("swaps two adjacent items when the down arrow is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OrderingInput question={question} value={["a", "b", "c"]} onChange={onChange} disabled={false} reveal={false} />);

    await user.click(screen.getAllByLabelText("Descendre")[0]);
    expect(onChange).toHaveBeenCalledWith(["b", "a", "c"]);
  });

  it("swaps two adjacent items when the up arrow is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<OrderingInput question={question} value={["a", "b", "c"]} onChange={onChange} disabled={false} reveal={false} />);

    await user.click(screen.getAllByLabelText("Monter")[1]);
    expect(onChange).toHaveBeenCalledWith(["b", "a", "c"]);
  });

  it("disables the up arrow on the first item and the down arrow on the last", () => {
    render(<OrderingInput question={question} value={["a", "b", "c"]} onChange={vi.fn()} disabled={false} reveal={false} />);
    expect(screen.getAllByLabelText("Monter")[0]).toBeDisabled();
    expect(screen.getAllByLabelText("Descendre")[2]).toBeDisabled();
  });

  it("does not apply correct/incorrect border colors while reveal is false, even if disabled (exam mode)", () => {
    render(<OrderingInput question={question} value={["b", "a", "c"]} onChange={vi.fn()} disabled reveal={false} />);
    for (const row of screen.getAllByRole("listitem")) {
      expect(row.className).not.toMatch(/border-emerald|border-red/);
    }
  });

  it("applies correct/incorrect border colors once reveal is true", () => {
    render(<OrderingInput question={question} value={["b", "a", "c"]} onChange={vi.fn()} disabled reveal />);
    const rows = screen.getAllByRole("listitem");
    // value = [b, a, c] vs correctOrder = [a, b, c]: only position 2 ("c") matches.
    expect(rows[0].className).toMatch(/border-red/);
    expect(rows[1].className).toMatch(/border-red/);
    expect(rows[2].className).toMatch(/border-emerald/);
  });

  it("disables all interaction once disabled is true", () => {
    render(<OrderingInput question={question} value={["a", "b", "c"]} onChange={vi.fn()} disabled reveal />);
    for (const btn of screen.getAllByLabelText(/Monter|Descendre/)) {
      expect(btn).toBeDisabled();
    }
  });
});
