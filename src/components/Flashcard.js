import { useState } from "react";

export default function Flashcard({ front, back }) {
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setIsFlipped((value) => !value)}
      className="group w-full text-left"
      aria-label={isFlipped ? "Show question" : "Show answer"}
    >
      <div className="min-h-[280px] rounded-3xl border border-slate-200 bg-white p-7 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl">
        <div className="mb-6 flex items-center justify-between">
          <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-bold uppercase tracking-wide text-violet-700">
            {isFlipped ? "Answer" : "Question"}
          </span>

          <span className="text-xs font-semibold text-slate-400">
            Click to flip
          </span>
        </div>

        <div className="flex min-h-[150px] items-center">
          <p className="text-lg font-semibold leading-8 text-slate-800 sm:text-xl">
            {isFlipped ? back : front}
          </p>
        </div>

        <div className="mt-6 border-t border-slate-100 pt-4 text-xs font-medium text-slate-400">
          {isFlipped ? "Click to show the question" : "Click to reveal the answer"}
        </div>
      </div>
    </button>
  );
}
