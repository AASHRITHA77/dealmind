from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, status, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.models import Company, Deal, Contact, Meeting
from app.schemas.schemas import (
    CompanyCreate, CompanyResponse,
    DealCreate, DealResponse, DealDetailResponse,
    ContactCreate, ContactResponse,
    MeetingCreate, MeetingResponse
)
from app.services.meeting_service import meeting_service
from app.services.briefing_service import briefing_service
from app.services.hindsight_service import hindsight_service

router = APIRouter()

# --- Request Schemas for AI Operations ---
class BriefingRequest(BaseModel):
    use_hindsight: bool = True

class OutcomeRequest(BaseModel):
    meeting_id: Optional[int] = None
    what_happened: str
    customer_reaction: str = ""
    what_worked: str = ""
    what_failed: str = ""
    new_objection: str = ""
    next_action: str = ""

class RetainMemoryRequest(BaseModel):
    content: str
    memory_type: str = "custom_note"
    metadata: Optional[Dict[str, Any]] = None

class RecallMemoryRequest(BaseModel):
    query: Optional[str] = None
    limit: int = 10


# --- Health Check ---
@router.get("/health")
def health_check():
    return {"status": "ok", "service": "DealMind API"}


# --- Companies ---
@router.get("/companies", response_model=List[CompanyResponse])
def get_companies(db: Session = Depends(get_db)):
    return db.query(Company).all()

@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
def create_company(company: CompanyCreate, db: Session = Depends(get_db)):
    db_company = Company(**company.model_dump())
    db.add(db_company)
    db.commit()
    db.refresh(db_company)
    return db_company


# --- Deals ---
@router.get("/deals", response_model=List[DealDetailResponse])
def get_deals(db: Session = Depends(get_db)):
    deals = db.query(Deal).all()
    results = []
    for deal in deals:
        contacts = db.query(Contact).filter(Contact.company_id == deal.company_id).all()
        meetings = db.query(Meeting).filter(Meeting.deal_id == deal.id).order_by(Meeting.date.desc()).all()
        last_interaction = meetings[0].date if meetings else None
        
        detail = DealDetailResponse(
            id=deal.id,
            company_id=deal.company_id,
            deal_value=deal.deal_value,
            stage=deal.stage,
            expected_close_date=deal.expected_close_date,
            status=deal.status,
            created_at=deal.created_at,
            company=CompanyResponse.model_validate(deal.company) if deal.company else None,
            contacts=[ContactResponse.model_validate(c) for c in contacts],
            meetings=[MeetingResponse.model_validate(m) for m in meetings],
            meetings_count=len(meetings),
            last_interaction=last_interaction
        )
        results.append(detail)
    return results

@router.post("/deals", response_model=DealResponse, status_code=status.HTTP_201_CREATED)
def create_deal(deal: DealCreate, db: Session = Depends(get_db)):
    company = db.query(Company).filter(Company.id == deal.company_id).first()
    if not company:
        raise HTTPException(status_code=404, detail="Company not found")
    
    db_deal = Deal(**deal.model_dump())
    db.add(db_deal)
    db.commit()
    db.refresh(db_deal)
    return db_deal

