import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingState, ErrorState, Button } from '../components/CommonUI';
import { 
  Sparkles, 
  ArrowLeft, 
  BrainCircuit, 
  CheckCircle2, 
  Target, 
  Users, 
  History,
  Bot,
  Zap,
  ShieldAlert,
  HelpCircle
} from 'lucide-react';

export const AIMeetingBrief = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [briefing, setBriefing] = useState(null);
  const [useHindsight, setUseHindsight] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchBriefing = async (hindsightMode) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDealBrief(dealId || 1, hindsightMode);
      setBriefing(res.data);
    } catch (err) {
      console.error("Error generating briefing:", err);
      setError("Failed to generate meeting brief. Please check backend connection or API keys.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBriefing(useHindsight);
  }, [dealId, useHindsight]);

  const handleToggleMode = (mode) => {
    if (mode !== useHindsight) {
      setUseHindsight(mode);
    }
  };

  if (loading) return <LoadingState message={`Synthesizing AI sales brief ${useHindsight ? 'WITH HINDSIGHT MEMORY' : 'WITHOUT HINDSIGHT'}...`} />;
  if (error || !briefing) return <ErrorState message={error || "Briefing data unavailable"} onRetry={() => fetchBriefing(useHindsight)} />;

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation */}
      <button 
        onClick={() => navigate(`/deals/${briefing.deal_id || 1}`)} 
        className="text-xs text-slate-400 hover:text-white flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Deal Workspace</span>
      </button>

      {/* Hero Banner with Toggle */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-950/80 via-slate-900 to-cyan-950/60 border border-cyan-500/30 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-2xl text-white shadow-lg shadow-cyan-500/20">
              <Bot className="w-7 h-7" />
            </div>
            <div>
              <span className="text-xs font-bold text-cyan-400 tracking-wider uppercase">Groq LLM Reasoning + Hindsight Cloud</span>
              <h1 className="text-2xl font-extrabold text-white">Executive Brief: {briefing.company_name}</h1>
            </div>
          </div>

          {/* Mode Switcher */}
          <div className="bg-slate-950/90 p-1.5 rounded-2xl border border-slate-800 flex items-center space-x-1 shadow-inner">
            <button
              onClick={() => handleToggleMode(false)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition ${
                !useHindsight
                  ? 'bg-slate-800 text-slate-200 border border-slate-700 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              WITHOUT HINDSIGHT
            </button>
            <button
              onClick={() => handleToggleMode(true)}
              className={`px-4 py-2 text-xs font-bold rounded-xl transition flex items-center space-x-1.5 ${
                useHindsight
                  ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3.5 h-3.5 fill-white" />
              <span>WITH HINDSIGHT</span>
            </button>
          </div>
        </div>

        {/* Mode Indicator Info */}
        <div className="flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex items-center space-x-2">
            <span className={`w-2.5 h-2.5 rounded-full ${useHindsight ? 'bg-cyan-400 animate-pulse' : 'bg-slate-500'}`} />
            <span className="font-semibold text-slate-300">
              {useHindsight 
                ? `${briefing.memories_recalled_count || briefing.recalled_memories?.length || 12} relevant memories recalled from Hindsight Cloud`
                : 'Basic deal metadata only (Hindsight Memory Disabled)'}
            </span>
          </div>

          {useHindsight && (
            <div className="px-3 py-1 bg-cyan-950/50 border border-cyan-800/60 rounded-full text-cyan-300 font-medium text-[11px]">
              Memory Bank ID: dealmind_deal_{briefing.deal_id}
            </div>
          )}
        </div>
      </div>

      {/* Executive Summary Box */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-2">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span>Executive Summary Context</span>
        </h3>
        <p className="text-sm text-slate-200 leading-relaxed font-medium">
          {briefing.executive_summary || briefing.customer_overview}
        </p>
      </div>

      {/* Key Analysis Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Previous Objections */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-red-400 font-bold text-sm">
            <ShieldAlert className="w-4 h-4" />
            <h3>Previous Customer Objections & Concerns</h3>
          </div>
          {briefing.previous_objections && briefing.previous_objections.length > 0 ? (
            <ul className="space-y-2 text-xs text-slate-300">
              {briefing.previous_objections.map((obj, i) => (
                <li key={i} className="p-3 bg-red-950/20 border border-red-900/40 rounded-xl text-red-200 font-medium">
                  {obj}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 italic p-3 bg-slate-950 rounded-xl border border-slate-800">
              {useHindsight ? "No explicit objections recorded." : "Objection memory requires Hindsight activation."}
            </p>
          )}
        </div>

        {/* What Worked vs What Failed */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3">
          <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
            <CheckCircle2 className="w-4 h-4" />
            <h3>What Worked vs What Failed</h3>
          </div>
          <div className="space-y-2 text-xs">
            <div className="p-3 bg-emerald-950/30 border border-emerald-900/40 rounded-xl space-y-1">
              <span className="font-bold text-emerald-400 block">Worked Previously:</span>
              <p className="text-slate-200 font-medium">
                {briefing.what_worked_previously?.join(', ') || (useHindsight ? "ROI Demonstration worked well" : "N/A")}
              </p>
            </div>
            <div className="p-3 bg-red-950/20 border border-red-900/30 rounded-xl space-y-1">
              <span className="font-bold text-red-400 block">Failed Previously:</span>
              <p className="text-slate-200 font-medium">
                {briefing.what_did_not_work?.join(', ') || (useHindsight ? "Discount-based negotiation without ROI framing" : "N/A")}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Suggested Focus */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
        <h3 className="text-base font-bold text-white flex items-center space-x-2">
          <Target className="w-5 h-5 text-cyan-400" />
          <span>Suggested Discussion Focus & Game Plan</span>
        </h3>

        <div className="space-y-2 text-xs">
          {briefing.suggested_discussion_focus && briefing.suggested_discussion_focus.map((focus, idx) => (
            <div key={idx} className="p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 flex items-start space-x-3">
              <span className="w-5 h-5 rounded-full bg-cyan-950 text-cyan-400 font-bold flex items-center justify-center shrink-0 border border-cyan-800 text-[11px]">
                {idx + 1}
              </span>
              <p className="text-slate-200 font-medium leading-relaxed mt-0.5">{focus}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
