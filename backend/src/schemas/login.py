from pydantic import BaseModel, Field, EmailStr

class LoginWorker(BaseModel):
    email: str = Field(max_length=50)
    password:str

class LoginCompany(BaseModel):
    email: EmailStr
    password:str