import type { ComponentProps } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuestionPlayer } from "@/components/question/QuestionPlayer";
import type { MultipleChoiceQuestion, TextQuestion, TrueFalseQuestion } from "@/types";

const base = {
  level: 1 as const,
  topic: "fundamentals" as const,
  subtopics: ["test"],
  difficulty: 1 as const,
  cognitiveLevel: "decouverte" as const,
  tags: ["test"],
  kind: "knowledge" as const,
};

const trueFalseQuestion: TrueFalseQuestion = {
  ...base,
  id: "test-tf-1",
  type: "true-false",
  prompt: "Python est un langage interprété.",
  hints: ["Premier indice.", "Deuxième indice, plus précis."],
  explanation: "Explication pédagogique complète.",
  correct: true,
};

const mcQuestion: MultipleChoiceQuestion = {
  ...base,
  id: "test-mc-1",
  type: "multiple-choice",
  prompt: "Quelle option est correcte ?",
  hints: ["Un indice."],
  explanation: "Explication du QCM.",
  options: [
    { id: "a", text: "Bonne réponse", correct: true },
    { id: "b", text: "Mauvaise réponse", correct: false, whyWrong: "Ceci est faux parce que..." },
  ],
};

const textQuestion: TextQuestion = {
  ...base,
  id: "test-text-1",
  type: "text",
  prompt: "Quelle méthode ajoute un élément ?",
  hints: [],
  explanation: "append() ajoute un élément en fin de liste.",
  acceptedAnswers: ["append"],
};

function renderPlayer(overrides: Partial<ComponentProps<typeof QuestionPlayer>> = {}) {
  const onAnswered = vi.fn();
  const onNext = vi.fn();
  const onToggleFavorite = vi.fn();
  const onToggleDifficult = vi.fn();
  const utils = render(
    <QuestionPlayer
      question={trueFalseQuestion}
      favorite={false}
      difficult={false}
      onToggleFavorite={onToggleFavorite}
      onToggleDifficult={onToggleDifficult}
      onAnswered={onAnswered}
      onNext={onNext}
      {...overrides}
    />,
  );
  return { ...utils, onAnswered, onNext, onToggleFavorite, onToggleDifficult };
}

describe("QuestionPlayer — true/false flow", () => {
  it("disables submit until an answer is chosen", () => {
    renderPlayer();
    expect(screen.getByText("Valider ma réponse")).toBeDisabled();
  });

  it("submits a correct answer, reports it, and reveals the explanation", async () => {
    const user = userEvent.setup();
    const { onAnswered } = renderPlayer();

    await user.click(screen.getByText("Vrai"));
    expect(screen.getByText("Valider ma réponse")).toBeEnabled();
    await user.click(screen.getByText("Valider ma réponse"));

    expect(onAnswered).toHaveBeenCalledWith(true, expect.any(Number));
    expect(screen.getByText("✓ Correct !")).toBeInTheDocument();
    expect(screen.getByText("Explication pédagogique complète.")).toBeInTheDocument();
  });

  it("reports an incorrect answer accurately", async () => {
    const user = userEvent.setup();
    const { onAnswered } = renderPlayer();

    await user.click(screen.getByText("Faux"));
    await user.click(screen.getByText("Valider ma réponse"));

    expect(onAnswered).toHaveBeenCalledWith(false, expect.any(Number));
    expect(screen.getByText("✗ Incorrect")).toBeInTheDocument();
  });

  it("calls onNext only after submission, moving to the next question", async () => {
    const user = userEvent.setup();
    const { onNext } = renderPlayer();

    expect(screen.queryByText(/Question suivante|Terminer/)).not.toBeInTheDocument();
    await user.click(screen.getByText("Vrai"));
    await user.click(screen.getByText("Valider ma réponse"));

    const nextButton = screen.getByText(/Question suivante|Terminer/);
    await user.click(nextButton);
    expect(onNext).toHaveBeenCalledTimes(1);
  });

  it("reveals hints progressively, one click at a time", async () => {
    const user = userEvent.setup();
    renderPlayer();

    expect(screen.queryByText("Premier indice.")).not.toBeInTheDocument();
    await user.click(screen.getByText("Afficher un indice"));
    expect(screen.getByText("Premier indice.")).toBeInTheDocument();
    expect(screen.queryByText("Deuxième indice, plus précis.")).not.toBeInTheDocument();

    await user.click(screen.getByText(/Indice suivant/));
    expect(screen.getByText("Deuxième indice, plus précis.")).toBeInTheDocument();
  });

  it("lets the user toggle favorite and difficult without submitting an answer", async () => {
    const user = userEvent.setup();
    const { onToggleFavorite, onToggleDifficult, onAnswered } = renderPlayer();

    await user.click(screen.getByLabelText("Marquer comme favori"));
    await user.click(screen.getByLabelText("Marquer comme difficile"));

    expect(onToggleFavorite).toHaveBeenCalledTimes(1);
    expect(onToggleDifficult).toHaveBeenCalledTimes(1);
    expect(onAnswered).not.toHaveBeenCalled();
  });
});

describe("QuestionPlayer — multiple-choice flow", () => {
  it("shows why-wrong feedback only for the selected incorrect option", async () => {
    const user = userEvent.setup();
    renderPlayer({ question: mcQuestion });

    await user.click(screen.getByText("Mauvaise réponse"));
    await user.click(screen.getByText("Valider ma réponse"));

    expect(screen.getByText("Ceci est faux parce que...")).toBeInTheDocument();
  });
});

describe("QuestionPlayer — text flow", () => {
  it("accepts a case-insensitive, trimmed match against accepted answers", async () => {
    const user = userEvent.setup();
    const { onAnswered } = renderPlayer({ question: textQuestion });

    await user.type(screen.getByPlaceholderText("Ta réponse..."), "  APPEND  ");
    await user.click(screen.getByText("Valider ma réponse"));

    expect(onAnswered).toHaveBeenCalledWith(true, expect.any(Number));
  });
});

describe("QuestionPlayer — exam mode", () => {
  it("hides hints, course help and the explanation panel", async () => {
    const user = userEvent.setup();
    renderPlayer({ examMode: true });

    expect(screen.queryByText("💡 Indices")).not.toBeInTheDocument();

    await user.click(screen.getByText("Vrai"));
    await user.click(screen.getByText("Valider ma réponse"));

    expect(screen.queryByText(/Correct !|Incorrect/)).not.toBeInTheDocument();
    expect(screen.getByText(/Question suivante|Terminer/)).toBeInTheDocument();
  });
});

describe("QuestionPlayer — question change resets state", () => {
  it("clears the previous answer and submission state when the question prop changes", async () => {
    const user = userEvent.setup();
    const { rerender } = renderPlayer({ question: trueFalseQuestion });

    await user.click(screen.getByText("Vrai"));
    await user.click(screen.getByText("Valider ma réponse"));
    expect(screen.getByText("✓ Correct !")).toBeInTheDocument();

    rerender(
      <QuestionPlayer
        question={mcQuestion}
        favorite={false}
        difficult={false}
        onToggleFavorite={vi.fn()}
        onToggleDifficult={vi.fn()}
        onAnswered={vi.fn()}
        onNext={vi.fn()}
      />,
    );

    expect(screen.queryByText("✓ Correct !")).not.toBeInTheDocument();
    expect(screen.getByText("Valider ma réponse")).toBeDisabled();
  });
});
