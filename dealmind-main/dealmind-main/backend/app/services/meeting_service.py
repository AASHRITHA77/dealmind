"""
Meeting Service Module.
Handles meeting database operations, Groq LLM analysis, and Hindsight memory RETAIN pipeline.
"""
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from app.models.models import Meeting, Deal
from app.schemas.schemas import MeetingCreate
from app.services.groq_service import groq_service
from app.services.hindsight_service import hindsight_service

class MeetingService:
    @staticmethod
    def get_meetings_for_deal(db: Session, deal_id: int):
        return db.query(Meeting).filter(Meeting.deal_id == deal_id).order_by(Meeting.date.desc()).all()

    @staticmethod
    async def process_and_create_meeting(db: Session, deal_id: int, meeting_in: MeetingCreate) -> Dict[str, Any]:
        """
        Meeting Processing Pipeline:
        1. Save meeting in SQLite DB
        2. Analyze meeting notes with Groq LLM
        3. Extract long-term memory representation
        4. RETAIN in Hindsight Cloud service
        """
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        company_name = deal.company.name if deal and deal.company else "Customer"

        # 1. Save in database
        db_meeting = Meeting(
            deal_id=deal_id,
            date=meeting_in.date,
            title=meeting_in.title,
            notes=meeting_in.notes,
            summary=meeting_in.summary,
            outcome=meeting_in.outcome,
            next_action=meeting_in.next_action
        )
        db.add(db_meeting)
        db.commit()
        db.refresh(db_meeting)

        # 2. Analyze with Groq
        groq_analysis = await groq_service.analyze_meeting(
            company_name=company_name,
            meeting_title=meeting_in.title,
            notes=meeting_in.notes or "",
            summary=meeting_in.summary
        )

        memory_statement = groq_analysis.get("memory_summary") or f"Meeting '{meeting_in.title}' with {company_name}: {meeting_in.summary or meeting_in.notes}"

        # 3. RETAIN in Hindsight (if API key is present)
        retained_info = None
        hindsight_status = "skipped_no_key"
        try:
            retain_res = await hindsight_service.retain_memory(
                deal_id=deal_id,
                content=memory_statement,
                memory_type="meeting_notes_analysis",
                metadata={
                    "meeting_id": db_meeting.id,
                    "date": db_meeting.date,
                    "analysis": groq_analysis
                }
            )
            retained_info = retain_res
            hindsight_status = "retained"
        except ValueError as ve:
            hindsight_status = f"unconfigured: {str(ve)}"
        except Exception as e:
            hindsight_status = f"error: {str(e)}"

        return {
            "meeting": db_meeting,
            "analysis": groq_analysis,
            "hindsight_status": hindsight_status,
            "retained_memory": memory_statement
        }

meeting_service = MeetingService()
