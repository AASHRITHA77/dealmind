import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const api = {
  // Health
  getHealth: () => client.get('/health'),

  // Companies
  getCompanies: () => client.get('/companies'),
  createCompany: (data) => client.post('/companies', data),

  // Deals
  getDeals: () => client.get('/deals'),
  getDeal: (dealId) => client.get(`/deals/${dealId}`),
  createDeal: (data) => client.post('/deals', data),

  // Contacts
  getDealContacts: (dealId) => client.get(`/deals/${dealId}/contacts`),
  createDealContact: (dealId, data) => client.post(`/deals/${dealId}/contacts`, data),

  // Meetings & Pipeline
  getDealMeetings: (dealId) => client.get(`/deals/${dealId}/meetings`),
  createDealMeeting: (dealId, data) => client.post(`/deals/${dealId}/meetings`, data),
  getMeeting: (meetingId) => client.get(`/meetings/${meetingId}`),

  // AI Briefing
  getDealBrief: (dealId, useHindsight = true) => client.post(`/deals/${dealId}/brief`, { use_hindsight: useHindsight }),

  // Meeting Outcome / Learning Loop
  recordOutcome: (dealId, data) => client.post(`/deals/${dealId}/outcome`, data),

  // Hindsight Memory Explorer & Timeline
  getDealMemories: (dealId, query = null) => client.get(`/deals/${dealId}/memories`, { params: { query } }),
  getDealTimeline: (dealId) => client.get(`/deals/${dealId}/timeline`),
};

export default client;
