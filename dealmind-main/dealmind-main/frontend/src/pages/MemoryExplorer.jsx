import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingState, ErrorState, Button } from '../components/CommonUI';
import { BrainCircuit, Search, ArrowLeft, Filter, Sparkles, Database } from 'lucide-react';

export const MemoryExplorer = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [memoriesData, setMemoriesData] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMemories = async (query = null) => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDealMemories(dealId || 1, query);
      setMemoriesData(res.data);
    } catch (err) {
      setError("Failed to load Hindsight Cloud memories.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMemories();
  }, [dealId]);

  const handleSearch = (e) => {
    e.preventDefault();
    fetchMemories(searchQuery);
  };

  if (loading) return <LoadingState message="Connecting to Hindsight Cloud memory bank..." />;
  if (error) return <ErrorState message={error} onRetry={() => fetchMemories()} />;

  const memories = memoriesData?.memories || [];

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Navigation */}
      <button 
        onClick={() => navigate(`/deals/${dealId || 1}`)} 
        className="text-xs text-slate-400 hover:text-white flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Deal Workspace</span>
      </button>

      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-slate-900 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 bg-cyan-950/80 border border-cyan-800/60 rounded-full text-cyan-400 text-xs font-semibold">
              <BrainCircuit className="w-3.5 h-3.5" />
              <span>Hindsight Cloud Memory Explorer</span>
            </div>
            <h1 className="text-2xl font-extrabold text-white">Deal Experience Memories</h1>
            <p className="text-xs text-slate-400">
              Explore long-term experience memories, objections, and learnings stored in Hindsight Bank <code className="text-cyan-400">dealmind_deal_{dealId || 1}</code>.
            </p>
          </div>

          <div className="text-right space-y-1">
            <span className="text-3xl font-black text-cyan-400">{memories.length}</span>
            <span className="block text-[11px] font-semibold uppercase text-slate-400">Memories Recalled</span>
          </div>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search Hindsight memories (e.g., pricing objection, API, competitor, ROI)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-sm text-slate-200 pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>
          <Button type="submit" variant="primary" className="px-5 py-2.5 text-xs font-bold space-x-2">
            <Filter className="w-3.5 h-3.5" />
            <span>Search RECALL</span>
          </Button>
        </form>
      </div>

      {/* Memory Cards Grid */}
      <div className="space-y-4">
        {memories.length > 0 ? (
          memories.map((mem, idx) => (
            <div key={idx} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-3 hover:border-cyan-500/40 transition">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 text-[11px] font-bold bg-cyan-950 text-cyan-400 border border-cyan-800/60 rounded-lg">
                  {mem.type || mem.memory_type || "Meeting Insight"}
                </span>
                <span className="text-[11px] text-slate-500 flex items-center space-x-1">
                  <Database className="w-3 h-3 text-slate-600" />
                  <span>Hindsight Cloud Index</span>
                </span>
              </div>

              <p className="text-sm text-slate-200 leading-relaxed font-medium bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                {mem.content || mem.memory || JSON.stringify(mem)}
              </p>
            </div>
          ))
        ) : (
          <div className="p-12 text-center bg-slate-900/50 border border-slate-800/80 rounded-2xl space-y-3">
            <BrainCircuit className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm text-slate-400 font-medium">No relevant memories found in Hindsight. This customer may be new.</p>
          </div>
        )}
      </div>
    </div>
  );
};
