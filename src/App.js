import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import GenerateFlashcards from "./pages/GenerateFlashcard";
import MyFlashcards from "./pages/MyFlashcards";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import AdminDashboard from "./pages/AdminDashboard";
import Navbar from "./components/Navbar";

function ProtectedLayout({ children }) {
  return (
    <ProtectedRoute>
      <Navbar />
      {children}
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
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

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
              <PlaceholderPage
                title="Settings"
                description="Account and application settings can be added here."
              />
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
