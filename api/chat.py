from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from jose import jwt

from api.authorization import connected_clients
from models import Chat
from schemas.chat import RequestMessage, ResponseMessage, ChatCreate, Chat
from database import get_db
import crud
from config import SECRET_KEY, ALGORITHM

router = APIRouter()

# Обработчик для отправки сообщения через вебсокет
@router.post("/api/send-message/")
async def send_message(message: RequestMessage):
    payload = jwt.decode(message.token, SECRET_KEY, algorithms=[ALGORITHM])
    client_id = payload.get("user_id")
    sender_user_id = message.reciver_user_id
    sender_username = message.reciver_username

    if not connected_clients.get(sender_user_id):
        return {"detail": "No connected clients for the chat."}
    if not connected_clients.get(client_id):
        return {"detail": "No connected clients for the chat."}

    # Отправляем сообщение клиенту
    client = connected_clients[client_id]
    other_client = connected_clients[sender_user_id]

    message_data = ResponseMessage(
        message=message.message,
        sender_id=client_id,
        reciver_id=sender_user_id,
        reciver_username=sender_username,
    ).model_dump()
    
    if client_id != sender_user_id:
        await client.send_json(message_data)
        await other_client.send_json(message_data)
    else:
        await client.send_json(message_data)

    return {"detail": "Message sent successfully."}

@router.post("/api/users/{user_id}/chats/", response_model=Chat)
def create_chat_for_user(
    users_id: list[int], chat: ChatCreate, db: Session = Depends(get_db)
):
    return crud.create_chat(db=db, chat=chat, users_id=users_id)


@router.get("/api/chats/", response_model=list[Chat])
def read_chats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    chats = crud.get_chats(db, skip=skip, limit=limit)
    return chats