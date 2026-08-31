import { useEffect, useRef, useState } from "react";
import api from "../api/api";

// How often to re-check while things look healthy.
const CHECK_INTERVAL_MS = 20000;
// The backend is on Render's free tier, which spins the service down after
// ~15 minutes idle. The next request can take 30–60s to cold-start. This
// timeout has to be generous enough to let a cold start finish rather than
// being mistaken for a real outage.
const HEALTH_CHECK_TIMEOUT_MS = 45000;
// A single failed check is exactly what a cold start looks like — so the
// banner only appears after this many *consecutive* failures, which a
// cold start won't produce (it resolves on the first or second attempt).
const FAILURES_BEFORE_DOWN = 2;

// Polls GET /health and reports whether the backend currently looks down.
// Cold-start-aware: requires consecutive failures, not a single miss,
// before concluding the server is actually down rather than just waking up.
export function useBackendStatus() {
  const [isDown, setIsDown] = useState(false);
  const consecutiveFailures = useRef(0);

  useEffect(() => {
    let cancelled = false;
    let timer;

    const checkOnce = async () => {
      try {
        await api.get("/health", { timeout: HEALTH_CHECK_TIMEOUT_MS, withCredentials: false });
        if (cancelled) return;
        consecutiveFailures.current = 0;
        setIsDown(false);
      } catch {
        if (cancelled) return;
        consecutiveFailures.current += 1;
        if (consecutiveFailures.current >= FAILURES_BEFORE_DOWN) {
          setIsDown(true);
        }
      } finally {
        if (!cancelled) timer = setTimeout(checkOnce, CHECK_INTERVAL_MS);
      }
    };

    checkOnce();
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, []);

  return isDown;
}

export default function BackendStatusBanner() {
  const isDown = useBackendStatus();
  if (!isDown) return null;

  return (
    <div className="w-full bg-amber-50 border-b border-amber-200 px-4 py-2.5 text-center text-sm font-semibold text-amber-800">
      Our servers are temporarily unavailable — we're working on it. This page will update automatically once things are back.
    </div>
  );
}
