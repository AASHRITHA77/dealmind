import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingState, ErrorState } from '../components/CommonUI';
import { History, ArrowLeft, BrainCircuit, Calendar, CheckCircle2 } from 'lucide-react';

export const MemoryTimeline = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemoryTimeline = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDeal(dealId || 1);
      setDeal(res.data);
    } catch (err) {
      setError("Failed to load Hindsight memory timeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemoryTimeline();
  }, [dealId]);

  if (loading) return <LoadingState message="Recalling long-term memories from Hindsight..." />;
  if (error || !deal) return <ErrorState message={error || "Memory stream unavailable"} onRetry={fetchMemoryTimeline} />;

  const meetings = deal.meetings || [];

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Navigation */}
      <button 
        onClick={() => navigate(`/deals/${deal.id}`)} 
        className="text-xs text-slate-400 hover:text-white flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Deal Workspace</span>
      </button>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl flex items-center justify-between">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-purple-950/80 border border-purple-800/60 rounded-full text-purple-400 text-xs font-semibold">
            <BrainCircuit className="w-3.5 h-3.5" />
            <span>Hindsight Memory Engine — RECALL Stream</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white">
            Memory Timeline: {deal.company?.name}
          </h1>
          <p className="text-xs text-slate-400">
            Chronological log of customer interactions retained in long-term AI memory for Deal #{deal.id}.
          </p>
        </div>

        <div className="text-right">
          <span className="text-2xl font-black text-cyan-400">{meetings.length}</span>
          <span className="block text-[11px] font-semibold uppercase text-slate-400">Memories Retained</span>
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="relative pl-6 space-y-8 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
        {meetings.length > 0 ? (
          meetings.map((m) => (
            <div key={m.id} className="relative pl-6 group">
              {/* Timeline marker */}
              <div className="absolute -left-6 top-1.5 w-5 h-5 rounded-full bg-slate-900 border-2 border-cyan-500 flex items-center justify-center group-hover:scale-125 group-hover:bg-cyan-500 transition">
                <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 group-hover:bg-slate-950" />
              </div>

              {/* Memory Card */}
              <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3 hover:border-slate-700 transition">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-xs font-bold text-cyan-400 px-2.5 py-1 bg-cyan-950/60 border border-cyan-800/50 rounded-lg flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{m.date}</span>
                    </span>
                    <h3 className="font-bold text-white text-base">{m.title}</h3>
                  </div>
                  <span className="text-[11px] text-slate-500">Memory ID: #{m.id}</span>
                </div>

                <div className="text-xs text-slate-300 leading-relaxed bg-slate-950/80 p-4 rounded-xl border border-slate-800/80">
                  <p className="font-semibold text-slate-400 mb-1">Retained Summary Context:</p>
                  {m.notes || m.summary}
                </div>

                {(m.outcome || m.next_action) && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 text-xs">
                    {m.outcome && (
                      <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800">
                        <span className="font-semibold text-slate-400 block mb-0.5">Key Outcome:</span>
                        <span className="text-slate-200">{m.outcome}</span>
                      </div>
                    )}
                    {m.next_action && (
                      <div className="p-2.5 bg-emerald-950/30 rounded-lg border border-emerald-900/40">
                        <span className="font-semibold text-emerald-400 block mb-0.5">Action Item:</span>
                        <span className="text-slate-200">{m.next_action}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        ) : (
          <p className="text-xs text-slate-500 py-8 text-center">No memories logged in timeline yet.</p>
        )}
      </div>
    </div>
  );
};
