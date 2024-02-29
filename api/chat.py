from fastapi import APIRouter, Depends
from jose import jwt
from sqlalchemy.orm import Session

from api.authorization import connected_clients
from schemas.chat import RequestMessage, ResponseMessage, Chat, ChatCreate
from config import SECRET_KEY, ALGORITHM
from database import get_db
import crud


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

@router.post("/api/chats/")
def create_chat(user_id:int, chat: ChatCreate, db: Session = Depends(get_db)):
    return crud.Chat.create_chat(db=db, chat=chat, user_id=user_id)

@router.get("/api/chats/")
def read_chat(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    chats = crud.Chat.get_chats(db, skip=skip, limit=limit)
    return chats

