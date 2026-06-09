from pydantic import BaseModel, Field, EmailStr
class Job_schema(BaseModel):
    title:str = Field(
        max_length=40,
        min_length=3,
        description="job_title"
    )
    experience:str = Field(
        description="required job experience"
    )
    salary_low:int
    salary_high:int
    employment:str
    work_format:str
    location_id:int
    description:str

class Company_schema(BaseModel):
    name:str = Field(
        min_length=2,
        max_length=100
    )
    describtion:str= Field(
        min_length=3,
        max_length=1000
    )
    website:str = Field(
        max_length=200
    )
    
class Worker_schema(BaseModel):
    name:str = Field(
        min_length=3,
        max_length=100
    )
    work:str = Field(
        min_length=2
    )
    experience:str = Field(
        ge=0,
        le=50
    )

class Location_schema(BaseModel):
    city:str = Field(
        min_length=2,
        max_length=100
    )
    country:str = Field(
        min_length=2
    )

class Employee_schema(BaseModel):
    role: str = Field(
        min_length=2,
        max_length=100
    )
    worker_id:int

    company_id:int