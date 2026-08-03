import { useEffect, useState } from "react";
import Flashcard from "./Flashcard";

export default function FlashcardList({ flashcards = [], title = "Your Flashcards" }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    setCurrentIndex(0);
  }, [flashcards]);

  if (!flashcards.length) return null;

  const currentCard = flashcards[currentIndex];
  const progress = ((currentIndex + 1) / flashcards.length) * 100;

  const previous = () => {
    setCurrentIndex((index) => Math.max(0, index - 1));
  };

  const next = () => {
    setCurrentIndex((index) => Math.min(flashcards.length - 1, index + 1));
  };

  return (
    <section className="mt-8">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-slate-900">{title}</h2>
          <p className="mt-1 text-sm text-slate-500">
            Card {currentIndex + 1} of {flashcards.length}
          </p>
        </div>
        <p className="text-xs font-semibold text-slate-400">
          Flip the card to reveal the answer
        </p>
      </div>

      <div className="mb-5 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full bg-violet-600 transition-all duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      <Flashcard
        front={currentCard.front}
        back={currentCard.back}
      />

      <div className="mt-5 flex items-center justify-between">
        <button
          type="button"
          onClick={previous}
          disabled={currentIndex === 0}
          className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          ← Previous
        </button>

        <button
          type="button"
          onClick={next}
          disabled={currentIndex === flashcards.length - 1}
          className="rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next →
        </button>
      </div>

      {currentIndex === flashcards.length - 1 && (
        <p className="mt-5 text-center text-sm font-bold text-emerald-600">
          🎉 You've reached the last flashcard!
        </p>
      )}
    </section>
  );
}
