import React from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const userName = localStorage.getItem('fullName');

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <nav className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black text-brand-blue tracking-tight">StudyShare</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/" className="text-sm font-semibold text-slate-600 hover:text-brand-blue transition">Home</Link>
            <span className="text-xs font-medium bg-blue-50 text-brand-blue px-3 py-1.5 rounded-full border border-blue-200">
              🎓 {userName}
            </span>
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
