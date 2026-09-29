import React from 'react';
import { Search, Bell, UserCheck } from 'lucide-react';

export const Navbar = ({ title }) => {
  return (
    <header className="h-16 border-b border-slate-800 bg-slate-900/50 backdrop-blur-md px-8 flex items-center justify-between sticky top-0 z-40">
      <h2 className="text-xl font-bold text-white tracking-wide">{title}</h2>

      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
          <input
            type="text"
            placeholder="Search deals, companies..."
            className="bg-slate-950/80 text-sm text-slate-200 pl-9 pr-4 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-blue-500 w-64 transition"
          />
        </div>

        {/* Status indicator */}
        <div className="flex items-center space-x-2 bg-emerald-950/30 border border-emerald-800/40 px-3 py-1 rounded-full text-xs text-emerald-400">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Agent Ready</span>
        </div>

        {/* User profile */}
        <div className="flex items-center space-x-3 border-l border-slate-800 pl-4">
          <div className="w-8 h-8 rounded-full bg-blue-600/30 border border-blue-500/40 flex items-center justify-center text-blue-400 font-semibold text-xs">
            SA
          </div>
          <div className="text-xs">
            <p className="font-semibold text-slate-200">Sales Executive</p>
            <p className="text-slate-500">DealMind Agent</p>
          </div>
        </div>
      </div>
    </header>
  );
};
