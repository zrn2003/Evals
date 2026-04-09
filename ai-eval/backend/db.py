from sqlalchemy.ext.asyncio import create_async_engine, async_sessionmaker, AsyncSession
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column
from sqlalchemy import JSON, String, DateTime
from datetime import datetime

from config import settings

engine = create_async_engine(settings.DATABASE_URL, echo=False)
AsyncSessionLocal = async_sessionmaker(bind=engine, expire_on_commit=False, class_=AsyncSession)

class Base(DeclarativeBase):
    pass

class EvaluationRecord(Base):
    __tablename__ = "evaluation_history"
    
    id: Mapped[str] = mapped_column(String, primary_key=True)
    timestamp: Mapped[datetime] = mapped_column(DateTime)
    prompt: Mapped[str] = mapped_column(String)
    responses: Mapped[dict] = mapped_column(JSON)
    evaluations: Mapped[dict] = mapped_column(JSON)

async def get_db():
    async with AsyncSessionLocal() as session:
        yield session
