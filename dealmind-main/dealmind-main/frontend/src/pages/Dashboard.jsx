import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { StatCard, DealCard, MeetingCard } from '../components/Cards';
import { LoadingState, ErrorState, Button } from '../components/CommonUI';
import { Building2, Briefcase, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const [deals, setDeals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dealsRes, companiesRes] = await Promise.all([
        api.getDeals(),
        api.getCompanies()
      ]);
      setDeals(dealsRes.data);
      setCompanies(companiesRes.data);
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      setError("Failed to load dashboard intelligence.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) return <LoadingState message="Loading DealMind dashboard metrics..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  const activeDeals = deals.filter(d => d.status === 'Active');
  const totalValue = deals.reduce((sum, d) => sum + (d.deal_value || 0), 0);
  const formattedTotalValue = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0
  }).format(totalValue);

  // Extract meetings from all deals
  const allMeetings = deals.flatMap(d => d.meetings || []);

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="p-8 rounded-3xl bg-gradient-to-r from-blue-900/40 via-slate-900 to-slate-900 border border-blue-500/20 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 rounded-full text-blue-400 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>AI Sales Assistant Ready</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white">Sales Deal Intelligence Hub</h1>
          <p className="text-sm text-slate-400 max-w-xl">
            Real-time memory retention and sales briefing for high-value client opportunities powered by Groq & Hindsight.
          </p>
        </div>
        <div>
          <Button onClick={() => navigate('/deals/1/brief')} variant="emerald" className="px-6 py-3 text-sm font-bold space-x-2">
            <Sparkles className="w-4 h-4" />
            <span>Prepare Sales Briefing</span>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Total Companies" 
          value={companies.length} 
          icon={Building2} 
          trend="+1 this month"
          color="cyan"
        />
        <StatCard 
          title="Active Deals" 
          value={activeDeals.length} 
          icon={Briefcase} 
          trend="100% active pipeline"
          color="blue"
        />
        <StatCard 
          title="Pipeline Value" 
          value={formattedTotalValue} 
          icon={DollarSign} 
          trend="Negotiation stage"
          color="emerald"
        />
        <StatCard 
          title="Total Meetings Logged" 
          value={allMeetings.length} 
          icon={Calendar} 
          trend="Hindsight retained"
          color="purple"
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Deal Cards Column */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Active High-Value Deals</h3>
            <span className="text-xs text-slate-400">{deals.length} active deal(s)</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {deals.map((deal) => (
              <DealCard key={deal.id} deal={deal} />
            ))}
          </div>
        </div>

        {/* Recent Meetings Sidebar */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white">Recent Interactions</h3>
            <span className="text-xs text-cyan-400 font-medium">Memory Retained</span>
          </div>
          <div className="space-y-4">
            {allMeetings.slice(0, 4).map((meeting) => (
              <MeetingCard 
                key={meeting.id} 
                meeting={meeting} 
                onClick={() => navigate(`/deals/${meeting.deal_id}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
