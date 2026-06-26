from sqlalchemy import update, select
from fastapi import Depends, HTTPException
from core.dependency import get_db, AsyncSession
from api.get_data import get_job
# from api.get_data import get_applications
from models.models import Application, Employee, Job, Company

# async def hire_employee(
#     reply:str,
#     application_id:int,
#     db:AsyncSession = Depends(get_db),
#     application = Depends(get_applications(application_id))
# ):
#     if reply:
#         stmt = update(Application).where(Application.id == application_id)
#         hired= True
#     else:
#         stmt = update(Application).where(Application.id == application_id)
#         hired= False
    
#     try:
#         await db.execute(stmt)
#         await db.commit()  
#     except Exception as e:
#         raise HTTPException(status_code=401)

#     return hired

async def check_application(
    decision:str,
    application:Application,
    db:AsyncSession
):
    try:
        stmt = update(Application).where(Application.id == application.id).values(status = decision)
        await db.execute(stmt)

        if decision == "hired":
            new_employee  = Employee(
                company_id = application.job.company_id,
                worker_id =  application.worker_id,
                role = application.job.title
            )
            db.add(new_employee)
            await db.commit()
            await db.refresh(new_employee)
            return {"msg":"Employee hired","role":new_employee.role}
    
    except Exception as e:
        await db.rollback()
        raise e
    
async def update_job_opening(
    job_id:int,
    changes,
    company:Company,
    db:AsyncSession
):
    company_id = company.id
    print(f"Company id: {company_id}")
    stmt = select(Job).where(Job.id == job_id).where(Job.company_id == company_id)
    result = await db.execute(stmt)
    job = result.scalar_one_or_none()

    if not job:
        raise HTTPException(status_code=404, detail="Job not found")

    job.title = changes.title
    job.description = changes.description
    job.experience = changes.experience
    job.salary_low = changes.salary_low
    job.salary_high = changes.salary_high
    job.employment = changes.employment
    job.work_format = changes.work_format
    job.location_id = changes.location_id
    
    await db.commit()