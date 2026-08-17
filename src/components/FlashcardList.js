import { useEffect, useMemo, useState } from "react";
import Flashcard from "./Flashcard";
import api from "../api/api";

export default function FlashcardList({
  flashcards = [],
  title = "Your Flashcards",
  flashcardSetId = null,
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mode, setMode] = useState("normal");
  const [evaluation, setEvaluation] = useState(null);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [scores, setScores] = useState({});
  const [sessionStarted, setSessionStarted] = useState(false);
  const [isSavingResult, setIsSavingResult] = useState(false);
  const [resultSaved, setResultSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    setCurrentIndex(0);
    setMode("normal");
    setEvaluation(null);
    setIsEvaluating(false);
    setScores({});
    setSessionStarted(false);
    setIsSavingResult(false);
    setResultSaved(false);
    setSaveError("");
  }, [flashcards]);

  const currentCard = flashcards[currentIndex];
  const progress = flashcards.length
    ? ((currentIndex + 1) / flashcards.length) * 100
    : 0;

  const completedCount = Object.keys(scores).length;
  const averageScore = useMemo(() => {
    if (!completedCount) return 0;
    const total = Object.values(scores).reduce((sum, score) => sum + score, 0);
    return Math.round(total / completedCount);
  }, [scores, completedCount]);

  const switchMode = (nextMode) => {
    setMode(nextMode);
    setEvaluation(null);
    setSessionStarted(nextMode === "test");
  };

  const submitAnswer = async (answer) => {
    if (!currentCard || isEvaluating) return;

    try {
      setIsEvaluating(true);
      const response = await api.post("/ai/flashcards/evaluate", {
        question: currentCard.front,
        expectedAnswer: currentCard.back,
        userAnswer: answer,
      });

      const result = response.data?.evaluation;
      if (!result) {
        throw new Error("No evaluation was returned.");
      }

      setEvaluation(result);
      setScores((current) => ({
        ...current,
        [currentCard.id ?? currentIndex]: Number(result.score) || 0,
      }));
      setSessionStarted(true);
    } catch (error) {
      setEvaluation({
        score: 0,
        verdict: "Evaluation unavailable",
        feedback:
          error.response?.data?.message ||
          "We could not evaluate your answer. Please try again.",
        missedPoints: [],
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const savePracticeResult = async () => {
    if (!flashcardSetId || !completedCount || isSavingResult || resultSaved) return;

    try {
      setIsSavingResult(true);
      setSaveError("");

      await api.post(`/ai/flashcards/${flashcardSetId}/practice-result`, {
        score: averageScore,
        completedCount
      });

      setResultSaved(true);
    } catch (error) {
      setSaveError(
        error.response?.data?.message ||
          "Unable to save your practice result. Please try again."
      );
    } finally {
      setIsSavingResult(false);
    }
  };

  const next = () => {
    setCurrentIndex((index) =>
      Math.min(flashcards.length - 1, index + 1)
    );
    setEvaluation(null);
  };

  const previous = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
    setEvaluation(null);
  };

  if (!flashcards.length) return null;

  const isLastCard = currentIndex === flashcards.length - 1;
  const testComplete = mode === "test" && isLastCard && evaluation;

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>

        <div className="flex rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => switchMode("normal")}
            className={`rounded-lg px-3 py-2 text-xs font-black transition ${
              mode === "normal"
                ? "bg-violet-600 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Normal
          </button>
          <button
            type="button"
            onClick={() => switchMode("test")}
            className={`rounded-lg px-3 py-2 text-xs font-black transition ${
              mode === "test"
                ? "bg-violet-600 text-white"
                : "text-slate-500 hover:bg-slate-50"
            }`}
          >
            Test Yourself
          </button>
        </div>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {mode === "test" && (
        <div className="mb-5 rounded-2xl border border-violet-100 bg-violet-50 p-4">
          <p className="text-sm font-bold text-violet-900">
            Test Yourself
          </p>
          <p className="mt-1 text-xs leading-5 text-violet-700">
            Type what you know first. Your answer will be scored before the
            correct answer can be revealed.
          </p>
        </div>
      )}

      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
        mode={mode}
        evaluation={evaluation}
        isEvaluating={isEvaluating}
        onSubmitAnswer={submitAnswer}
      />

      <div className="mt-5 flex items-center justify-between gap-3">
        <button
          type="button"
          onClick={previous}
          disabled={currentIndex === 0 || isEvaluating}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={next}
          disabled={
            isLastCard ||
            isEvaluating ||
            (mode === "test" && !evaluation)
          }
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {mode === "test" && sessionStarted && (
        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Answered
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {completedCount}/{flashcards.length}
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Average score
            </p>
            <p className="mt-1 text-2xl font-black text-violet-600">
              {averageScore}%
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-bold uppercase tracking-wide text-slate-400">
              Progress
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">
              {Math.round((completedCount / flashcards.length) * 100)}%
            </p>
          </div>
        </div>
      )}

      {testComplete && (
        <div className="mt-5 rounded-3xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-2xl">🎉</p>
          <h3 className="mt-2 text-xl font-black text-slate-900">
            Test session complete
          </h3>
          <p className="mt-1 text-sm text-slate-600">
            You answered {completedCount} of {flashcards.length} cards.
          </p>
          <p className="mt-3 text-3xl font-black text-emerald-600">
            {averageScore}%
          </p>
          <p className="text-xs font-bold uppercase tracking-wide text-emerald-700">
            Average score
          </p>

          {flashcardSetId && (
            <>
              <button
                type="button"
                onClick={savePracticeResult}
                disabled={isSavingResult || resultSaved}
                className="mt-5 w-full rounded-xl bg-emerald-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
              >
                {resultSaved
                  ? "✓ Practice Result Saved"
                  : isSavingResult
                  ? "Saving Result..."
                  : "Save Practice Result"}
              </button>

              {saveError && (
                <p className="mt-3 text-sm font-semibold text-red-600">
                  {saveError}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </section>
  );
}
