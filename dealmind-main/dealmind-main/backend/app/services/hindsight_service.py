"""
Hindsight Service Module.
Handles RETAIN (storing) and RECALL (retrieving) customer/deal memory
via the official Hindsight Cloud REST API endpoints.
"""
import logging
import httpx
from typing import List, Dict, Any, Optional
from app.config import settings

logger = logging.getLogger("hindsight_service")

class HindsightService:
    def __init__(self):
        self.api_key = settings.HINDSIGHT_API_KEY
        self.base_url = settings.HINDSIGHT_BASE_URL.rstrip('/')

    def _get_headers(self) -> Dict[str, str]:
        if not self.api_key:
            raise ValueError("HINDSIGHT_API_KEY environment variable is missing. Hindsight memory integration requires a valid API key.")
        return {
            "Authorization": f"Bearer {self.api_key}",
            "X-API-Key": self.api_key,
            "Content-Type": "application/json"
        }

    def get_bank_id(self, deal_id: int) -> str:
        """
        Generates a dedicated memory bank / namespace ID per customer deal.
        """
        return f"dealmind_deal_{deal_id}"

    async def retain_memory(
        self,
        deal_id: int,
        content: str,
        memory_type: str = "meeting_insight",
        metadata: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        RETAIN: Stores a long-term memory for a given deal into Hindsight Cloud service.
        """
        if not self.api_key:
            raise ValueError("HINDSIGHT_API_KEY is not configured. Hindsight memory system requires a valid API key.")

        bank_id = self.get_bank_id(deal_id)
        url = f"{self.base_url}/retain"

        payload = {
            "bank_id": bank_id,
            "memory": content,
            "content": content,
            "type": memory_type,
            "metadata": {
                "deal_id": deal_id,
                "memory_type": memory_type,
                **(metadata or {})
            }
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=self._get_headers(), timeout=15.0)
                if response.status_code in (200, 201):
                    res_data = response.json()
                    logger.info(f"Successfully retained memory in Hindsight bank '{bank_id}'")
                    return {
                        "status": "success",
                        "bank_id": bank_id,
                        "retained": content,
                        "raw_response": res_data
                    }
                else:
                    logger.error(f"Hindsight RETAIN error ({response.status_code}): {response.text}")
                    raise RuntimeError(f"Hindsight API returned HTTP {response.status_code}: {response.text}")
            except httpx.RequestError as e:
                logger.error(f"Hindsight service request failed: {e}")
                raise RuntimeError(f"Could not connect to Hindsight Cloud API at {self.base_url}: {str(e)}")

    async def recall_memories(
        self,
        deal_id: int,
        query: Optional[str] = None,
        limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        RECALL: Retrieves relevant long-term memories for a given deal from Hindsight Cloud service.
        """
        if not self.api_key:
            raise ValueError("HINDSIGHT_API_KEY is not configured. Cannot recall memories from Hindsight.")

        bank_id = self.get_bank_id(deal_id)
        url = f"{self.base_url}/recall"

        payload = {
            "bank_id": bank_id,
            "query": query or "customer objections, what worked, priorities, key concerns, commitments",
            "limit": limit
        }

        async with httpx.AsyncClient() as client:
            try:
                response = await client.post(url, json=payload, headers=self._get_headers(), timeout=15.0)
                if response.status_code == 200:
                    res_data = response.json()
                    memories = res_data.get("memories", res_data.get("results", []))
                    if isinstance(memories, list):
                        return memories
                    return []
                else:
                    logger.error(f"Hindsight RECALL error ({response.status_code}): {response.text}")
                    raise RuntimeError(f"Hindsight API returned HTTP {response.status_code}: {response.text}")
            except httpx.RequestError as e:
                logger.error(f"Hindsight RECALL request failed: {e}")
                raise RuntimeError(f"Could not connect to Hindsight Cloud API at {self.base_url}: {str(e)}")

hindsight_service = HindsightService()
