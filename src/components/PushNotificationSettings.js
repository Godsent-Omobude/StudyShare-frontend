import { useEffect, useState } from "react";
import {
  getPermissionState,
  requestPermissionAndRegister,
  revokeLocalToken,
} from "../firebase/messaging";
import {
  registerPushDevice,
  unregisterPushDevice,
  getPushStatus,
  getNotificationPreferences,
  updateNotificationPreferences,
} from "../api/pushNotifications";

const CATEGORIES = [
  { key: "notifyCircleMessages", label: "Study Circle messages", description: "New messages in your Study Circles when you're not actively viewing them." },
  { key: "notifyCircleInvitations", label: "Study Circle invitations", description: "When someone invites you to join a Study Circle." },
  { key: "notifyMentions", label: "Mentions", description: "When someone mentions you directly." },
  { key: "notifyCircleActivity", label: "Study Circle activity", description: "Join requests, approvals, new sessions and membership changes." },
  { key: "notifyFlashcardActivity", label: "Flashcard activity", description: "Updates about your flashcard sets." },
  { key: "notifyAccountSecurity", label: "Account & security", description: "Important alerts about your account." },
  { key: "notifyAnnouncements", label: "General Study2Gate announcements", description: "Occasional platform news and updates." },
];

const STATUS_COPY = {
  unsupported: { label: "Unsupported", tone: "text-slate-500 bg-slate-100" },
  denied: { label: "Blocked by browser", tone: "text-red-700 bg-red-100" },
  "not-requested": { label: "Disabled", tone: "text-slate-600 bg-slate-100" },
  granted: { label: "Enabled", tone: "text-emerald-700 bg-emerald-100" },
};

export default function PushNotificationSettings() {
  const [permission, setPermission] = useState(() => getPermissionState());
  const [activeDeviceCount, setActiveDeviceCount] = useState(0);
  const [preferences, setPreferences] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const refreshStatus = async () => {
    try {
      const { data } = await getPushStatus();
      setActiveDeviceCount(data.activeDeviceCount || 0);
    } catch {
      // Non-fatal — the permission-state UI still works without this.
    }
  };

  useEffect(() => {
    refreshStatus();
    getNotificationPreferences()
      .then(({ data }) => setPreferences(data))
      .catch(() => setError("Unable to load notification preferences."));
  }, []);

  const enabledOnThisDevice = permission === "granted" && Boolean(localStorage.getItem("fcmToken")) && activeDeviceCount > 0;

  const handleEnable = async () => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const result = await requestPermissionAndRegister();
      setPermission(result.permission);

      if (result.permission !== "granted") {
        if (result.permission === "denied") {
          setError("Notifications are blocked. Enable them in your browser's site settings to turn this on.");
        }
        return;
      }

      await registerPushDevice(result.token, result.deviceInfo);
      localStorage.setItem("fcmToken", result.token);
      await refreshStatus();
      setNotice("Notifications enabled on this device.");
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to enable notifications.");
    } finally {
      setBusy(false);
    }
  };

  const handleDisable = async () => {
    setError("");
    setNotice("");
    setBusy(true);
    try {
      const token = localStorage.getItem("fcmToken");
      if (token) {
        await unregisterPushDevice(token).catch(() => {});
      }
      await revokeLocalToken();
      localStorage.removeItem("fcmToken");
      await refreshStatus();
      setNotice("Notifications turned off on this device.");
    } catch (err) {
      setError(err.response?.data?.message || "Unable to disable notifications.");
    } finally {
      setBusy(false);
    }
  };

  const toggleCategory = async (key, value) => {
    setError("");
    const previous = preferences;
    setPreferences((prefs) => ({ ...prefs, [key]: value }));
    try {
      const { data } = await updateNotificationPreferences({ [key]: value });
      setPreferences(data);
    } catch (err) {
      setPreferences(previous);
      setError(err.response?.data?.message || "Unable to save notification preference.");
    }
  };

  const statusCopy = STATUS_COPY[permission] || STATUS_COPY["not-requested"];

  return (
    <section className="mb-5 rounded-3xl bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-black text-slate-900">Notifications</h2>
        <span className={`rounded-full px-3 py-1 text-xs font-bold ${statusCopy.tone}`}>
          {statusCopy.label}
        </span>
      </div>

      {error && <p className="mt-3 text-sm font-semibold text-red-600">{error}</p>}
      {notice && <p className="mt-3 text-sm font-semibold text-emerald-600">{notice}</p>}

      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
        {permission === "unsupported" && (
          <p className="text-sm text-slate-500">
            Notifications aren't supported in this browser. Try a recent version of Chrome, Firefox, or Edge.
          </p>
        )}

        {permission === "denied" && (
          <p className="text-sm text-slate-600">
            You've blocked notifications for Study2Gate. To turn them back on, allow notifications for this
            site in your browser's settings, then reload this page.
          </p>
        )}

        {(permission === "not-requested" || permission === "granted") && (
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-bold text-slate-800">Browser notifications</p>
              <p className="mt-1 text-xs text-slate-500">
                Get notified on this device even when Study2Gate isn't open in your browser.
              </p>
            </div>
            {enabledOnThisDevice ? (
              <button
                onClick={handleDisable}
                disabled={busy}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-bold text-slate-600 disabled:opacity-60"
              >
                Turn off
              </button>
            ) : (
              <button
                onClick={handleEnable}
                disabled={busy}
                className="rounded-xl bg-[var(--accent)] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60"
              >
                Enable notifications
              </button>
            )}
          </div>
        )}
      </div>

      {preferences && (
        <div className="mt-5 space-y-2">
          <p className="text-sm font-bold text-slate-700">Notify me about</p>
          {CATEGORIES.map((category) => (
            <label
              key={category.key}
              className="flex cursor-pointer items-center justify-between gap-4 rounded-2xl bg-slate-50 p-4"
            >
              <div>
                <p className="font-bold text-slate-800">{category.label}</p>
                <p className="mt-1 text-xs text-slate-500">{category.description}</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(preferences[category.key])}
                onChange={(e) => toggleCategory(category.key, e.target.checked)}
                className="h-5 w-5 shrink-0 accent-[var(--accent)]"
              />
            </label>
          ))}
          <p className="pt-1 text-xs text-slate-400">
            These control which notifications can be sent as browser push. Turning a category off doesn't
            affect your in-app notification bell.
          </p>
        </div>
      )}
    </section>
  );
}
