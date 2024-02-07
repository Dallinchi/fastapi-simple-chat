from pydantic import BaseModel


class Message(BaseModel):
    token: str
    reciver_user_id: int
    message: str
    