import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (event) => {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);
      const response = await api.post("/auth/login", { username, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("fullName", response.data.fullName || username);
      localStorage.setItem("username", response.data.username || username);
      localStorage.setItem("email", response.data.email || "");
      localStorage.setItem("matricNumber", response.data.matricNumber || "");
      localStorage.setItem("role", response.data.role || "student");
      localStorage.setItem("profilePicture", response.data.profilePicture || "");
      localStorage.setItem("theme", response.data.theme || "system");
      localStorage.setItem("accentColor", response.data.accentColor || "blue");

      navigate("/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication system failure.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07152f] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-[#07152f] to-blue-700 p-12 text-white lg:block">
            <div className="text-3xl font-black">
              Study<span className="text-blue-300">Share</span>
            </div>
            <div className="mt-24">
              <p className="text-sm font-bold uppercase tracking-widest text-blue-200">
                Academic workspace
              </p>
              <h1 className="mt-4 text-5xl font-black leading-tight">
                Study smarter with your own materials.
              </h1>
              <p className="mt-5 max-w-md text-slate-200">
                Share resources, generate AI flashcards and revise from one organised student platform.
              </p>
            </div>
          </div>

          <div className="p-7 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-black text-slate-900">Welcome back</h2>
              <p className="mt-2 text-sm text-slate-500">
                Sign in to continue to StudyShare.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleLogin} className="mt-7 space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700">Username</label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    autoComplete="username"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">Password</label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-blue-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 hover:bg-blue-700 disabled:opacity-60"
                >
                  {loading ? "Signing in..." : "Sign In"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                New to StudyShare?{" "}
                <Link to="/register" className="font-bold text-blue-700 hover:underline">
                  Create an account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
