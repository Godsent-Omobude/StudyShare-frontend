import { useState } from "react";

export default function Flashcard({
  front,
  back,
  mode = "normal",
  evaluation = null,
  isEvaluating = false,
  onSubmitAnswer,
  onRevealAnswer,
}) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [answer, setAnswer] = useState("");

  const submitAnswer = async () => {
    if (!answer.trim() || isEvaluating || evaluation) return;
    await onSubmitAnswer?.(answer.trim());
  };

  const revealAnswer = () => {
    setIsRevealed(true);
    onRevealAnswer?.();
  };

  if (mode === "test") {
    return (
      <div className="w-full rounded-3xl border border-slate-200 bg-white p-7 shadow-sm">
        <div className="mb-6 flex items-center justify-between gap-3">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
            Question
          </span>
          <span className="text-xs font-semibold text-slate-400">
            Test Yourself
          </span>
        </div>

        <div className="min-h-[120px]">
          <p className="text-lg font-semibold leading-8 text-slate-800 sm:text-xl">
            {front}
          </p>
        </div>

        {!evaluation ? (
          <>
            <label className="mt-5 block text-sm font-bold text-slate-700">
              Your answer
            </label>
            <textarea
              value={answer}
              onChange={(e) => setAnswer(e.target.value)}
              onKeyDown={(e) => {
                if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                  submitAnswer();
                }
              }}
              placeholder="Type your answer before revealing the correct answer..."
              rows={5}
              disabled={isEvaluating}
              className="mt-2 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm leading-6 outline-none transition focus:border-violet-500 focus:bg-white focus:ring-4 focus:ring-violet-100 disabled:cursor-not-allowed disabled:opacity-60"
            />

            <button
              type="button"
              onClick={submitAnswer}
              disabled={!answer.trim() || isEvaluating}
              className="mt-4 w-full rounded-xl bg-violet-600 px-5 py-3.5 text-sm font-black text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isEvaluating ? "Evaluating your answer..." : "Submit Answer"}
            </button>

            <p className="mt-2 text-center text-xs text-slate-400">
              Tip: Ctrl + Enter also submits your answer.
            </p>
          </>
        ) : (
          <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <span className="text-sm font-bold text-slate-600">
                Your score
              </span>
              <span
                className={`text-2xl font-black ${
                  Number(evaluation.score) >= 80
                    ? "text-emerald-600"
                    : Number(evaluation.score) >= 50
                    ? "text-amber-600"
                    : "text-red-600"
                }`}
              >
                {evaluation.score}%
              </span>
            </div>

            {evaluation.verdict && (
              <p className="mt-3 text-sm font-black text-slate-900">
                {evaluation.verdict}
              </p>
            )}

            <p className="mt-2 text-sm leading-6 text-slate-600">
              {evaluation.feedback}
            </p>

            {Array.isArray(evaluation.missedPoints) &&
              evaluation.missedPoints.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-black uppercase tracking-wide text-slate-500">
                    Key points to review
                  </p>
                  <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-600">
                    {evaluation.missedPoints.map((point, index) => (
                      <li key={`${point}-${index}`}>{point}</li>
                    ))}
                  </ul>
                </div>
              )}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={revealAnswer}
                className="flex-1 rounded-xl bg-violet-600 px-5 py-3 text-sm font-black text-white transition hover:bg-violet-700"
              >
                {isRevealed ? "Answer Revealed" : "Reveal Answer"}
              </button>
            </div>

            {isRevealed && (
              <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5">
                <p className="text-xs font-black uppercase tracking-wide text-emerald-700">
                  Correct Answer
                </p>
                <p className="mt-2 text-sm leading-7 text-slate-800">
                  {back}
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setIsRevealed((value) => !value)}
      className="group w-full text-left"
      aria-label={isRevealed ? "Show question" : "Show answer"}
    >
      <div className="min-h-[280px] rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
            {isRevealed ? "Answer" : "Question"}
          </span>

          <span className="text-xs font-semibold text-slate-400">
            Click to flip
          </span>
        </div>

        <div className="flex min-h-[150px] items-center">
          <p className="text-lg font-semibold leading-8 text-slate-800 sm:text-xl">
            {isRevealed ? back : front}
          </p>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
          {isRevealed
            ? "Click to show the question"
            : "Click to reveal the answer"}
        </div>
      </div>
    </button>
  );
}
