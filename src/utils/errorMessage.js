// A failed axios request with no `response` means the backend never
// answered at all (crashed, mid-deploy, cold-starting, network drop) —
// as opposed to a normal 4xx/5xx, which means it answered with a real
// error. Surfacing the same generic "invalid request" copy for both reads
// as "your password is wrong" when the truth is "the site is down," so
// callers should branch on this rather than always falling back to a
// fixed string.
export function friendlyErrorMessage(err, fallback) {
  if (!err?.response) {
    return "We can't reach our servers right now. This may be a temporary outage — please try again in a minute.";
  }
  return err.response?.data?.message || fallback;
}
