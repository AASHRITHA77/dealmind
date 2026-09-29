import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { DealCard } from '../components/Cards';
import { LoadingState, ErrorState, Button, Modal } from '../components/CommonUI';
import { Plus, Briefcase } from 'lucide-react';

export const Deals = () => {
  const [deals, setDeals] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    company_id: '',
    deal_value: '',
    stage: 'Discovery',
    expected_close_date: ''
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [dealsRes, compRes] = await Promise.all([
        api.getDeals(),
        api.getCompanies()
      ]);
      setDeals(dealsRes.data);
      setCompanies(compRes.data);
      if (compRes.data.length > 0) {
        setFormData(prev => ({ ...prev, company_id: compRes.data[0].id }));
      }
    } catch (err) {
      setError("Failed to load deals pipeline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateDeal = async (e) => {
    e.preventDefault();
    try {
      await api.createDeal({
        company_id: parseInt(formData.company_id),
        deal_value: parseFloat(formData.deal_value),
        stage: formData.stage,
        expected_close_date: formData.expected_close_date
      });
      setIsModalOpen(false);
      setFormData({
        company_id: companies[0]?.id || '',
        deal_value: '',
        stage: 'Discovery',
        expected_close_date: ''
      });
      fetchData();
    } catch (err) {
      alert("Error creating deal.");
    }
  };

  if (loading) return <LoadingState message="Loading deals pipeline..." />;
  if (error) return <ErrorState message={error} onRetry={fetchData} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales Pipeline & Deals</h1>
          <p className="text-sm text-slate-400">All enterprise deals currently tracked with Hindsight memory agent.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="space-x-2">
          <Plus className="w-4 h-4" />
          <span>New Deal Opportunity</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {deals.map((deal) => (
          <DealCard key={deal.id} deal={deal} />
        ))}
      </div>

      {/* Add Deal Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Deal Opportunity">
        <form onSubmit={handleCreateDeal} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company</label>
            <select
              value={formData.company_id}
              onChange={e => setFormData({...formData, company_id: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              {companies.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Deal Value ($)</label>
            <input 
              required 
              type="number" 
              value={formData.deal_value} 
              onChange={e => setFormData({...formData, deal_value: e.target.value})}
              placeholder="e.g. 85000"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Stage</label>
            <select
              value={formData.stage}
              onChange={e => setFormData({...formData, stage: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            >
              <option value="Discovery">Discovery</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Closed Won">Closed Won</option>
              <option value="Closed Lost">Closed Lost</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Expected Close Date</label>
            <input 
              type="date" 
              value={formData.expected_close_date} 
              onChange={e => setFormData({...formData, expected_close_date: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Save Deal</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
