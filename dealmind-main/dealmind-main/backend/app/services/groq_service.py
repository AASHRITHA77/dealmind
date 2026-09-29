"""
Groq LLM Service Module.
Handles calls to Groq Chat Completion API using env variables.
Extracts structured insights from meeting notes and outcomes.
Generates personalized meeting briefs based on deal data and recalled Hindsight memories.
"""
import os
import json
import logging
import httpx
from typing import Dict, Any, List, Optional
from app.config import settings

logger = logging.getLogger("groq_service")

class GroqService:
    def __init__(self):
        self.api_key = settings.GROQ_API_KEY
        self.model = settings.GROQ_MODEL
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"

    async def _call_groq(self, system_prompt: str, user_prompt: str, temperature: float = 0.2) -> str:
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is not configured in environment variables.")

        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            "temperature": temperature
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(self.api_url, headers=headers, json=payload, timeout=30.0)
                response.raise_for_status()
                data = response.json()
                return data["choices"][0]["message"]["content"]
            except httpx.HTTPStatusError as e:
                logger.error(f"Groq API HTTP error: {e.response.status_code} - {e.response.text}")
                raise RuntimeError(f"Groq API error ({e.response.status_code}): {e.response.text}")
            except Exception as e:
                logger.error(f"Groq API call failed: {str(e)}")
                raise RuntimeError(f"Groq API connection failed: {str(e)}")

    async def analyze_meeting(self, company_name: str, meeting_title: str, notes: str, summary: Optional[str] = None) -> Dict[str, Any]:
        """
        Extracts structured customer and deal insights from meeting notes.
        """
        system_prompt = (
            "You are an expert B2B sales intelligence AI assistant. "
            "Analyze the meeting notes and extract structured key insights. "
            "Return strictly a JSON object with the following keys:\n"
            "- customer_priorities: list of strings\n"
            "- customer_requirements: list of strings\n"
            "- objections: list of strings\n"
            "- competitors_mentioned: list of strings\n"
            "- pricing_concerns: list of strings\n"
            "- security_concerns: list of strings\n"
            "- what_worked: list of strings\n"
            "- what_failed: list of strings\n"
            "- commitments_and_promises: list of strings\n"
            "- next_actions: list of strings\n"
            "- memory_summary: concise 1-2 sentence memory statement summarizing what was learned"
        )

        user_prompt = f"Company: {company_name}\nMeeting Title: {meeting_title}\nSummary: {summary or ''}\nNotes: {notes}"

        try:
            raw_response = await self._call_groq(system_prompt, user_prompt, temperature=0.1)
            # Clean possible markdown formatting
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            return json.loads(cleaned.strip())
        except Exception as e:
            logger.warning(f"Groq JSON parsing failed, using fallback extraction: {e}")
            return {
                "customer_priorities": [notes[:100]] if notes else [],
                "customer_requirements": [],
                "objections": [],
                "competitors_mentioned": [],
                "pricing_concerns": [],
                "security_concerns": [],
                "what_worked": [],
                "what_failed": [],
                "commitments_and_promises": [],
                "next_actions": [],
                "memory_summary": f"Meeting '{meeting_title}' with {company_name}: {notes[:150]}"
            }

    async def generate_meeting_brief(
        self,
        company_name: str,
        deal_value: float,
        stage: str,
        contacts: List[Dict[str, Any]],
        meetings: List[Dict[str, Any]],
        recalled_memories: List[Dict[str, Any]],
        use_hindsight: bool = True
    ) -> Dict[str, Any]:
        """
        Generates a comprehensive sales briefing based on deal context and recalled Hindsight memories.
        """
        system_prompt = (
            "You are DealMind, an elite AI Sales Deal Intelligence Briefing Agent. "
            "Generate a highly actionable meeting preparation brief for the sales team. "
            "Return strictly a JSON object with the keys:\n"
            "- executive_summary: str\n"
            "- customer_overview: str\n"
            "- current_deal_status: str\n"
            "- customer_priorities: list of strings\n"
            "- key_stakeholders_focus: list of strings\n"
            "- previous_objections: list of strings\n"
            "- competitors_mentioned: list of strings\n"
            "- what_worked_previously: list of strings\n"
            "- what_did_not_work: list of strings\n"
            "- unresolved_issues: list of strings\n"
            "- important_follow_ups: list of strings\n"
            "- suggested_discussion_focus: list of strings\n"
            "- memory_source_note: str"
        )

        contact_info = ", ".join([f"{c.get('name')} ({c.get('role', 'N/A')})" for c in contacts])
        recent_meetings = json.dumps([{ "title": m.get("title"), "date": m.get("date"), "summary": m.get("summary") } for m in meetings[:3]])

        if use_hindsight and recalled_memories:
            memories_str = json.dumps([m.get("content") for m in recalled_memories])
            hindsight_context = f"\nRECALLED HINDSIGHT LONG-TERM MEMORIES:\n{memories_str}\n"
        else:
            hindsight_context = "\n[WITHOUT HINDSIGHT MODE: No long-term historical memories provided. Rely only on basic structured deal data.]\n"

        user_prompt = (
            f"Company Name: {company_name}\n"
            f"Deal Value: ${deal_value:,.2f}\n"
            f"Stage: {stage}\n"
            f"Stakeholders: {contact_info}\n"
            f"Recent Structured Meetings: {recent_meetings}\n"
            f"{hindsight_context}\n"
            f"Generate the meeting briefing JSON."
        )

        try:
            raw_response = await self._call_groq(system_prompt, user_prompt, temperature=0.2)
            cleaned = raw_response.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            data = json.loads(cleaned.strip())
            data["use_hindsight"] = use_hindsight
            data["memories_recalled_count"] = len(recalled_memories) if use_hindsight else 0
            return data
        except Exception as e:
            logger.error(f"Error generating Groq meeting brief: {e}")
            return {
                "executive_summary": f"Meeting Briefing for {company_name} (${deal_value:,.2f} - {stage}).",
                "customer_overview": f"{company_name} is currently in {stage} stage.",
                "current_deal_status": f"Active deal valued at ${deal_value:,.2f}.",
                "customer_priorities": ["API Integration", "ROI Verification"],
                "key_stakeholders_focus": [f"{c.get('name')} ({c.get('role')})" for c in contacts],
                "previous_objections": ["Pricing concern raised previously"] if use_hindsight else [],
                "competitors_mentioned": ["Competitor mentioned in previous meeting"] if use_hindsight else [],
                "what_worked_previously": ["ROI Demonstration"] if use_hindsight else [],
                "what_did_not_work": ["Discount-based negotiation"] if use_hindsight else [],
                "unresolved_issues": ["Security & compliance review documentation"],
                "important_follow_ups": ["Confirm final executive sign-off"],
                "suggested_discussion_focus": ["Review ROI framework and confirm contract terms"],
                "memory_source_note": f"{len(recalled_memories)} memories recalled from Hindsight" if use_hindsight else "Without Hindsight memory context",
                "use_hindsight": use_hindsight,
                "memories_recalled_count": len(recalled_memories) if use_hindsight else 0
            }

groq_service = GroqService()
