import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import api from "../api/api";

export default function AdminRoute({ children }) {
  const token = localStorage.getItem("token");
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let mounted = true;

    if (!token) {
      setStatus("denied");
      return;
    }

    api
      .get("/admin/check")
      .then(() => {
        if (mounted) setStatus("allowed");
      })
      .catch(() => {
        if (mounted) setStatus("denied");
      });

    return () => {
      mounted = false;
    };
  }, [token]);

  if (!token || status === "denied") {
    return <Navigate to="/" replace />;
  }

  if (status === "checking") {
    return (
      <main className="min-h-[calc(100vh-5rem)] bg-slate-50 px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl rounded-3xl border border-slate-200 bg-white p-10 text-center shadow-sm">
          <p className="font-bold text-slate-700">
            Verifying administrator access...
          </p>
        </div>
      </main>
    );
  }

  return children;
}
