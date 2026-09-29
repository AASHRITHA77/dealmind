import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, Calendar, MessageSquare, ArrowRight, DollarSign } from 'lucide-react';

export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
  const colorStyles = {
    blue: 'border-blue-500/20 bg-blue-950/10 text-blue-400',
    cyan: 'border-cyan-500/20 bg-cyan-950/10 text-cyan-400',
    emerald: 'border-emerald-500/20 bg-emerald-950/10 text-emerald-400',
    purple: 'border-purple-500/20 bg-purple-950/10 text-purple-400'
  };

  return (
    <div className={`p-6 rounded-2xl bg-slate-900 border ${colorStyles[color]} shadow-xl flex items-center justify-between`}>
      <div>
        <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</p>
        <p className="text-2xl font-bold text-white mt-2">{value}</p>
        {trend && <p className="text-xs text-emerald-400 mt-1 font-medium">{trend}</p>}
      </div>
      <div className={`p-3 rounded-xl border ${colorStyles[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
    </div>
  );
};

export const DealCard = ({ deal }) => {
  const navigate = useNavigate();

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(deal.deal_value || 0);

  return (
    <div 
      onClick={() => navigate(`/deals/${deal.id}`)}
      className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/50 hover:bg-slate-800/40 transition cursor-pointer group shadow-lg flex flex-col justify-between"
    >
      <div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <h3 className="font-semibold text-white group-hover:text-cyan-300 transition">
              {deal.company?.name || `Deal #${deal.id}`}
            </h3>
          </div>
          <span className="px-2.5 py-1 text-xs font-semibold bg-blue-950/60 text-blue-400 border border-blue-800/50 rounded-full">
            {deal.stage}
          </span>
        </div>

        <div className="mt-4 flex items-baseline space-x-1">
          <span className="text-2xl font-extrabold text-white">{formattedValue}</span>
        </div>

        <div className="mt-4 space-y-2 text-xs text-slate-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              <span>Target Close:</span>
            </span>
            <span className="font-medium text-slate-300">{deal.expected_close_date || 'N/A'}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="flex items-center space-x-1">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" />
              <span>Interactions:</span>
            </span>
            <span className="font-medium text-slate-300">{deal.meetings_count || 0} meetings</span>
          </div>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-blue-400 group-hover:text-cyan-300 font-medium">
        <span>View Deal Intelligence</span>
        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
      </div>
    </div>
  );
};

export const ContactCard = ({ contact }) => (
  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 flex items-center space-x-3">
    <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center font-bold text-slate-300 text-sm">
      {contact.name ? contact.name.split(' ').map(n => n[0]).join('') : 'C'}
    </div>
    <div>
      <h4 className="text-sm font-semibold text-white">{contact.name}</h4>
      <p className="text-xs text-cyan-400">{contact.role || 'Key Decision Maker'}</p>
      <p className="text-xs text-slate-500 mt-0.5">{contact.email}</p>
    </div>
  </div>
);

export const MeetingCard = ({ meeting, onClick }) => (
  <div 
    onClick={onClick}
    className="p-4 rounded-xl bg-slate-900 border border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40 transition cursor-pointer space-y-2"
  >
    <div className="flex items-center justify-between">
      <span className="text-xs font-semibold text-cyan-400 px-2 py-0.5 bg-cyan-950/50 border border-cyan-800/40 rounded">
        {meeting.date}
      </span>
      <span className="text-xs text-slate-500">Meeting ID: #{meeting.id}</span>
    </div>
    <h4 className="text-sm font-bold text-slate-200">{meeting.title}</h4>
    <p className="text-xs text-slate-400 line-clamp-2">{meeting.summary || meeting.notes}</p>
    {meeting.next_action && (
      <div className="text-xs text-emerald-400 bg-emerald-950/30 p-2 rounded border border-emerald-900/30 font-medium">
        Next: {meeting.next_action}
      </div>
    )}
  </div>
);
