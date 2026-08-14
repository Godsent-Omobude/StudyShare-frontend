import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/api";

const navItems = [
  { to: "/", label: "Dashboard", icon: "⌂", end: true },
  { to: "/materials", label: "My Materials", icon: "▣" },
  { to: "/upload", label: "Upload Material", icon: "↥" },
  { to: "/generate-flashcards", label: "Generate Flashcards", icon: "✦" },
  { to: "/my-flashcards", label: "My Flashcards", icon: "▤" },
];

export default function Sidebar({ open, onClose }) {
  const navigate = useNavigate();
  const fullName = localStorage.getItem("fullName") || "Student";
  const username = localStorage.getItem("username") || "";
  const role = localStorage.getItem("role") || "student";
  const isAdmin = role === "admin";
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";
    const loadPicture = async () => {
      try {
        if (!localStorage.getItem("profilePicture")) return;
        const response = await api.get("/settings/profile-picture", { responseType: "blob" });
        objectUrl = URL.createObjectURL(response.data);
        setProfilePictureUrl(objectUrl);
      } catch {
        setProfilePictureUrl("");
      }
    };
    loadPicture();
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, []);

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <>
      {open && (
        <button
          aria-label="Close menu"
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-950/50 lg:hidden"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-[#07152f] text-white transition-transform duration-300 lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-violet-600 text-2xl shadow-lg">
            ◈
          </div>
          <div className="text-2xl font-black tracking-tight">
            Study<span className="text-violet-400">Share</span>
          </div>
          <button
            onClick={onClose}
            className="ml-auto rounded-lg px-2 py-1 text-slate-400 hover:bg-white/10 lg:hidden"
          >
            ×
          </button>
        </div>

        <div className="border-b border-white/10 px-5 py-5">
          <div className="flex items-center gap-3">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="h-12 w-12 rounded-full object-cover ring-2 ring-white/20"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-violet-600 text-xl font-bold">
                {(fullName[0] || "S").toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate font-bold">{fullName}</p>
              <p className="text-sm text-slate-400">{username || "Student"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Main
          </p>

          <div className="space-y-1.5">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                      : "text-slate-300 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="flex w-6 justify-center text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            ))}
          </div>

          {isAdmin && (
            <>
              <p className="mt-8 px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-violet-400">
                Administration
              </p>

              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-violet-600 text-white shadow-lg shadow-violet-950/30"
                      : "text-violet-200 hover:bg-white/10 hover:text-white"
                  }`
                }
              >
                <span className="flex w-6 justify-center text-lg">◆</span>
                Admin Workspace
              </NavLink>
            </>
          )}

          <p className="mt-8 px-3 pb-3 text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
            Account
          </p>

          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold text-slate-300 hover:bg-white/10 hover:text-white"
          >
            <span className="w-6 text-center">⚙</span>
            Settings
          </NavLink>
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            onClick={logout}
            className="flex w-full items-center gap-3 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-red-300 transition hover:bg-red-500/10"
          >
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}
