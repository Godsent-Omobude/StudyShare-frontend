// Notification-permission flow and FCM token helpers. Nothing in this file
// calls the browser permission prompt on its own — see requestPermissionAndRegister,
// which is only ever called from an explicit user action in
// Settings → Notifications (never on page load).
import { getToken, onMessage, deleteToken } from "firebase/messaging";
import { getMessagingIfSupported, isFirebaseConfigured, vapidKey } from "./config";

// sw.js is the app's single service worker — it handles both PWA offline
// caching and Firebase Cloud Messaging background push (see
// scripts/generate-firebase-sw.js for why these had to be merged into one
// file rather than two workers competing for the same "/" scope). It's
// registered unconditionally on app load in src/index.js; this constant
// is reused here so the FCM token request attaches to that same
// registration instead of creating a second one.
const SERVICE_WORKER_URL = "/sw.js";

// One of: "unsupported" | "not-requested" | "granted" | "denied"
export const getPermissionState = () => {
  if (!isFirebaseConfigured()) return "unsupported";
  if (typeof window === "undefined" || !("Notification" in window) || !("serviceWorker" in navigator)) {
    return "unsupported";
  }
  if (Notification.permission === "granted") return "granted";
  if (Notification.permission === "denied") return "denied";
  return "not-requested";
};

const registerServiceWorker = async () => {
  // index.js already registers sw.js unconditionally on app load (for PWA
  // installability, independent of notification permission). Calling
  // register() again here with the same script URL/scope doesn't create a
  // second worker — the browser resolves it to that same registration —
  // but doing it explicitly here too means this call can still be awaited
  // before requesting an FCM token, even if index.js's registration
  // hasn't settled yet.
  return navigator.serviceWorker.register(SERVICE_WORKER_URL, { updateViaCache: "none" });
};

const describeDevice = () => {
  const ua = navigator.userAgent || "";
  let browser = "Browser";
  if (ua.includes("Edg/")) browser = "Edge";
  else if (ua.includes("Chrome/")) browser = "Chrome";
  else if (ua.includes("Firefox/")) browser = "Firefox";
  else if (ua.includes("Safari/")) browser = "Safari";

  let os = "device";
  if (ua.includes("Windows")) os = "Windows";
  else if (ua.includes("Mac OS")) os = "Mac";
  else if (ua.includes("Android")) os = "Android";
  else if (ua.includes("iPhone") || ua.includes("iPad")) os = "iOS";
  else if (ua.includes("Linux")) os = "Linux";

  return `${browser} on ${os}`;
};

// The full opt-in flow: requests browser permission (must be called from a
// user gesture triggered by an explicit "Enable notifications" action —
// see Settings), registers the service worker, and obtains the current FCM
// token. Does NOT talk to the Study2Gate backend — the caller is
// responsible for sending the returned token to POST /notifications/register.
export const requestPermissionAndRegister = async () => {
  if (!isFirebaseConfigured()) {
    throw new Error("Notifications are not configured for this deployment.");
  }

  const messaging = await getMessagingIfSupported();
  if (!messaging) {
    throw new Error("Notifications aren't supported in this browser.");
  }

  const permission = await Notification.requestPermission();
  if (permission !== "granted") {
    return { permission, token: null };
  }

  const registration = await registerServiceWorker();
  const token = await getToken(messaging, {
    vapidKey,
    serviceWorkerRegistration: registration,
  });

  if (!token) {
    throw new Error("Unable to obtain a push registration token.");
  }

  return { permission, token, deviceInfo: describeDevice() };
};

// Re-confirms/refreshes the current token for a user who previously
// enabled notifications and already granted permission — used on app load
// so a rotated FCM token stays registered without asking for permission
// again. Resolves to null if permission isn't already granted, silently
// (this is a background refresh, not a user-initiated action).
export const refreshTokenIfPermitted = async () => {
  if (getPermissionState() !== "granted") return null;
  try {
    const messaging = await getMessagingIfSupported();
    if (!messaging) return null;
    const registration = await registerServiceWorker();
    const token = await getToken(messaging, { vapidKey, serviceWorkerRegistration: registration });
    return token ? { token, deviceInfo: describeDevice() } : null;
  } catch (error) {
    console.warn("Push token refresh failed:", error.message);
    return null;
  }
};

// Best-effort local + FCM-side cleanup when the user disables notifications
// from Settings. The caller is still responsible for telling the backend
// via DELETE /notifications/unregister.
export const revokeLocalToken = async () => {
  try {
    const messaging = await getMessagingIfSupported();
    if (messaging) await deleteToken(messaging);
  } catch {
    // Non-fatal — the backend registration is removed independently.
  }
};

// Foreground messages (tab open and focused) are intentionally NOT shown
// as a native OS notification here — the existing Socket.IO-driven
// NotificationBell already reflects them in real time while the app is
// open, so showing a duplicate system popup on top would be redundant.
// Background/closed-tab notifications are handled entirely by public/sw.js
// instead (see scripts/generate-firebase-sw.js). `callback` is invoked with the
// raw FCM payload for callers that want to react to it further (e.g. a
// lightweight in-app toast).
export const listenForForegroundMessages = async (callback) => {
  const messaging = await getMessagingIfSupported();
  if (!messaging) return () => {};
  return onMessage(messaging, callback);
};
