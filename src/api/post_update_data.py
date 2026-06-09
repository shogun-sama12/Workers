from sqlalchemy import update
from fastapi import Depends, HTTPException
from core.dependency import get_db, AsyncSession
# from api.get_data import get_applications
from models.models import Application, Employee

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