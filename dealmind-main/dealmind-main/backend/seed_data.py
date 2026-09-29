import sys
import os

# Add backend directory to path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.database import Base, engine, SessionLocal
from app.models.models import Company, Deal, Contact, Meeting

def seed_database():
    # Recreate tables
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)

    db = SessionLocal()
    try:
        # 1. Company
        nova_tech = Company(
            name="NovaTech Solutions",
            industry="Enterprise Software & Cloud Infrastructure",
            size="250-500 employees"
        )
        db.add(nova_tech)
        db.commit()
        db.refresh(nova_tech)

        # 2. Deal
        deal = Deal(
            company_id=nova_tech.id,
            deal_value=85000.0,
            stage="Negotiation",
            expected_close_date="2025-04-15",
            status="Active"
        )
        db.add(deal)
        db.commit()
        db.refresh(deal)

        # 3. Contacts
        contacts = [
            Contact(
                company_id=nova_tech.id,
                name="Sarah Chen",
                role="CTO",
                email="sarah.chen@novatech.io"
            ),
            Contact(
                company_id=nova_tech.id,
                name="Michael Rao",
                role="CFO",
                email="michael.rao@novatech.io"
            ),
            Contact(
                company_id=nova_tech.id,
                name="Priya Shah",
                role="Engineering Manager",
                email="priya.shah@novatech.io"
            ),
        ]
        db.add_all(contacts)
        db.commit()

        # 4. Meetings (Historical meetings matching exact user specification)
        meetings = [
            Meeting(
                deal_id=deal.id,
                date="2025-01-10",
                title="Initial Product & API Interest Meeting",
                notes="Met with Sarah Chen (CTO). The customer showed interest in the product. API integration was identified as important.",
                summary="Customer showed strong product interest. API integration is critical requirement for CTO Sarah Chen.",
                outcome="Qualified deal. Agreed on technical architecture deep dive.",
                next_action="Prepare API integration architecture documentation."
            ),
            Meeting(
                deal_id=deal.id,
                date="2025-01-22",
                title="Commercial Proposal & Pricing Discussion",
                notes="Met with Michael Rao (CFO). The customer raised concerns about pricing and annual license costs.",
                summary="Pricing objection raised by CFO Michael Rao regarding the $85,000 quote.",
                outcome="Customer requested ROI justification.",
                next_action="Prepare comprehensive ROI framework presentation."
            ),
            Meeting(
                deal_id=deal.id,
                date="2025-02-05",
                title="Competitor Evaluation & Technical Review",
                notes="Met with Priya Shah (Engineering Manager) & Sarah Chen. The customer mentioned a competitor offering lower initial setup pricing.",
                summary="Competitor mentioned during technical review. Need to highlight superior AI memory retention capabilities.",
                outcome="Priya agreed to compare technical capabilities.",
                next_action="Send feature comparison matrix."
            ),
            Meeting(
                deal_id=deal.id,
                date="2025-02-18",
                title="Security & Compliance Audit",
                notes="Met with NovaTech security team and Priya Shah. The customer raised security and compliance concerns regarding cloud LLM memory retention.",
                summary="Security and compliance concerns raised. SOC2 report and zero data retention confirmation requested.",
                outcome="Security documentation submitted.",
                next_action="Schedule final commercial negotiation."
            ),
            Meeting(
                deal_id=deal.id,
                date="2025-03-01",
                title="ROI Demonstration & Negotiation Session",
                notes="Met with Michael Rao (CFO) and Sarah Chen. An ROI demonstration worked well. A discount-based approach did not resolve the customer's concern.",
                summary="An ROI demonstration worked well with CFO Michael Rao. A discount-based approach did not resolve the customer's concern.",
                outcome="ROI approach validated. Contract pending executive briefing.",
                next_action="Prepare executive AI meeting brief for final sign-off."
            )
        ]
        db.add_all(meetings)
        db.commit()

        print(f"Database successfully seeded! Created Company '{nova_tech.name}' with Deal ID {deal.id} and {len(meetings)} meetings.")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()
