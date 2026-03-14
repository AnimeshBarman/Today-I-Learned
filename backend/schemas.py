from pydantic import BaseModel, EmailStr, Field
from typing import List, Optional
from datetime import datetime



class TILPostCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=100)
    short_note: Optional[str] = None

class KeywordSchema(BaseModel):
    text: str = Field(description="The keyword name")
    is_done: bool = Field(default=False, description="Always set to False initially")

class TILPost(TILPostCreate):
    id: int
    related_topics: List[str]
    web_links: List[str]
    keywords: List[KeywordSchema]
    
    owner_id: int
    created_at: datetime

    class Config:
        from_attributes = True


# User schemas
class UserBase(BaseModel):
    email: EmailStr

class UserCreate(UserBase):
    password: str = Field(..., min_length=8, max_length=24)

class UserLogin(UserCreate):
    pass

class UserOut(UserBase):
    id: int
    class Config:
        from_attributes = True




# Token schemas
class Token(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str

class TokenRefresh(BaseModel):
    refresh_token: str

class TokenData(BaseModel):
    email: Optional[str] = None