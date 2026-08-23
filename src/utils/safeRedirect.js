// Only ever allow redirecting back to an internal Study2Gate route.
// `redirect` values ultimately come from a URL query parameter, which is
// attacker-controllable, so this must reject anything that could send the
// user off-site (protocol-relative "//evil.com", "https://evil.com",
// "javascript:", backslash tricks, etc).
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
