import React from "react";
import { Link, useLocation } from "react-router-dom";
import { FiPhone } from "react-icons/fi";

const Navbar = () => {
  const location = useLocation();


  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur-2xl">
      <div className="max-w-5xl mx-auto px-4 sm:px-8 h-16 flex items-center justify-between">

        {/* Brand / Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 group transition-transform duration-300 hover:scale-[1.02]"
        >
          <div className="w-9 h-9 rounded-xl bg-white text-black flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.2)]">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3zM19 10v2a7 7 0 01-14 0v-2m7 9v4m-4 0h8"
              />
            </svg>
          </div>

          <div>
            <p className="font-bold text-lg tracking-tight text-white group-hover:text-zinc-200 transition-colors">
              Vaami
            </p>
            <p className="hidden sm:block text-[10px] text-zinc-400 font-mono -mt-1 uppercase tracking-wider">
              Voice AI
            </p>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 bg-white/[0.03] p-1 border border-white/10 rounded-2xl backdrop-blur-md">
          <Link
            to="/"
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all duration-300 ${
              isActive("/")
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            Dashboard
          </Link>

          <Link
            to="/call"
            className={`px-4 py-1.5 rounded-xl text-xs font-semibold font-mono transition-all duration-300 ${
              isActive("/call")
                ? "bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.2)]"
                : "text-zinc-400 hover:text-white hover:bg-white/5"
            }`}
          >
            New Call
          </Link>
        </nav>

      
        <div className="flex items-center gap-3">

      
        

   
          <Link
            to="/call"
            className="inline-flex items-center justify-center gap-2 bg-white hover:bg-zinc-200 text-black font-semibold px-4 py-2 rounded-xl shadow-[0_0_15px_rgba(255,255,255,0.15)] transition-all duration-300 hover:scale-[1.02] active:scale-95 text-xs sm:text-sm"
          >
            <FiPhone className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Start Call</span>
          </Link>

        </div>

      </div>
    </header>
  );
};

export default Navbar;