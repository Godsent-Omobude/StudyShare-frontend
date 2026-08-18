import { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GenerateFlashcards from "./pages/GenerateFlashcard";
import MyFlashcards from "./pages/MyFlashcards";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Sidebar from "./components/Sidebar";
import Settings from "./pages/Settings";

function ProtectedLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const fullName = localStorage.getItem("fullName") || "Student";
  const username = localStorage.getItem("username") || "";

  return (
    <ProtectedRoute>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="min-h-screen lg:ml-[290px]">
        {/* Mobile header. The redesigned desktop layout remains unchanged. */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white/95 px-4 shadow-sm backdrop-blur lg:hidden">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation menu"
              aria-expanded={sidebarOpen}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-xl font-bold text-slate-700 shadow-sm transition hover:bg-slate-50 active:scale-95"
            >
              ☰
            </button>
            <div className="text-xl font-black tracking-tight text-brand-blue">
              Study2Gate
            </div>
          </div>

          <div className="flex min-w-0 items-center gap-2">
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
    </ProtectedRoute>
  );
}

function PlaceholderPage({ title, description }) {
  return (
    <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
        <h1 className="text-3xl font-black text-slate-900">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{description}</p>
      </div>
    </main>
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
          path="/materials"
          element={
            <ProtectedLayout>
              <PlaceholderPage
                title="My Materials"
                description="Your existing materials workspace can be connected here."
              />
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
