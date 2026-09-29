import React, { useEffect, useState } from 'react';
import { api } from '../api/client';
import { LoadingState, ErrorState, Button, Modal } from '../components/CommonUI';
import { Building2, Plus, Users, Briefcase } from 'lucide-react';

export const Companies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', industry: '', size: '' });

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.getCompanies();
      setCompanies(res.data);
    } catch (err) {
      setError("Failed to load companies.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, []);

  const handleCreateCompany = async (e) => {
    e.preventDefault();
    try {
      await api.createCompany(formData);
      setIsModalOpen(false);
      setFormData({ name: '', industry: '', size: '' });
      fetchCompanies();
    } catch (err) {
      alert("Error creating company.");
    }
  };

  if (loading) return <LoadingState message="Loading companies..." />;
  if (error) return <ErrorState message={error} onRetry={fetchCompanies} />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Target Companies</h1>
          <p className="text-sm text-slate-400">Enterprise accounts tracked in DealMind agent intelligence.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="space-x-2">
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {companies.map((company) => (
          <div key={company.id} className="p-6 bg-slate-900 border border-slate-800 rounded-2xl shadow-xl space-y-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-cyan-950/50 border border-cyan-800/40 rounded-xl text-cyan-400">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">{company.name}</h3>
                <p className="text-xs text-slate-400">{company.industry || 'Technology'}</p>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <Users className="w-3.5 h-3.5 text-slate-500" />
                <span>Company Size:</span>
              </span>
              <span className="font-semibold text-slate-200">{company.size || 'N/A'}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Company Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add Target Company">
        <form onSubmit={handleCreateCompany} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company Name</label>
            <input 
              required 
              type="text" 
              value={formData.name} 
              onChange={e => setFormData({...formData, name: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Industry</label>
            <input 
              type="text" 
              value={formData.industry} 
              onChange={e => setFormData({...formData, industry: e.target.value})}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Company Size</label>
            <input 
              type="text" 
              value={formData.size} 
              onChange={e => setFormData({...formData, size: e.target.value})}
              placeholder="e.g. 250-500 employees"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4 border-t border-slate-800">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">Create Company</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
