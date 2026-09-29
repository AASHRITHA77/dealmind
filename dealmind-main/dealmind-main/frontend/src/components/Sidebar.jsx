import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Building2, 
  Briefcase, 
  Sparkles, 
  History, 
  BrainCircuit 
} from 'lucide-react';

export const Sidebar = () => {
  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Companies', path: '/companies', icon: Building2 },
    { name: 'Deals', path: '/deals', icon: Briefcase },
    { name: 'AI Briefing', path: '/deals/1/brief', icon: Sparkles },
    { name: 'Memory Timeline', path: '/deals/1/timeline', icon: History },
  ];

  return (
    <aside className="w-64 bg-slate-900/90 border-r border-slate-800 min-h-screen flex flex-col">
      {/* Brand */}
      <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
        <div className="p-2 bg-gradient-to-tr from-blue-600 to-cyan-500 rounded-xl text-white shadow-lg shadow-blue-500/30">
          <BrainCircuit className="w-6 h-6" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-white tracking-wide">DealMind</h1>
          <p className="text-xs text-cyan-400 font-medium">AI Deal Intelligence</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600/20 to-cyan-500/10 text-cyan-400 border border-cyan-500/30 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80">
        <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/60 text-xs text-slate-400 space-y-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">Memory Engine:</span>
            <span className="text-emerald-400 font-medium">Hindsight</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="font-semibold text-slate-300">LLM Reasoning:</span>
            <span className="text-blue-400 font-medium">Groq</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
