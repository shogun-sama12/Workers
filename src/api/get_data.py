from sqlalchemy import select
from sqlalchemy.orm import selectinload
from models.models import Job, Application, Location
from core.dependency import get_db, AsyncSession
from fastapi import Depends, HTTPException


async def get_jobs(db):
    stmt = select(Job).options(selectinload(Job.company), selectinload(Job.location))
    result = await db.execute(stmt)
    jobs = result.scalars().all()

    if not jobs:
        return "No jobs yet"
    
    return [
        {
            "job_id":job.id,
            "title":job.title,
            "experience":job.experience,
            "status":job.status,
            "company":job.company.name,
            "currency":job.currency,
            "employment":job.employment,
            "work_format":job.work_format,
            "salary_low":job.salary_low,
            "salary_high":job.salary_high,
            "location":job.location.city
        } for job in jobs
    ]

async def get_applications(
    worker_id:int,
    db:AsyncSession
):
    stmt = (select(Application)
        .where(Application.worker_id == worker_id)
        .options(
            selectinload(Application.worker),
            selectinload(Application.job).selectinload(Job.company)
            )
        )
    result = await db.execute(stmt)
    applications = result.scalars().all()

    if not result:
        raise HTTPException(status_code=404, detail="Applications not found")
    
    return [
        {
            "title":application.job.title,
            "status":application.status,
            "company":application.job.company.name
        } for application in applications
    ]

async def get_cities(db):
    stmt = select(Location)
    result = await db.execute(stmt)
    cites = result.scalars().all()
    return [
        {
            "city_id":city.id,
            "city_name":city.city
        } for city in cites
    ]