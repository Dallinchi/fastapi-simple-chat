from pydantic import BaseModel
from typing import List


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: str


class UserBase(BaseModel):
    username: str


class UserCreate(UserBase):
    password: str


class UserChat(UserBase):
    id: int


from schemas.chat import Chat
class User(UserBase):
    id: int
    disabled: bool | None = None
    chats: List[Chat] = []

    class Config:
        orm_mode = True


class UserPublic(UserChat):
    pass
