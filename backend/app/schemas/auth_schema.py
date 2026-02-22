from pydantic import BaseModel, EmailStr


class EmailSignup(BaseModel):
    username: str
    email: EmailStr
    password: str

class EmailLogin(BaseModel):
    email: EmailStr
    password: str

class VerifyEmailCode(BaseModel):
    email: EmailStr
    code: str

class ForgotPassword(BaseModel):
    email: EmailStr