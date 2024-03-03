from pydantic import BaseModel
from typing import List

from schemas.user import UserChat

    
class RequestMessage(BaseModel):
    message_type: str
    token: str
    sender_id: int
    chat_id: int
    message: str
    

class ResponseMessage(BaseModel):
    message_type: str
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

