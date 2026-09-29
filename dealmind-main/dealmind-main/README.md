# DealMind – AI Sales Deal Intelligence / Sales Call Briefing Agent

DealMind is an AI sales assistant that remembers previous customer interactions using Hindsight long-term memory retention (RETAIN / RECALL) and utilizes Groq API for sales reasoning and personalized briefing generation.

---

## 1. Project Overview

DealMind solves the issue of lost deal context across sales cycles. It records structured deal data (companies, deals, contacts, meetings) in a SQLite database while storing long-term experience memories (objections, competitors, what worked, what failed) in **Hindsight Cloud**.

### Key Features
* **Groq LLM Reasoning**: Analyzes meeting notes and meeting outcomes to extract customer priorities, objections, and competitors.
* **Hindsight Cloud Memory (RETAIN / RECALL)**: Stores experience memories in dedicated per-deal memory banks (`dealmind_deal_{id}`).
* **Meeting Processing Pipeline**: Automatically analyzes new meeting notes, extracts key insights, and retains them in Hindsight.
* **Personalized AI Call Briefing**: Synthesizes deal context and recalled Hindsight memories before meetings.
* **WITH vs WITHOUT HINDSIGHT Comparison**: Demonstrates how long-term memory retention improves briefing quality compared to basic structured metadata.
* **Meeting Outcome Learning Loop**: Records call outcomes, analyzes lessons learned (what worked / what failed), and retains them in Hindsight.
* **Memory Explorer & Timeline**: Search and filter long-term memories stored in Hindsight Cloud.

---

## 2. Project Structure

```
dealmind/
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js           # Axios API client
│   │   ├── components/
│   │   │   ├── Cards.jsx           # StatCard, DealCard, ContactCard, MeetingCard
│   │   │   ├── CommonUI.jsx        # Button, Modal, LoadingState, ErrorState
│   │   │   ├── Navbar.jsx          # Top navigation bar
│   │   │   └── Sidebar.jsx         # Dark theme navigation bar with Hindsight & Groq indicators
│   │   ├── pages/
│   │   │   ├── AIMeetingBrief.jsx  # AI Sales Call Briefing with WITH/WITHOUT HINDSIGHT comparison
│   │   │   ├── Companies.jsx       # Target Companies Directory
│   │   │   ├── Dashboard.jsx       # Main Sales Pipeline Dashboard
│   │   │   ├── DealDetails.jsx     # Comprehensive Deal Workspace
│   │   │   ├── Deals.jsx           # Active Pipeline View
│   │   │   ├── MeetingDetails.jsx  # Individual Call Record
│   │   │   ├── MemoryExplorer.jsx  # Hindsight Cloud Memory Search
│   │   │   └── MemoryTimeline.jsx  # Hindsight Learning Stream
│   │   ├── App.jsx
│   │   ├── index.css               # Tailwind CSS styles
│   │   └── main.jsx
│   ├── package.json
│   ├── tailwind.config.js          # Dark SaaS developer theme
│   └── vite.config.js
├── backend/
│   ├── app/
│   │   ├── main.py                 # FastAPI application entrypoint
│   │   ├── config.py               # Settings reading .env
│   │   ├── database.py             # SQLite & SQLAlchemy setup
│   │   ├── models/
│   │   │   └── models.py           # Company, Deal, Contact, Meeting models
│   │   ├── schemas/
│   │   │   └── schemas.py          # Pydantic validation schemas
│   │   ├── routes/
│   │   │   └── api.py              # REST API endpoints
│   │   └── services/
│   │       ├── briefing_service.py # Briefing synthesis & learning loop
│   │       ├── groq_service.py     # Groq Chat Completion service wrapper
│   │       ├── hindsight_service.py# Hindsight RETAIN & RECALL service wrapper
│   │       └── meeting_service.py  # Meeting processing pipeline
│   ├── seed_data.py                # Database seed script
│   ├── tests/
│   │   └── test_api.py             # Pytest API integration suite
│   └── requirements.txt            # Python dependencies
├── data/                           # SQLite database storage (dealmind.db)
├── screenshots/                    # UI screenshots
├── .env.example                    # Environment variable template
├── .gitignore
└── README.md                       # Documentation
```

---

## 3. How to Install Dependencies

### Backend Dependencies
Ensure Python 3.10+ is installed:
```bash
pip install -r backend/requirements.txt
```

### Frontend Dependencies
Ensure Node.js 18+ and npm are installed:
```bash
cd frontend
npm install
cd ..
```

---

## 4. How to Seed & Start Backend

### Environment Configuration
Copy `.env.example` to `.env` and set your API keys:
```env
DATABASE_URL=sqlite:///./data/dealmind.db
GROQ_API_KEY=your_groq_api_key_here
GROQ_MODEL=llama-3.3-70b-versatile
HINDSIGHT_API_KEY=your_hindsight_api_key_here
HINDSIGHT_BASE_URL=https://api.hindsight.ai/v1
```

### Seed Database
Initialize SQLite database and populate NovaTech Solutions seed data:
```bash
PYTHONPATH=backend python3 backend/seed_data.py
```

### Run FastAPI Backend
Start the server using Uvicorn on port 8000:
```bash
PYTHONPATH=backend python3 -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```
Interactive API documentation is available at `http://localhost:8000/docs`.

---

## 5. How to Start Frontend

Run Vite development server:
```bash
cd frontend
npm run dev
```
The application will open at `http://localhost:5173`.

---

## 6. What Appears in the Browser

Opening `http://localhost:5173` presents:
1. **Dashboard**: High-level sales metrics ($85,000 pipeline value, NovaTech Solutions active deal, historical meeting cards).
2. **Deal Details (`/deals/1`)**: Complete deal workspace showing key stakeholders (Sarah Chen, Michael Rao, Priya Shah), meeting logs, and buttons to "Prepare Me for Next Meeting" or "Record Meeting Outcome".
3. **AI Briefing (`/deals/1/brief`)**: Executive sales brief with an interactive toggle comparing **WITH HINDSIGHT** (uses recalled long-term memories) vs **WITHOUT HINDSIGHT** (uses basic structured metadata).
4. **Memory Explorer (`/deals/1/memories`)**: Direct search interface into Hindsight Cloud memory banks.
5. **Learning Timeline (`/deals/1/timeline`)**: Chronological learning stream showing customer progression across meetings.

---

## 7. How to Test Every API Endpoint

Run automated pytest backend suite:
```bash
PYTHONPATH=backend pytest backend/tests/test_api.py
```

Manual curl testing examples:
* **Health Check**: `curl http://localhost:8000/health`
* **Get Deals**: `curl http://localhost:8000/deals`
* **Generate Briefing**:
  ```bash
  curl -X POST http://localhost:8000/deals/1/brief \
    -H "Content-Type: application/json" \
    -d '{"use_hindsight": true}'
  ```
* **Record Meeting Outcome (Learning Loop)**:
  ```bash
  curl -X POST http://localhost:8000/deals/1/outcome \
    -H "Content-Type: application/json" \
    -d '{
      "meeting_id": 5,
      "what_happened": "Discussed ROI model with Michael Rao.",
      "customer_reaction": "Positive reaction to ROI math.",
      "what_worked": "Demonstrating 3.5x cost savings.",
      "what_failed": "Flat 5% discount without ROI context.",
      "new_objection": "None",
      "next_action": "Send final agreement."
    }'
  ```
* **Recall Hindsight Memories**:
  `curl http://localhost:8000/deals/1/memories`
