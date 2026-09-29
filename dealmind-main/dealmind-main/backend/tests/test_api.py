import pytest
from fastapi.testclient import TestClient
import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app
from seed_data import seed_database

client = TestClient(app)

@pytest.fixture(autouse=True)
def setup_db():
    seed_database()

def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "DealMind API"}

def test_get_companies():
    response = client.get("/companies")
    assert response.status_code == 200
    companies = response.json()
    assert len(companies) >= 1
    assert companies[0]["name"] == "NovaTech Solutions"

def test_get_deals():
    response = client.get("/deals")
    assert response.status_code == 200
    deals = response.json()
    assert len(deals) >= 1
    assert deals[0]["deal_value"] == 85000.0
    assert deals[0]["stage"] == "Negotiation"

def test_ai_meeting_briefing_fallback_or_call():
    # Test POST /deals/1/brief
    response = client.post("/deals/1/brief", json={"use_hindsight": True})
    assert response.status_code == 200
    brief = response.json()
    assert "executive_summary" in brief
    assert "deal_id" in brief
    assert brief["deal_id"] == 1

def test_record_outcome_learning_loop():
    # Test POST /deals/1/outcome
    response = client.post("/deals/1/outcome", json={
        "meeting_id": 5,
        "what_happened": "Discussed ROI model with Michael Rao.",
        "customer_reaction": "Very positive reaction to 3.5x ROI math.",
        "what_worked": "Demonstrating concrete cost savings and efficiency metrics.",
        "what_failed": "Offering a standard 5% price discount without ROI framework.",
        "new_objection": "None",
        "next_action": "Send final contract for signature."
    })
    assert response.status_code == 200
    res = response.json()
    assert res["deal_id"] == 1
    assert "memory_retained" in res

def test_timeline_endpoint():
    response = client.get("/deals/1/timeline")
    assert response.status_code == 200
    data = response.json()
    assert data["deal_id"] == 1
    assert len(data["timeline"]) == 5
