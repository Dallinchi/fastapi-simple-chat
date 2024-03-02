from pydantic import BaseModel
from typing import List

from schemas.user import UserChat

class RequestPersonalMessage(BaseModel):
    type: str = 'personal-message'
    token: str
    sender_id: int
    receiver_id: int
    message: str
    
class RequestGroupMessage(BaseModel):
    type: str = 'group-message'
    token: str
    sender_id: int
    chat_id: int
    message: str
    

class ResponsePersonalMessage(BaseModel):
    type: str = 'personal-message'
    sender_id: int
    sender_username: str
    receiver_id: int
    message: str

class ResponseGroupMessage(BaseModel):
    type: str = 'group-message'
    sender_id: int
    sender_username: str
    chat_id: int
    message: str
    
class ChatBase(BaseModel):
    title: str

class ChatCreate(ChatBase):
    users_id: list[int]

class Chat(ChatBase):
    id: int
    owners: List[UserChat]

    class Config:
        orm_mode = True

