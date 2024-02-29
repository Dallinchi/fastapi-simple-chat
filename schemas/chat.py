from pydantic import BaseModel
from schemas.user import User

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
    owner_id: int

    class Config:
        orm_mode = True