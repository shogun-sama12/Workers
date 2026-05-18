from pydantic import BaseModel, Field, EmailStr

class CreateWorker(BaseModel):
    name:str= Field(
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
    password:str = Field(
        min_length=8
    )
    email:str = EmailStr

class CreateCompany(BaseModel):
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
    password:str = Field(
        min_length=8
    )
    