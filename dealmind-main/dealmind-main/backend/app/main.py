from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import Base, engine, SessionLocal
from app.models.models import Company
from app.routes.api import router as api_router
from seed_data import seed_database

# Initialize database tables
Base.metadata.create_all(bind=engine)

# Seed demo data only if the database is empty
db = SessionLocal()
try:
    if db.query(Company).first() is None:
        print("Database is empty. Seeding NovaTech demo data...")
        seed_database()
    else:
        print("Database already contains data. Skipping seed.")
finally:
    db.close()

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DealMind – AI Sales Deal Intelligence / Sales Call Briefing Agent",
    version="0.1.0"
)

# CORS setup for frontend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(api_router)

@app.get("/")
def root():
    return {"message": "Welcome to DealMind API", "docs": "/docs"}