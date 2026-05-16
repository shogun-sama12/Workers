from sqlalchemy import String, Integer, ForeignKey, DateTime, Text, Boolean, func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from config import Base
from datetime import datetime
class Company(Base):
    __tablename__="companies"

    id: Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )

    name:Mapped[str]= mapped_column(
        String(100),
        unique=True,
        nullable=False,
        index=True
    )

    description:Mapped[str] = mapped_column(
        Text,
        nullable=False
    )

    website:Mapped[str] = mapped_column(
        String(200),
        unique=True,
        nullable=False
    )

    jobs: Mapped[list["Job"]] = relationship(
        back_populates="company",
        cascade="all, delete-orphan"
    )
    
class Skills(Base):
    __tablename__="skills"
    id:Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )
    name = Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )

class Job(Base):
    __tablename__="jobs"

    id :Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True,
        index=True
    )

    title:Mapped[str]= mapped_column(
        String(100),
        nullable=False
    )
    experience:Mapped[int] = mapped_column(
        String(10),
        nullable=False
    )
    status: Mapped[bool] = mapped_column(
        Boolean,
        nullable=False
    )
    company_id: Mapped[int] = mapped_column(
        ForeignKey("companies.id")
    )

    created_at: Mapped[datetime] = mapped_column(
        DateTime,
        nullable=False,
        default=func.now()
    )
    company: Mapped[Company] = relationship(
        back_populates="jobs"
    )

class Worker(Base):
    __tablename__="workers"

    id :Mapped[int] = mapped_column(
        primary_key=True,
        autoincrement=True
    )
    name :Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        index=True
    )
    work: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    experience: Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )
    skills: Mapped[list[Skills]] = relationship(
        back_populates="worker"
    )

class JobSkills(Base):
    __tablename__="job_skills"

    job_id :Mapped[int] = mapped_column(
        ForeignKey("jobs.id"),
        primary_key=True
    )
    skill_id :Mapped[int] = mapped_column(
        ForeignKey("skills.id"),
        primary_key=True
    )
class Location(Base):
    __tablename__="locations"

    id :Mapped[int]= mapped_column(
        primary_key=True,
        autoincrement=True
    )
    city :Mapped[str] = mapped_column(
        String(100),
        nullable=False,
        unique=True
    )
    country :Mapped[str] = mapped_column(
        String(100),
        nullable=False
    )