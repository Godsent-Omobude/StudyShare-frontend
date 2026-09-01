export const isSafeInternalPath = (path) => {
  if (typeof path !== "string" || !path) return false;
  if (!path.startsWith("/")) return false;
  if (path.startsWith("//")) return false;
  if (path.startsWith("/\\")) return false;
  if (/^\/\s*[/\\]/.test(path)) return false;
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(path)) return false;
  return true;
};

export const safeInternalPath = (path, fallback = "/") =>
  isSafeInternalPath(path) ? path : fallback;
