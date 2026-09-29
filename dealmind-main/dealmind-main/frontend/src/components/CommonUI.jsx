import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "Loading data..." }) => (
  <div className="flex flex-col items-center justify-center p-12 space-y-3 text-slate-400">
    <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
    <p className="text-sm font-medium">{message}</p>
  </div>
);

export const ErrorState = ({ message = "Failed to load data.", onRetry }) => (
  <div className="flex flex-col items-center justify-center p-8 bg-red-950/20 border border-red-800/40 rounded-xl text-red-400 my-4 space-y-3">
    <p className="text-sm font-medium">{message}</p>
    {onRetry && (
      <button 
        onClick={onRetry}
        className="px-4 py-1.5 text-xs font-semibold bg-red-900/50 hover:bg-red-800/60 text-red-200 rounded-lg transition"
      >
        Retry
      </button>
    )}
  </div>
);

export const Button = ({ children, variant = 'primary', className = '', ...props }) => {
  const base = "inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-lg transition duration-150 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/20",
    secondary: "bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700",
    outline: "border border-slate-700 hover:bg-slate-800/50 text-slate-300",
    emerald: "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20",
  };

  return (
    <button className={`${base} ${variants[variant] || variants.primary} ${className}`} {...props}>
      {children}
    </button>
  );
};

export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <button 
            onClick={onClose}
            className="text-slate-400 hover:text-white transition rounded-lg p-1"
          >
            ✕
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};