@router.get("/deals/{deal_id}", response_model=DealDetailResponse)
def get_deal(deal_id: int, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    contacts = db.query(Contact).filter(Contact.company_id == deal.company_id).all()
    meetings = db.query(Meeting).filter(Meeting.deal_id == deal.id).order_by(Meeting.date.desc()).all()
    last_interaction = meetings[0].date if meetings else None

    return DealDetailResponse(
        id=deal.id,
        company_id=deal.company_id,
        deal_value=deal.deal_value,
        stage=deal.stage,
        expected_close_date=deal.expected_close_date,
        status=deal.status,
        created_at=deal.created_at,
        company=CompanyResponse.model_validate(deal.company) if deal.company else None,
        contacts=[ContactResponse.model_validate(c) for c in contacts],
        meetings=[MeetingResponse.model_validate(m) for m in meetings],
        meetings_count=len(meetings),
        last_interaction=last_interaction
    )


# --- Deal Contacts ---
@router.get("/deals/{deal_id}/contacts", response_model=List[ContactResponse])
def get_deal_contacts(deal_id: int, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db.query(Contact).filter(Contact.company_id == deal.company_id).all()

@router.post("/deals/{deal_id}/contacts", response_model=ContactResponse, status_code=status.HTTP_201_CREATED)
def create_deal_contact(deal_id: int, contact: ContactCreate, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    db_contact = Contact(company_id=deal.company_id, **contact.model_dump())
    db.add(db_contact)
    db.commit()
    db.refresh(db_contact)
    return db_contact


# --- Deal Meetings (Processing Pipeline) ---
@router.get("/deals/{deal_id}/meetings", response_model=List[MeetingResponse])
def get_deal_meetings(deal_id: int, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    return db.query(Meeting).filter(Meeting.deal_id == deal_id).order_by(Meeting.date.desc()).all()

@router.post("/deals/{deal_id}/meetings", status_code=status.HTTP_201_CREATED)
async def create_deal_meeting(deal_id: int, meeting: MeetingCreate, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")
    
    result = await meeting_service.process_and_create_meeting(db, deal_id, meeting)
    return {
        "status": "success",
        "meeting": MeetingResponse.model_validate(result["meeting"]),
        "analysis": result["analysis"],
        "hindsight_status": result["hindsight_status"],
        "retained_memory": result["retained_memory"]
    }


# --- Single Meeting ---
@router.get("/meetings/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id: int, db: Session = Depends(get_db)):
    meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
    if not meeting:
        raise HTTPException(status_code=404, detail="Meeting not found")
    return meeting


# --- AI Briefing ---
@router.post("/deals/{deal_id}/brief")
async def generate_brief(deal_id: int, req: BriefingRequest, db: Session = Depends(get_db)):
    try:
        briefing = await briefing_service.generate_briefing(db, deal_id, use_hindsight=req.use_hindsight)
        return briefing
    except ValueError as ve:
        raise HTTPException(status_code=404, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate brief: {str(e)}")


# --- Meeting Outcome (Learning Loop) ---
@router.post("/deals/{deal_id}/outcome")
async def record_outcome(deal_id: int, req: OutcomeRequest, db: Session = Depends(get_db)):
    try:
        res = await briefing_service.record_meeting_outcome(
            db=db,
            deal_id=deal_id,
            meeting_id=req.meeting_id,
            what_happened=req.what_happened,
            customer_reaction=req.customer_reaction,
            what_worked=req.what_worked,
            what_failed=req.what_failed,
            new_objection=req.new_objection,
            next_action=req.next_action
        )
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to record outcome: {str(e)}")


# --- Hindsight Memory RETAIN & RECALL ---
@router.post("/deals/{deal_id}/memory/retain")
async def retain_deal_memory(deal_id: int, req: RetainMemoryRequest):
    try:
        res = await hindsight_service.retain_memory(
            deal_id=deal_id,
            content=req.content,
            memory_type=req.memory_type,
            metadata=req.metadata
        )
        return res
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hindsight RETAIN error: {str(e)}")

@router.post("/deals/{deal_id}/memory/recall")
@router.get("/deals/{deal_id}/memories")
async def recall_deal_memories(deal_id: int, query: Optional[str] = Query(None)):
    try:
        memories = await hindsight_service.recall_memories(deal_id=deal_id, query=query)
        return {
            "deal_id": deal_id,
            "query_used": query,
            "memories_count": len(memories),
            "memories": memories
        }
    except ValueError as ve:
        raise HTTPException(status_code=400, detail=str(ve))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Hindsight RECALL error: {str(e)}")


# --- Memory Timeline ---
@router.get("/deals/{deal_id}/timeline")
def get_deal_timeline(deal_id: int, db: Session = Depends(get_db)):
    deal = db.query(Deal).filter(Deal.id == deal_id).first()
    if not deal:
        raise HTTPException(status_code=404, detail="Deal not found")

    meetings = db.query(Meeting).filter(Meeting.deal_id == deal_id).order_by(Meeting.date.asc()).all()
    
    timeline_events = []
    for m in meetings:
        timeline_events.append({
            "id": m.id,
            "date": m.date,
            "title": m.title,
            "summary": m.summary or m.notes,
            "outcome": m.outcome,
            "next_action": m.next_action,
            "retained_in_hindsight": True
        })

    return {
        "deal_id": deal_id,
        "company_name": deal.company.name if deal.company else "Customer",
        "timeline": timeline_events
    }
