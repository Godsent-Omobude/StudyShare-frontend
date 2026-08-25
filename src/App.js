import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Materials from "./pages/Materials";
import GenerateFlashcards from "./pages/GenerateFlashcard";
import MyFlashcards from "./pages/MyFlashcards";
import StudyAll from "./pages/StudyAll";
import StudyCircles from "./pages/StudyCircles";
import StudyCircleDetail from "./pages/StudyCircleDetail";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Sidebar from "./components/Sidebar";
import Settings from "./pages/Settings";
import NotificationBell from "./components/NotificationBell";
import JoinCircleInvitation from "./pages/JoinCircleInvitation";

function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fullName = localStorage.getItem("fullName") || "Student";
  const username = localStorage.getItem("username") || "";

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50 lg:flex">
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <div className="min-w-0 flex-1">
          <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur sm:px-6 lg:h-[72px] lg:px-8">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95 lg:hidden"
            >
              ☰
            </button>

            <div className="ml-auto flex min-w-0 items-center gap-2">
              <NotificationBell />
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-accent text-sm font-bold text-white">
                {(fullName[0] || "S").toUpperCase()}
              </div>
              <div className="hidden max-w-[150px] sm:block">
                <p className="truncate text-sm font-bold text-slate-800">
                  {fullName}
                </p>
                <p className="truncate text-xs text-slate-500">
                  {username || "Student"}
                </p>
              </div>
            </div>
          </header>

          {children}
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  useEffect(() => {
    const apply = () => {
      const theme = localStorage.getItem("theme") || "system";
      const accent = localStorage.getItem("accentColor") || "blue";
      document.documentElement.dataset.theme = theme;
      document.documentElement.dataset.accent = accent;
    };

    apply();
    window.addEventListener("study2gate-appearance-change", apply);
    return () =>
      window.removeEventListener("study2gate-appearance-change", apply);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />

        <Route
          path="/"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/generate-flashcards"
          element={
            <ProtectedLayout>
              <GenerateFlashcards />
            </ProtectedLayout>
          }
        />

        <Route
          path="/my-flashcards"
          element={
            <ProtectedLayout>
              <MyFlashcards />
            </ProtectedLayout>
          }
        />

        <Route
          path="/my-flashcards/:id"
          element={
            <ProtectedLayout>
              <MyFlashcards />
            </ProtectedLayout>
          }
        />

        <Route
          path="/my-flashcards/study-all"
          element={
            <ProtectedLayout>
              <StudyAll />
            </ProtectedLayout>
          }
        />

        <Route
          path="/circles"
          element={
            <ProtectedLayout>
              <StudyCircles />
            </ProtectedLayout>
          }
        />

        <Route
          path="/circles/join/:token"
          element={
            <ProtectedLayout>
              <JoinCircleInvitation />
            </ProtectedLayout>
          }
        />

        <Route
          path="/circles/:id"
          element={
            <ProtectedLayout>
              <StudyCircleDetail />
            </ProtectedLayout>
          }
        />

        <Route
          path="/materials"
          element={
            <ProtectedLayout>
              <Materials />
            </ProtectedLayout>
          }
        />

        <Route
          path="/upload"
          element={
            <ProtectedLayout>
              <Dashboard />
            </ProtectedLayout>
          }
        />

        <Route
          path="/settings"
          element={
            <ProtectedLayout>
              <Settings />
            </ProtectedLayout>
          }
        />

        <Route
          path="/admin"
          element={
            <ProtectedLayout>
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            </ProtectedLayout>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
