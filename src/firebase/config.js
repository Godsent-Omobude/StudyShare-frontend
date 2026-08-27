// Central Firebase configuration module — every other file that needs
// Firebase (messaging.js, the service worker) reads its config values from
// here, so there is exactly one place that assembles them from env vars.
//
// Everything in `firebaseConfig` below is the public Firebase *web app*
// configuration. These values identify your Firebase project to the
// browser SDK; they are not secret (Firebase's own docs confirm this) and
// are safe to ship in frontend JS. The private Admin SDK credentials used
// to *send* pushes live only on the backend — see
// backend/config/firebaseAdmin.js — and must never appear here.
import { initializeApp, getApps, getApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

export const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
};

export const vapidKey = process.env.REACT_APP_FIREBASE_VAPID_KEY;

export const isFirebaseConfigured = () =>
  Boolean(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId && vapidKey);

let appInstance = null;

export const getFirebaseApp = () => {
  if (!isFirebaseConfigured()) return null;
  if (!appInstance) {
    appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
};

// Firebase Messaging isn't available in every browser (e.g. Safari <16.4,
// or any browser with the Push API / Service Worker disabled). This
// resolves to the messaging instance only when it's actually usable.
export const getMessagingIfSupported = async () => {
  const app = getFirebaseApp();
  if (!app) return null;
  try {
    const supported = await isSupported();
    return supported ? getMessaging(app) : null;
  } catch {
    return null;
  }
};
