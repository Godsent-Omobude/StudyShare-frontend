import { useEffect } from "react";
import { Flame, Sparkles, X, Trophy } from "lucide-react";

const MILESTONES = [3, 7, 14, 30, 50, 100, 365];

const getMilestone = (streak) => {
  if (MILESTONES.includes(streak)) return { current: streak, reached: true };
  const next = MILESTONES.find((value) => value > streak) || Math.ceil(streak / 100) * 100;
  const previous = MILESTONES.filter((value) => value < streak).pop() || 1;
  return { current: previous, next, reached: false };
};

const getMessage = (streak, milestoneReached) => {
  if (milestoneReached) {
    if (streak >= 100) return "100 days. That's a serious study habit.";
    if (streak >= 50) return "You've turned consistency into a superpower.";
    if (streak >= 30) return "A full month of showing up. Keep going.";
    if (streak >= 14) return "Two weeks strong. Your future self is going to love this.";
    if (streak >= 7) return "One week locked in. You made consistency real.";
    return "Your study streak has officially begun.";
  }

  if (streak >= 2) return "You showed up again. That's how strong habits are built.";
  return "You started something worth protecting.";
};

export default function StreakCelebration({ streak, longestStreak, onClose }) {
  const safeStreak = Math.max(1, Number(streak) || 1);
  const milestone = getMilestone(safeStreak);
  const milestoneReached = milestone.reached;
  const nextMilestone = milestoneReached
    ? MILESTONES.find((value) => value > safeStreak) || safeStreak + 1
    : milestone.next;
  const progressBase = milestoneReached ? safeStreak : milestone.current;
  const progress = milestoneReached
    ? 100
    : Math.min(100, Math.max(0, ((safeStreak - progressBase) / (nextMilestone - progressBase)) * 100));

  useEffect(() => {
    const timer = window.setTimeout(onClose, 6500);
    return () => window.clearTimeout(timer);
  }, [onClose]);

  const particles = Array.from({ length: 18 });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-hidden bg-slate-950/65 p-4 backdrop-blur-sm">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {particles.map((_, index) => (
          <span
            key={index}
            className="streak-particle absolute h-2 w-2 rounded-full bg-amber-300"
            style={{
              left: `${8 + ((index * 37) % 84)}%`,
              top: `${12 + ((index * 53) % 74)}%`,
              animationDelay: `${(index % 9) * 90}ms`,
              animationDuration: `${1200 + (index % 5) * 250}ms`,
            }}
          />
        ))}
      </div>

      <div className="streak-celebration relative w-full max-w-md overflow-hidden rounded-[2rem] border border-white/15 bg-white shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close streak celebration"
          className="absolute right-4 top-4 z-10 rounded-full bg-slate-100 p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-800"
        >
          <X size={18} />
        </button>

        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 px-6 pb-8 pt-10 text-center text-white">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-white/15" />
          <div className="absolute -bottom-20 -left-12 h-40 w-40 rounded-full bg-white/10" />

          <div className="streak-flame mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-white/15 shadow-[0_0_70px_rgba(255,255,255,0.35)] ring-1 ring-white/30">
            <Flame className="h-16 w-16 fill-current drop-shadow-lg" strokeWidth={1.6} />
          </div>

          <div className="mt-5 flex items-center justify-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-amber-100">
            <Sparkles size={15} />
            {milestoneReached ? "Milestone unlocked" : "Streak extended"}
            <Sparkles size={15} />
          </div>

          <div className="mt-1 text-7xl font-black tracking-tight drop-shadow-sm">
            {safeStreak}
          </div>
          <div className="text-lg font-bold">day{safeStreak === 1 ? "" : "s"} in a row</div>
        </div>

        <div className="p-6">
          <div className="text-center">
            <h2 className="text-2xl font-black text-slate-900">
              {milestoneReached ? "You just levelled up your consistency." : "Your streak is alive."}
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-500">
              {getMessage(safeStreak, milestoneReached)}
            </p>
          </div>

          <div className="mt-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Trophy className="text-amber-500" size={18} />
                <span className="text-sm font-black text-amber-950">
                  {milestoneReached ? "Next milestone" : `${nextMilestone - safeStreak} days to go`}
                </span>
              </div>
              <span className="text-xs font-bold text-amber-700">
                {milestoneReached ? `${nextMilestone} days` : `${safeStreak}/${nextMilestone}`}
              </span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-amber-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-700"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {typeof longestStreak === "number" && longestStreak > 0 && (
            <p className="mt-4 text-center text-xs font-semibold text-slate-400">
              Personal best: {longestStreak} day{longestStreak === 1 ? "" : "s"}
            </p>
          )}

          <button
            type="button"
            onClick={onClose}
            className="mt-5 w-full rounded-2xl bg-slate-900 px-5 py-3.5 text-sm font-black text-white transition hover:bg-slate-800 active:scale-[0.98]"
          >
            Keep the streak going
          </button>
        </div>
      </div>
    </div>
  );
}
