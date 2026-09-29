import React from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { Dashboard } from './pages/Dashboard';
import { Companies } from './pages/Companies';
import { Deals } from './pages/Deals';
import { DealDetails } from './pages/DealDetails';
import { MeetingDetails } from './pages/MeetingDetails';
import { AIMeetingBrief } from './pages/AIMeetingBrief';
import { MemoryTimeline } from './pages/MemoryTimeline';
import { MemoryExplorer } from './pages/MemoryExplorer';

const AppContent = () => {
  const location = useLocation();

  const getTitle = () => {
    const path = location.pathname;
    if (path === '/') return 'Dashboard';
    if (path.startsWith('/companies')) return 'Companies Directory';
    if (path.startsWith('/deals') && path.includes('/brief')) return 'AI Sales Call Briefing';
    if (path.startsWith('/deals') && path.includes('/timeline')) return 'Hindsight Learning Timeline';
    if (path.startsWith('/deals') && path.includes('/memories')) return 'Hindsight Memory Explorer';
    if (path.startsWith('/deals') && path.length > 6) return 'Deal Intelligence Workspace';
    if (path.startsWith('/deals')) return 'Sales Pipeline & Deals';
    if (path.startsWith('/meetings')) return 'Meeting Record & Intelligence';
    return 'DealMind AI';
  };

  return (
    <div className="flex min-h-screen bg-[#0B0F17] text-slate-100">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar title={getTitle()} />
        <main className="flex-1 p-8 overflow-y-auto">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/companies" element={<Companies />} />
            <Route path="/deals" element={<Deals />} />
            <Route path="/deals/:dealId" element={<DealDetails />} />
            <Route path="/deals/:dealId/brief" element={<AIMeetingBrief />} />
            <Route path="/deals/:dealId/timeline" element={<MemoryTimeline />} />
            <Route path="/deals/:dealId/memories" element={<MemoryExplorer />} />
            <Route path="/meetings/:meetingId" element={<MeetingDetails />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
