import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('token');
  const location = useLocation();

  if (token) return children;

  // Preserve exactly where the user was headed (path + query, e.g. a
  // Study Circle invitation link) so Login can send them back here once
  // they've signed in, instead of dropping them on the dashboard and
  // losing the invitation.
  const returnTo = `${location.pathname}${location.search}`;
  const redirectParam = returnTo && returnTo !== '/' ? `?redirect=${encodeURIComponent(returnTo)}` : '';
  return <Navigate to={`/login${redirectParam}`} replace />;
}
