import React, { useEffect, useState } from "react";
import { useNavigate, Link, useLocation } from "react-router-dom";
import api from "../api/api";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();

  const userName = localStorage.getItem("fullName") || "Student";
  const [profilePictureUrl, setProfilePictureUrl] = useState("");

  useEffect(() => {
    let objectUrl = "";

    const loadProfilePicture = async () => {
      try {
        if (!localStorage.getItem("profilePicture")) {
          setProfilePictureUrl("");
          return;
        }

        const response = await api.get("/settings/profile-picture", {
          responseType: "blob",
        });

        objectUrl = URL.createObjectURL(response.data);
        setProfilePictureUrl(objectUrl);
      } catch {
        setProfilePictureUrl("");
      }
    };

    loadProfilePicture();

    return () => {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">

          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-brand-blue tracking-tight">
              StudyShare
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              to="/"
              className="text-sm font-semibold text-slate-600 hover:text-brand-blue transition"
            >
              Home
            </Link>

            {profilePictureUrl ? (
              <img
                src={profilePictureUrl}
                alt="Profile"
                className="h-10 w-10 rounded-full object-cover border-2 border-brand-blue shadow-sm"
              />
            ) : (
              <span className="text-xs font-medium bg-blue-50 text-brand-blue px-3 py-1.5 rounded-full border border-blue-200">
                🎓 {userName}
              </span>
            )}

            <button
              onClick={handleLogout}
              className="text-sm font-bold text-red-600 hover:text-red-700 transition"
            >
              Logout
            </button>
          </div>

        </div>
      </div>
    </nav>
  );
}