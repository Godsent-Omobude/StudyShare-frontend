import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

export default function Register() {
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    if (!username.toUpperCase().startsWith('BMS')) {
      setError('Access denied: Invalid matriculation number.');
      return;
    }

    try {
      const res = await axios.post(`${process.env.REACT_APP_API_URL}/api/auth/register`, { fullName, username, password });
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('fullName', res.data.fullName);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failure.');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative bg-gradient-to-b from-brand-light to-white overflow-hidden">
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none bg-center bg-no-repeat bg-contain transform scale-75"
        style={{ backgroundImage: "url('/nambs-logo.png')" }}
      />

      <div className="sm:mx-auto w-full max-w-md z-10">
        <h2 className="text-center text-4xl font-black text-brand-dark tracking-tight">StudyShare</h2>
        <p className="mt-2 text-center text-sm text-slate-500 font-medium px-4">
          AN INITIATIVE BY THE PIONEER VICE PRESIDENT OF NAMBS—Godsent Omobude
        </p>
      </div>

      <div className="mt-8 sm:mx-auto w-full max-w-md z-10 px-4">
        <div className="bg-white py-8 px-6 shadow-xl rounded-2xl border border-slate-100">
          <h3 className="text-lg font-bold text-slate-800 mb-6">Student Registration</h3>
          {error && (
            <div className="mb-4 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-lg">
              ⚠️ {error}
            </div>
          )}
          <form className="space-y-5" onSubmit={handleRegister}>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Full Name</label>
              <input
                type="text"
                placeholder="John Doe"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Matriculation Number</label>
              <input
                type="text"
                placeholder="Must start with BMS"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-700 tracking-wide uppercase">Password</label>
              <input
                type="password"
                placeholder="••••••••"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-4 py-3 border border-slate-200 rounded-xl bg-slate-50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-blue"
              />
            </div>
            <button
              type="submit"
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-brand-blue hover:bg-brand-accent focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-blue transition duration-150"
            >
              Register & Setup
            </button>
          </form>
          <div className="mt-6 text-center text-xs">
            <span className="text-slate-500">Already registered? </span>
            <Link to="/login" className="font-bold text-brand-blue hover:underline">Log In</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
