import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function Register() {
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (event) => {
    event.preventDefault();
    setError("");

    if (!username.toUpperCase().startsWith("BMS")) {
      setError("Access denied: Invalid matriculation number.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/auth/register", {
        fullName,
        username,
        password,
      });

      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem(
          "fullName",
          response.data.fullName || fullName
        );
        localStorage.setItem("username", username);
        navigate("/");
      } else {
        navigate("/login");
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failure."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#07152f] px-4 py-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-2xl lg:grid-cols-2">
          <div className="hidden bg-gradient-to-br from-[#07152f] to-violet-700 p-12 text-white lg:block">
            <div className="text-3xl font-black">
              Study<span className="text-violet-300">Share</span>
            </div>
            <div className="mt-24">
              <p className="text-sm font-bold uppercase tracking-widest text-violet-200">
                Join your academic workspace
              </p>
              <h1 className="mt-4 text-5xl font-black leading-tight">
                Your notes. Your flashcards. Your study space.
              </h1>
              <p className="mt-5 max-w-md text-slate-200">
                Create an account to access your shared materials and saved
                AI-generated flashcards.
              </p>
            </div>
          </div>

          <div className="sm:mx-auto w-full max-w-md z-10">
        <h2 className="text-center text-4xl font-black text-brand-dark tracking-tight">StudyShare</h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium px-4">
          A PRODUCTION BY GODSENT OMOBUDE
        </p>
      </div>

          <div className="p-7 sm:p-10 lg:p-12">
            <div className="mx-auto max-w-md">
              <h2 className="text-3xl font-black text-slate-900">
                Create account
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Set up your StudyShare student account.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="mt-7 space-y-5">
                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="John Doe"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Matriculation Number
                  </label>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="BMS2024..."
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-violet-500 focus:bg-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-violet-600 py-3.5 text-sm font-black text-white shadow-lg shadow-violet-200 hover:bg-violet-700 disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Register & Setup"}
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-bold text-violet-700 hover:underline"
                >
                  Log in
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
