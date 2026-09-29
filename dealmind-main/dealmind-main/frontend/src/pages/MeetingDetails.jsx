import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { LoadingState, ErrorState, Button } from '../components/CommonUI';
import { Calendar, ArrowLeft, CheckCircle, FileText, CheckSquare, Sparkles } from 'lucide-react';

export const MeetingDetails = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const [meeting, setMeeting] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMeeting = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getMeeting(meetingId || 1);
      setMeeting(res.data);
    } catch (err) {
      setError("Failed to load meeting log details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeeting();
  }, [meetingId]);

  if (loading) return <LoadingState message="Fetching detailed call record..." />;
  if (error || !meeting) return <ErrorState message={error || "Meeting record not found"} onRetry={fetchMeeting} />;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Back button */}
      <button 
        onClick={() => navigate(`/deals/${meeting.deal_id}`)} 
        className="text-xs text-slate-400 hover:text-white flex items-center space-x-2 transition"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Deal Workspace</span>
      </button>

      {/* Main card */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl space-y-6">
        <div className="flex items-center justify-between border-b border-slate-800 pb-6">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-cyan-400 px-3 py-1 bg-cyan-950/60 border border-cyan-800/50 rounded-full inline-block mb-2">
              {meeting.date}
            </span>
            <h1 className="text-2xl font-bold text-white">{meeting.title}</h1>
          </div>
          <div className="text-right space-y-1">
            <span className="text-xs text-slate-500">Meeting Record #{meeting.id}</span>
            <div className="flex items-center text-xs text-emerald-400 font-medium space-x-1">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Hindsight Retained</span>
            </div>
          </div>
        </div>

        {/* Executive Summary */}
        {meeting.summary && (
          <div className="p-4 bg-blue-950/20 border border-blue-800/40 rounded-xl space-y-1">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center space-x-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Executive Summary</span>
            </h3>
            <p className="text-sm text-slate-200">{meeting.summary}</p>
          </div>
        )}

        {/* Meeting Notes */}
        <div className="space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center space-x-1">
            <FileText className="w-3.5 h-3.5 text-slate-500" />
            <span>Detailed Notes & Discussion Transcript</span>
          </h3>
          <div className="p-5 bg-slate-950 rounded-xl border border-slate-800/80 text-sm text-slate-300 whitespace-pre-line leading-relaxed">
            {meeting.notes || "No detailed notes provided."}
          </div>
        </div>

        {/* Outcome & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-800">
          <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Outcome</span>
            <p className="text-sm text-slate-200">{meeting.outcome || 'N/A'}</p>
          </div>
          <div className="p-4 bg-emerald-950/20 rounded-xl border border-emerald-900/40 space-y-1">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider flex items-center space-x-1">
              <CheckSquare className="w-3.5 h-3.5" />
              <span>Next Action Item</span>
            </span>
            <p className="text-sm text-slate-200">{meeting.next_action || 'N/A'}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
