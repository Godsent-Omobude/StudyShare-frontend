import { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import api from "../api/api";

const navItems = [
  { to: "/", label: "Dashboard", icon: "home", end: true },
  { to: "/materials", label: "My Materials", icon: "folder" },
  { to: "/upload", label: "Upload Material", icon: "upload" },
  { to: "/generate-flashcards", label: "Generate Flashcards", icon: "spark" },
  { to: "/my-flashcards", label: "My Flashcards", icon: "cards" },
];

function Icon({ name, className = "h-5 w-5" }) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: "1.9",
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };

  if (name === "home") return <svg {...common}><path d="m3 10 9-7 9 7" /><path d="M5 9.5V21h14V9.5" /><path d="M9 21v-6h6v6" /></svg>;
  if (name === "folder") return <svg {...common}><path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H10l2 2h6.5A2.5 2.5 0 0 1 21 9.5v8A2.5 2.5 0 0 1 18.5 20h-13A2.5 2.5 0 0 1 3 17.5z" /><path d="M3.5 9h17" /></svg>;
  if (name === "upload") return <svg {...common}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg>;
  if (name === "spark") return <svg {...common}><path d="m12 3 1.4 4.1L17.5 9l-4.1 1.4L12 14.5l-1.4-4.1L6.5 9l4.1-1.9z" /><path d="m19 15 .7 2.3L22 18l-2.3.7L19 21l-.7-2.3L16 18l2.3-.7z" /></svg>;
  if (name === "cards") return <svg {...common}><rect x="5" y="4" width="14" height="16" rx="2" /><path d="M8 8h8M8 12h8M8 16h5" /><path d="M3 7v10a2 2 0 0 0 2 2" /></svg>;
  if (name === "settings") return <svg {...common}><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V20h-2.6v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1A1.7 1.7 0 0 0 8 15a1.7 1.7 0 0 0-1.5-1H6v-2.6h.1A1.7 1.7 0 0 0 7.6 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1L9 6.2l.1.1A1.7 1.7 0 0 0 11 6a1.7 1.7 0 0 0 1-1.5V4h2.6v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.1V14h-.1a1.7 1.7 0 0 0-1.1 1z" /></svg>;
  if (name === "admin") return <svg {...common}><path d="M12 3 4 7v5c0 4.5 3.1 7.6 8 9 4.9-1.4 8-4.5 8-9V7z" /><path d="m9 12 2 2 4-4" /></svg>;
  return null;
}

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
        const response = await api.get("/settings/profile-picture", {
          responseType: "blob",
        });
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
          className="fixed inset-0 z-40 bg-slate-950/55 backdrop-blur-[2px]"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[290px] flex-col overflow-hidden bg-[#061634] text-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="relative flex h-[76px] items-center gap-3 border-b border-white/10 px-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-accent shadow-lg shadow-blue-950/30">
            <span className="text-lg font-black">S</span>
          </div>
          <div className="text-[23px] font-black tracking-[-0.04em]">
            Study<span className="text-blue-300">Share</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-xl text-xl text-slate-400 transition hover:bg-white/10 hover:text-white"
          >
            ×
          </button>
        </div>

        <div className="mx-4 mt-5 rounded-2xl border border-white/10 bg-white/[0.045] p-4">
          <div className="flex items-center gap-3">
            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="h-12 w-12 rounded-2xl object-cover ring-2 ring-blue-300/20"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-accent text-lg font-black shadow-lg">
                {(fullName[0] || "S").toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="truncate text-sm font-extrabold">{fullName}</p>
              <p className="mt-0.5 truncate text-xs text-slate-400">{username || "Student account"}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 overflow-y-auto px-4 py-6">
          <p className="px-3 pb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
            Study
          </p>

          <div className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
                    isActive
                      ? "bg-brand-accent text-white shadow-lg shadow-blue-950/25"
                      : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <span
                      className={`flex h-9 w-9 items-center justify-center rounded-xl transition ${
                        isActive
                          ? "bg-white/15 text-white"
                          : "bg-white/[0.04] text-slate-400 group-hover:text-blue-200"
                      }`}
                    >
                      <Icon name={item.icon} />
                    </span>
                    {item.label}
                  </>
                )}
              </NavLink>
            ))}
          </div>

          <p className="mt-8 px-3 pb-3 text-[10px] font-extrabold uppercase tracking-[0.2em] text-slate-500">
            Account
          </p>

          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={onClose}
              className={({ isActive }) =>
                `mb-1 flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
                  isActive
                    ? "bg-brand-accent text-white"
                    : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
                }`
              }
            >
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
                <Icon name="admin" />
              </span>
              Admin Workspace
            </NavLink>
          )}

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-3.5 py-3 text-sm font-bold transition ${
                isActive
                  ? "bg-brand-accent text-white"
                  : "text-slate-300 hover:bg-white/[0.07] hover:text-white"
              }`
            }
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/[0.04]">
              <Icon name="settings" />
            </span>
            Settings
          </NavLink>
        </nav>

        <div className="border-t border-white/10 p-4">
          <button
            type="button"
            onClick={logout}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border border-red-400/15 bg-red-400/[0.04] px-4 py-3 text-sm font-extrabold text-red-300 transition hover:bg-red-400/10"
          >
            <span className="text-base">↪</span>
            Log out
          </button>
        </div>
      </aside>
    </>
  );
}
