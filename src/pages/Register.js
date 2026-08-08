import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../api/api";
import studyshareLogo from "../assets/studyshare-logo.png";

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
    <div className="min-h-screen bg-[#07152f] px-4 py-6 sm:py-10">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md items-center justify-center">
        <div className="w-full overflow-hidden rounded-3xl bg-white shadow-2xl">

          {/* StudyShare branding comes first */}
          <div className="bg-gradient-to-br from-[#07152f] via-[#0b2d66] to-[#1464d2] px-6 pb-7 pt-8 text-white">
            <div className="flex items-center justify-center gap-3">

              {/* StudyShare logo */}
              <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl bg-white/15 shadow-lg ring-1 ring-white/20">
                <img
                  src={studyshareLogo}
                  alt="StudyShare"
                  className="h-full w-full object-cover"
                />
              </div>

              <h1 className="text-3xl font-black tracking-tight">
                Study<span className="text-blue-200">Share</span>
              </h1>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-100">
                Share. Learn. Succeed.
              </p>

              <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-blue-50">
                Your notes. Your flashcards. Your study space.
              </p>
            </div>
          </div>

          <div className="px-6 pb-8 pt-7 sm:px-8">
            <div className="mx-auto max-w-md">

              <h2 className="text-2xl font-black tracking-tight text-slate-900 sm:text-3xl">
                Create Account
              </h2>

              <p className="mt-2 text-sm leading-5 text-slate-500">
                Set up your StudyShare student account.
              </p>

              {error && (
                <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm font-semibold leading-5 text-red-700">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="mt-6 space-y-5">

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Full Name
                  </label>

                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    autoComplete="name"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
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
                    autoComplete="username"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm uppercase text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />

                  <p className="mt-2 text-xs leading-4 text-slate-400">
                    Your matriculation number must start with BMS.
                  </p>
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-700">
                    Password
                  </label>

                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    autoComplete="new-password"
                    className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-[#1464d2] py-3.5 text-sm font-black text-white shadow-lg shadow-blue-200 transition hover:bg-[#0d55b8] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? "Creating..." : "Create Account"}
                </button>

              </form>

              <p className="mt-6 text-center text-sm text-slate-500">
                Already registered?{" "}
                <Link
                  to="/login"
                  className="font-bold text-[#1464d2] hover:underline"
                >
                  Log in
                </Link>
              </p>

              <div className="mt-7 border-t border-slate-100 pt-5 text-center">
                <p className="text-[10px] font-black uppercase tracking-[0.12em] text-[#1464d2]">
                  A STUDENT PLATFORM BY GODSENT OMOBUDE
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}