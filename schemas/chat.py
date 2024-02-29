from pydantic import BaseModel
from typing import List

from schemas.user import UserChat

class RequestMessage(BaseModel):
    token: str
    reciver_user_id: int
    reciver_username: str
    message: str
    

class ResponseMessage(BaseModel):
    type: str = 'message'
    message: str
    sender_id: int
    reciver_id: int
    reciver_username: str
    
class ChatBase(BaseModel):
    title: str

class ChatCreate(ChatBase):
    pass

class Chat(ChatBase):
    id: int
    owners: List[UserChat]

    class Config:
        orm_mode = True

