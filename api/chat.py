from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from jose import jwt

from api.authorization import connected_clients, get_current_active_user
from models import Chat
from schemas.chat import RequestPersonalMessage, ResponsePersonalMessage, ChatCreate, Chat
from schemas.user import User
from database import get_db
import crud
from config import SECRET_KEY, ALGORITHM

router = APIRouter()

# Обработчик для отправки сообщения через вебсокет
@router.post("/api/send-message/")
async def send_message(message: RequestPersonalMessage):
    payload = jwt.decode(message.token, SECRET_KEY, algorithms=[ALGORITHM])
    sender_id = payload.get("user_id")
    receiver_id = message.receiver_id
    # sender_username = message.reciver_username # в новой схеме этого нет

    if not connected_clients.get(sender_id):
        return {"detail": "No connected clients for the chat."}
    if not connected_clients.get(receiver_id):
        return {"detail": "No connected clients for the chat."}

    # Отправляем сообщение клиенту
    sender = connected_clients[sender_id]
    receiver = connected_clients[receiver_id]

    message_data = ResponsePersonalMessage(
        message=message.message,
        sender_id=sender_id,
        receiver_id=receiver_id,
        # sender_username=sender_username, # в новой схеме этого нет
    ).model_dump()
    
    if sender_id != receiver_id:
        await sender.send_json(message_data)
        await receiver.send_json(message_data)
    else:
        await sender.send_json(message_data)

    return {"detail": "Message sent successfully."}

@router.post("/api/chats/", response_model=Chat)
def create_chat_for_user(
    current_user: Annotated[User, Depends(get_current_active_user)], usernames: list[str], chat: ChatCreate, db: Session = Depends(get_db),
):
    current_user.id
    return crud.create_chat(db=db, chat=chat, user=current_user, usernames=usernames)


@router.get("/api/chats/", response_model=list[Chat])
def read_chats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    chats = crud.get_chats(db, skip=skip, limit=limit)
    return chats
