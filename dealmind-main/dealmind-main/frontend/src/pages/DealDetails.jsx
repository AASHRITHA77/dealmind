import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api/client';
import { ContactCard, MeetingCard } from '../components/Cards';
import { LoadingState, ErrorState, Button, Modal } from '../components/CommonUI';
import { 
  Building2, 
  Sparkles, 
  Plus, 
  Users, 
  History, 
  ChevronRight,
  FileText,
  BrainCircuit,
  CheckSquare
} from 'lucide-react';

export const DealDetails = () => {
  const { dealId } = useParams();
  const navigate = useNavigate();
  const [deal, setDeal] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [isOutcomeModalOpen, setIsOutcomeModalOpen] = useState(false);
  const [selectedMeetingId, setSelectedMeetingId] = useState(null);

  // Forms
  const [meetingForm, setMeetingForm] = useState({
    date: new Date().toISOString().split('T')[0],
    title: '',
    notes: '',
    summary: '',
    outcome: '',
    next_action: ''
  });

  const [contactForm, setContactForm] = useState({ name: '', role: '', email: '' });

  const [outcomeForm, setOutcomeForm] = useState({
    what_happened: '',
    customer_reaction: '',
    what_worked: '',
    what_failed: '',
    new_objection: '',
    next_action: ''
  });

  const fetchDealDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getDeal(dealId || 1);
      setDeal(res.data);
    } catch (err) {
      console.error("Error fetching deal:", err);
      setError("Failed to load deal intelligence details.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDealDetails();
  }, [dealId]);

  const handleAddMeeting = async (e) => {
    e.preventDefault();
    try {
      await api.createDealMeeting(deal.id, meetingForm);
      setIsMeetingModalOpen(false);
      setMeetingForm({
        date: new Date().toISOString().split('T')[0],
        title: '',
        notes: '',
        summary: '',
        outcome: '',
        next_action: ''
      });
      fetchDealDetails();
    } catch (err) {
      alert("Error logging meeting and retaining memory.");
    }
  };

  const handleAddContact = async (e) => {
    e.preventDefault();
    try {
      await api.createDealContact(deal.id, contactForm);
      setIsContactModalOpen(false);
      setContactForm({ name: '', role: '', email: '' });
      fetchDealDetails();
    } catch (err) {
      alert("Error adding contact.");
    }
  };

  const handleRecordOutcome = async (e) => {
    e.preventDefault();
    try {
      await api.recordOutcome(deal.id, {
        meeting_id: selectedMeetingId,
        ...outcomeForm
      });
      setIsOutcomeModalOpen(false);
      setOutcomeForm({
        what_happened: '',
        customer_reaction: '',
        what_worked: '',
        what_failed: '',
        new_objection: '',
        next_action: ''
      });
      fetchDealDetails();
    } catch (err) {
      alert("Error recording meeting outcome learning loop.");
    }
  };

  if (loading) return <LoadingState message="Retrieving deal context and long-term memory history..." />;
  if (error || !deal) return <ErrorState message={error || "Deal not found"} onRetry={fetchDealDetails} />;

  const formattedValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(deal.deal_value || 0);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-blue-950/40 border border-slate-800 shadow-2xl space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 border-b border-slate-800 pb-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-3">
              <span className="px-3 py-1 bg-cyan-950/80 text-cyan-400 border border-cyan-800/60 rounded-full text-xs font-semibold">
                {deal.stage} Stage
              </span>
              <span className="text-xs text-slate-400 flex items-center space-x-1">
                <Building2 className="w-3.5 h-3.5 text-slate-500" />
                <span>{deal.company?.name}</span>
              </span>
            </div>
            <h1 className="text-3xl font-extrabold text-white">
              {deal.company?.name} — Sales Workspace
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button onClick={() => navigate(`/deals/${deal.id}/brief`)} variant="emerald" className="space-x-2">
              <Sparkles className="w-4 h-4" />
              <span>Prepare Me for Next Meeting</span>
            </Button>
            <Button onClick={() => setIsOutcomeModalOpen(true)} variant="secondary" className="space-x-2">
              <CheckSquare className="w-4 h-4" />
              <span>Record Meeting Outcome</span>
            </Button>
            <Button onClick={() => navigate(`/deals/${deal.id}/memories`)} variant="outline" className="space-x-2">
              <BrainCircuit className="w-4 h-4 text-cyan-400" />
              <span>Memory Explorer</span>
            </Button>
            <Button onClick={() => navigate(`/deals/${deal.id}/timeline`)} variant="outline" className="space-x-2">
              <History className="w-4 h-4" />
              <span>Timeline</span>
            </Button>
          </div>
        </div>

        {/* Key Deal Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-2">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Deal Value</p>
            <p className="text-2xl font-bold text-white mt-1">{formattedValue}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Target Close</p>
            <p className="text-2xl font-bold text-slate-200 mt-1">{deal.expected_close_date || 'N/A'}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Interactions Logged</p>
            <p className="text-2xl font-bold text-cyan-400 mt-1">{deal.meetings_count || deal.meetings?.length || 0} Calls</p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Hindsight Memory Bank</p>
            <p className="text-sm font-bold text-emerald-400 mt-1">dealmind_deal_{deal.id}</p>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Stakeholders */}
        <div className="space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="font-bold text-white flex items-center space-x-2">
                <Users className="w-4 h-4 text-cyan-400" />
                <span>Key Stakeholders</span>
              </h3>
              <button 
                onClick={() => setIsContactModalOpen(true)}
                className="text-xs text-blue-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Contact</span>
              </button>
            </div>

            <div className="space-y-3">
              {deal.contacts && deal.contacts.length > 0 ? (
                deal.contacts.map((contact) => (
                  <ContactCard key={contact.id} contact={contact} />
                ))
              ) : (
                <p className="text-xs text-slate-500 py-4 text-center">No contacts registered yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Meetings */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center space-x-2">
                  <FileText className="w-5 h-5 text-blue-400" />
                  <span>Meeting History & Hindsight Memory Log</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Every meeting is analyzed by Groq and retained in Hindsight Cloud</p>
              </div>
              <Button onClick={() => setIsMeetingModalOpen(true)} variant="secondary" className="text-xs space-x-1">
                <Plus className="w-3.5 h-3.5" />
                <span>Log Meeting</span>
              </Button>
            </div>

            <div className="space-y-4">
              {deal.meetings && deal.meetings.length > 0 ? (
                deal.meetings.map((m) => (
                  <div key={m.id} className="p-5 bg-slate-950/70 border border-slate-800/80 rounded-xl space-y-3 hover:border-slate-700 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <span className="px-2.5 py-1 text-xs font-semibold bg-blue-950 text-blue-400 border border-blue-800/50 rounded-md">
                          {m.date}
                        </span>
                        <h4 className="font-bold text-white">{m.title}</h4>
                      </div>
                      <button 
                        onClick={() => navigate(`/meetings/${m.id}`)}
                        className="text-xs text-cyan-400 hover:text-cyan-300 font-medium flex items-center space-x-1"
                      >
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                      {m.notes || m.summary}
                    </p>

                    {m.outcome && (
                      <div className="p-2.5 bg-slate-900/80 rounded-lg border border-slate-800 text-xs">
                        <span className="font-semibold text-slate-400 block mb-0.5">Outcome:</span>
                        <span className="text-slate-200">{m.outcome}</span>
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500 py-8 text-center">No historical meetings logged.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Record Outcome Modal */}
      <Modal isOpen={isOutcomeModalOpen} onClose={() => setIsOutcomeModalOpen(false)} title="Record Meeting Outcome (Learning Loop)">
        <form onSubmit={handleRecordOutcome} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">What Happened?</label>
            <textarea 
              required
              rows={2} 
              placeholder="e.g. Customer rejected our pricing proposal and said the price is too high." 
              value={outcomeForm.what_happened} 
              onChange={e => setOutcomeForm({...outcomeForm, what_happened: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">What Worked?</label>
              <input 
                type="text" 
                placeholder="e.g. ROI demonstration worked well" 
                value={outcomeForm.what_worked} 
                onChange={e => setOutcomeForm({...outcomeForm, what_worked: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">What Failed?</label>
              <input 
                type="text" 
                placeholder="e.g. Discount approach did not resolve concern" 
                value={outcomeForm.what_failed} 
                onChange={e => setOutcomeForm({...outcomeForm, what_failed: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">New Objection or Requirement</label>
            <input 
              type="text" 
              placeholder="e.g. Price too high compared to competitor" 
              value={outcomeForm.new_objection} 
              onChange={e => setOutcomeForm({...outcomeForm, new_objection: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Next Action Item</label>
            <input 
              type="text" 
              placeholder="e.g. Schedule ROI walkthrough with CFO" 
              value={outcomeForm.next_action} 
              onChange={e => setOutcomeForm({...outcomeForm, next_action: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsOutcomeModalOpen(false)}>Cancel</Button>
            <Button type="submit" variant="emerald">Retain Outcome in Hindsight</Button>
          </div>
        </form>
      </Modal>

      {/* Add Meeting Modal */}
      <Modal isOpen={isMeetingModalOpen} onClose={() => setIsMeetingModalOpen(false)} title="Log Meeting Interaction">
        <form onSubmit={handleAddMeeting} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
              <input 
                required 
                type="date" 
                value={meetingForm.date} 
                onChange={e => setMeetingForm({...meetingForm, date: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Title</label>
              <input 
                required 
                type="text" 
                placeholder="e.g. Commercial Proposal Review" 
                value={meetingForm.title} 
                onChange={e => setMeetingForm({...meetingForm, title: e.target.value})}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Meeting Notes</label>
            <textarea 
              rows={3} 
              placeholder="Customer rejected our pricing proposal and said the price is too high..." 
              value={meetingForm.notes} 
              onChange={e => setMeetingForm({...meetingForm, notes: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsMeetingModalOpen(false)}>Cancel</Button>
            <Button type="submit">Process & Retain Memory</Button>
          </div>
        </form>
      </Modal>

      {/* Add Contact Modal */}
      <Modal isOpen={isContactModalOpen} onClose={() => setIsContactModalOpen(false)} title="Add Stakeholder Contact">
        <form onSubmit={handleAddContact} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Name</label>
            <input 
              required 
              type="text" 
              placeholder="e.g. Alex Mercer" 
              value={contactForm.name} 
              onChange={e => setContactForm({...contactForm, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Role / Title</label>
            <input 
              type="text" 
              placeholder="e.g. VP Procurement" 
              value={contactForm.role} 
              onChange={e => setContactForm({...contactForm, role: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsContactModalOpen(false)}>Cancel</Button>
            <Button type="submit">Add Stakeholder</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
