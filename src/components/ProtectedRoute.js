import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  // The JWT itself now lives in an httpOnly cookie the JS can't read, so
  // this flag is just a UI hint set on login/logout — it decides whether
  // to render the page instantly without a server round trip. It carries
  // no authority: every actual request is still validated server-side
  // against the cookie, and a stale/wrong flag just means an API call
  // 401s and the existing interceptor in api/api.js bounces to /login.
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const location = useLocation();

  if (isLoggedIn) return children;

  // Preserve exactly where the user was headed (path + query, e.g. a
  // Study Circle invitation link) so Login can send them back here once
  // they've signed in, instead of dropping them on the dashboard and
  // losing the invitation.
  const returnTo = `${location.pathname}${location.search}`;
  const redirectParam = returnTo && returnTo !== '/' ? `?redirect=${encodeURIComponent(returnTo)}` : '';
  return <Navigate to={`/login${redirectParam}`} replace />;
}
