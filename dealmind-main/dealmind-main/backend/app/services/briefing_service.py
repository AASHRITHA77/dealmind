"""
Briefing Service Module.
Synthesizes deal context and recalled Hindsight memories to build AI briefs.
Handles meeting outcome learning loop (analyze outcome -> retain in Hindsight).
"""
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from app.models.models import Deal, Meeting
from app.services.groq_service import groq_service
from app.services.hindsight_service import hindsight_service

class BriefingService:
    async def generate_briefing(self, db: Session, deal_id: int, use_hindsight: bool = True) -> Dict[str, Any]:
        """
        AI Meeting Brief Pipeline:
        1. Get deal & customer database records
        2. RECALL memories from Hindsight Cloud
        3. Send context to Groq LLM
        4. Return personalized briefing
        """
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        if not deal:
            raise ValueError(f"Deal #{deal_id} not found.")

        company_name = deal.company.name if deal.company else "Customer"
        contacts_data = [{"name": c.name, "role": c.role, "email": c.email} for c in deal.company.contacts] if deal.company else []
        meetings_data = [{"id": m.id, "title": m.title, "date": m.date, "summary": m.summary or m.notes} for m in deal.meetings]

        recalled_memories: List[Dict[str, Any]] = []
        hindsight_status = "disabled"

        if use_hindsight:
            try:
                recalled_memories = await hindsight_service.recall_memories(
                    deal_id=deal_id,
                    query="objections, customer priorities, competitors, what worked, what failed, security concerns"
                )
                hindsight_status = "success"
            except ValueError as ve:
                hindsight_status = f"unconfigured: {str(ve)}"
            except Exception as e:
                hindsight_status = f"error: {str(e)}"

        briefing = await groq_service.generate_meeting_brief(
            company_name=company_name,
            deal_value=deal.deal_value,
            stage=deal.stage,
            contacts=contacts_data,
            meetings=meetings_data,
            recalled_memories=recalled_memories,
            use_hindsight=use_hindsight
        )

        briefing["deal_id"] = deal_id
        briefing["company_name"] = company_name
        briefing["hindsight_status"] = hindsight_status
        briefing["recalled_memories"] = recalled_memories

        return briefing

    async def record_meeting_outcome(
        self,
        db: Session,
        deal_id: int,
        meeting_id: Optional[int],
        what_happened: str,
        customer_reaction: str,
        what_worked: str,
        what_failed: str,
        new_objection: str,
        next_action: str
    ) -> Dict[str, Any]:
        """
        Meeting Outcome Learning Loop:
        1. Save outcome details in database/meeting record
        2. Analyze outcome with Groq LLM
        3. Extract long-term lessons (what worked/failed, new objections)
        4. RETAIN in Hindsight Cloud
        """
        deal = db.query(Deal).filter(Deal.id == deal_id).first()
        company_name = deal.company.name if deal and deal.company else "Customer"

        outcome_text = (
            f"Meeting Outcome for {company_name}:\n"
            f"- What Happened: {what_happened}\n"
            f"- Reaction: {customer_reaction}\n"
            f"- What Worked: {what_worked}\n"
            f"- What Failed: {what_failed}\n"
            f"- New Objection: {new_objection}\n"
            f"- Next Action: {next_action}"
        )

        # Update meeting if meeting_id provided
        if meeting_id:
            meeting = db.query(Meeting).filter(Meeting.id == meeting_id).first()
            if meeting:
                meeting.outcome = f"{what_happened} (Reaction: {customer_reaction})"
                meeting.next_action = next_action
                db.commit()

        # Analyze outcome with Groq
        groq_analysis = await groq_service.analyze_meeting(
            company_name=company_name,
            meeting_title="Meeting Outcome Analysis",
            notes=outcome_text
        )

        memory_statement = (
            f"Lesson learned from {company_name}: "
            f"What worked: '{what_worked}'. What failed: '{what_failed}'. "
            f"Objection: '{new_objection}'. Reaction: '{customer_reaction}'."
        )

        # RETAIN in Hindsight
        hindsight_status = "retained"
        try:
            await hindsight_service.retain_memory(
                deal_id=deal_id,
                content=memory_statement,
                memory_type="meeting_outcome_learning",
                metadata={
                    "what_worked": what_worked,
                    "what_failed": what_failed,
                    "new_objection": new_objection,
                    "next_action": next_action
                }
            )
        except ValueError as ve:
            hindsight_status = f"unconfigured: {str(ve)}"
        except Exception as e:
            hindsight_status = f"error: {str(e)}"

        return {
            "deal_id": deal_id,
            "outcome_recorded": outcome_text,
            "analysis": groq_analysis,
            "memory_retained": memory_statement,
            "hindsight_status": hindsight_status
        }

briefing_service = BriefingService()
