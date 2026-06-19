from fastapi import FastAPI, Depends, HTTPException, Response, Query
import uvicorn
from core.dependency import get_db, get_current_user, require_role,  get_application, verify_employee
from config import AsyncSession
from core.security import authenticate_user, set_cookie
from schemas.schemas import Company_schema, Worker_schema, Job_schema, Employee_schema, JobFilterSchema
from schemas.registration import CreateCompany, CreateWorker
from schemas.login import LoginCompany, LoginWorker
from models.models import Worker, Company, Job, Application, Employee
from core.security import password_hasher
from api.get_data import get_jobs, get_applications, get_cities ,get_job, filter_jobs
from api.post_update_data import check_application
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
app =  FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,                  
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/")
def greetings():
    return "App running"

@app.get("/cities")
async def cites_list(
    db:AsyncSession = Depends(get_db)
):
    return await get_cities(db)

@app.post("/register/worker")
async def register_worker(
    worker:CreateWorker,
    db:AsyncSession = Depends(get_db)
):
    new_worker=Worker(
        name = worker.name,
        work =worker.work,
        experience = worker.experience,
        email = worker.email,
        hashed_password = password_hasher(worker.password)
    )
    db.add(new_worker)
    await db.commit()
    await db.refresh(new_worker)
    return {"Worker created":new_worker.name,"worker_id":new_worker.id}

@app.post("/register/company")
async def register_company(
    company:CreateCompany,
    db:AsyncSession = Depends(get_db)
):
    new_company=Company(
        name = company.name,
        description =company.description,
        website = company.website,
        email = company.email,
        hashed_password = password_hasher(company.password)
    )
    db.add(new_company)
    await db.commit()
    await db.refresh(new_company)
    return {"Company created":new_company.name,"company_id":new_company.id}

@app.post("/login/worker")
async def login(
    credential:LoginWorker,
    response:Response,
    db:AsyncSession = Depends(get_db)
):
    access_token  = await authenticate_user(credential=credential,db = db,table=Worker)
    if not access_token:
        raise HTTPException(status_code=401,detail="invalid credentials")
    set_cookie(response,access_token=access_token)
    return {"msg":"logged in"}

@app.post("/login/company")
async def login(
    credential:LoginCompany,
    response:Response,
    db:AsyncSession = Depends(get_db)
):
    access_token  = await authenticate_user(credential=credential,db = db,table=Company)
    if not access_token:
        raise HTTPException(status_code=401,detail="invalid credentials")
    set_cookie(access_token=access_token,response=response)
    return {"msg":"logged in"}

@app.get("/profile")
async def get_profile(
    current_user  = Depends(get_current_user)
):
    return {
        "name":current_user["user"].name,
        "email":current_user["user"].email,
        "role":current_user["role"]
    }

@app.get("/logout")
def logout(response:Response): #dependencies = Depends(get_current_user)
    response.delete_cookie(key="access_token")
    return {"message":"logged out"}

@app.post("/jobs/add")
async def add_job(
    job:Job_schema,
    db:AsyncSession = Depends(get_db),
    current_user = Depends(require_role("company")),
):
    new_job = Job(
        title = job.title,
        experience = job.experience,
        company_id = current_user.id,
        status = True,
        salary_low = job.salary_low,
        salary_high = job.salary_high,
        employment = job.employment,
        work_format = job.work_format,
        location_id = job.location_id,
        description = job.description
    )
    db.add(new_job)
    await db.commit()
    await db.refresh(new_job)

    return {new_job.id: new_job.title}

@app.get("/jobs")
async def jobs(
    page: int = Query(1, ge=1),
    size: int = Query(10,ge=1,le=100),
    db:AsyncSession = Depends(get_db)
):
    offset = (page-1)*size
    jobs = await get_jobs(offset =offset,limit = size,page =page,db=db)
    return jobs
    
@app.post("/jobs/filtered")
async def get_filtered_jobs(
    filter:JobFilterSchema,
    db:AsyncSession = Depends(get_db)
):
    jobs = await filter_jobs(filter, db)
    return jobs

@app.get("/jobs/{job_id}")
async def get_job_info(
    job_id:int,
    db:AsyncSession = Depends(get_db)
):
    job = await get_job(job_id = job_id,db= db)
    return job

@app.post("/jobs/{job_id}/application")
async def apply_to_job(
    job_id:int,
    db:AsyncSession = Depends(get_db),
    worker = Depends(require_role("worker")),
    job = Depends(get_job)
):
    application = Application(
        worker_id = worker.id,
        job_id = job_id
    )
    db.add(application)
    try:
        await db.commit()
        await db.refresh(application)
    except IntegrityError:
        raise HTTPException(status_code=409, detail="Already applied")

    return {"message":"Applied successfully"}

@app.post("/applications/{application_id}")
async def process_application(
    application_id:int,
    decision:str,
    db:AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    application = await get_application(application_id, db)
    print(f"Application role: {application.job.title}")
    company_id = application.job.company_id
    print(f"Company={company_id}")

    employee = await verify_employee("hr",company_id ,db, current_user=current_user)

    print(f"Employee id: {employee.id}")
    if employee and application:
        await check_application(decision, application, db)
    else:
        raise HTTPException(status_code=404, detail="Appication not found")
    
    return {"message":"reqruiment is over"}

@app.get("/applications")
async def show_applications(
    db:AsyncSession = Depends(get_db),
    worker = Depends(require_role("worker"))
):
    applications= await get_applications(db= db, worker_id=worker.id)
    return applications

# @app.post("/create_employee")
# async def create_employee(
#     employee : Employee_schema,
#     db:AsyncSession = Depends(get_db)
# ):
#     new_employee = Employee(
#         company_id = employee.company_id,
#         worker_id = employee.worker_id,
#         role = employee.role
#     )
#     db.add(new_employee)
#     await db.commit()
#     await db.refresh(new_employee)

#     return {"New epmloyee":new_employee.id}

if __name__ =="__main__":
    uvicorn.run("main:app",reload=True)
