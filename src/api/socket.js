import { io } from "socket.io-client";

const normalizeSocketUrl = (url) => {
  const trimmed = String(url || "").trim().replace(/\/$/, "");
  if (!trimmed) return "https://studyshare-backend-1-vopy.onrender.com";
  return trimmed.endsWith("/api") ? trimmed.slice(0, -4) : trimmed;
};

let socketInstance = null;

export const createStudySocket = () => {
  if (socketInstance) return socketInstance;
  socketInstance = io(normalizeSocketUrl(process.env.REACT_APP_API_URL || "https://studyshare-backend-1-vopy.onrender.com"), {
    auth: { token: localStorage.getItem("token") || "" },
    transports: ["websocket", "polling"],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 5000,
  });
  return socketInstance;
};

export const disconnectStudySocket = () => {
  if (socketInstance) {
    socketInstance.disconnect();
    socketInstance = null;
  }
};
