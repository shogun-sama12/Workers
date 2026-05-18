from pydantic import BaseModel, Field, EmailStr
class Job_schema(BaseModel):
    title:str = Field(
        max_length=40,
        min_length=3,
        description="job_title"
    )
    experience:int = Field(
        ge=0,
        le=50,
        description="required job experience"
    )

class Company(BaseModel):
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
    
class Worker(BaseModel):
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

class Location(BaseModel):
    city:str = Field(
        min_length=2,
        max_length=100
    )
    country:str = Field(
        min_length=2
    )