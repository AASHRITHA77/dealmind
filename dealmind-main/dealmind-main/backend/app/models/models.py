import datetime
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from app.database import Base

class Company(Base):
    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    industry = Column(String, nullable=True)
    size = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    deals = relationship("Deal", back_populates="company", cascade="all, delete-orphan")
    contacts = relationship("Contact", back_populates="company", cascade="all, delete-orphan")


class Deal(Base):
    __tablename__ = "deals"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    deal_value = Column(Float, nullable=False, default=0.0)
    stage = Column(String, nullable=False)  # Discovery, Proposal, Negotiation, Closed Won, Closed Lost
    expected_close_date = Column(String, nullable=True)
    status = Column(String, nullable=False, default="Active")  # Active, Won, Lost
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="deals")
    meetings = relationship("Meeting", back_populates="deal", cascade="all, delete-orphan")


class Contact(Base):
    __tablename__ = "contacts"

    id = Column(Integer, primary_key=True, index=True)
    company_id = Column(Integer, ForeignKey("companies.id"), nullable=False)
    name = Column(String, nullable=False)
    role = Column(String, nullable=True)
    email = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    company = relationship("Company", back_populates="contacts")


class Meeting(Base):
    __tablename__ = "meetings"

    id = Column(Integer, primary_key=True, index=True)
    deal_id = Column(Integer, ForeignKey("deals.id"), nullable=False)
    date = Column(String, nullable=False)  # ISO Date or formatted string
    title = Column(String, nullable=False)
    notes = Column(Text, nullable=True)
    summary = Column(Text, nullable=True)
    outcome = Column(Text, nullable=True)
    next_action = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    # Relationships
    deal = relationship("Deal", back_populates="meetings")
