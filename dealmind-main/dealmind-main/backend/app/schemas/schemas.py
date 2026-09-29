from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr, ConfigDict

# --- Company Schemas ---
class CompanyBase(BaseModel):
    name: str
    industry: Optional[str] = None
    size: Optional[str] = None

class CompanyCreate(CompanyBase):
    pass

class CompanyResponse(CompanyBase):
    id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Contact Schemas ---
class ContactBase(BaseModel):
    name: str
    role: Optional[str] = None
    email: Optional[str] = None

class ContactCreate(ContactBase):
    pass

class ContactResponse(ContactBase):
    id: int
    company_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Meeting Schemas ---
class MeetingBase(BaseModel):
    date: str
    title: str
    notes: Optional[str] = None
    summary: Optional[str] = None
    outcome: Optional[str] = None
    next_action: Optional[str] = None

class MeetingCreate(MeetingBase):
    pass

class MeetingResponse(MeetingBase):
    id: int
    deal_id: int
    created_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Deal Schemas ---
class DealBase(BaseModel):
    deal_value: float
    stage: str
    expected_close_date: Optional[str] = None
    status: str = "Active"

class DealCreate(DealBase):
    company_id: int

class DealResponse(DealBase):
    id: int
    company_id: int
    created_at: datetime
    company: Optional[CompanyResponse] = None

    model_config = ConfigDict(from_attributes=True)

class DealDetailResponse(DealResponse):
    company: Optional[CompanyResponse] = None
    contacts: List[ContactResponse] = []
    meetings: List[MeetingResponse] = []
    meetings_count: int = 0
    last_interaction: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
