from pydantic import BaseModel


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