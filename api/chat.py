from typing import Annotated, Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt

from api.authorization import connected_clients, get_current_active_user
from models import Chat
from schemas.chat import (
    RequestPersonalMessage,
    RequestGroupMessage,
    ResponsePersonalMessage,
    ResponseGroupMessage,
    ChatCreate,
    Chat,
)
from schemas.user import User
from database import get_db
import crud
from config import SECRET_KEY, ALGORITHM

router = APIRouter()


# Обработчик для отправки сообщения через вебсокет
@router.post("/api/send-message/")
async def send_message(
    message: RequestPersonalMessage | RequestGroupMessage,
    db: Session = Depends(get_db),
):
    payload = jwt.decode(message.token, SECRET_KEY, algorithms=[ALGORITHM])
    sender_id = payload.get("user_id")
    sender_username = crud.get_user(db, sender_id).username
    
    match message.type:
        case "personal-message":
            receiver_id = message.receiver_id

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
                sender_username=sender_username,
                receiver_id=receiver_id,
                # sender_username=sender_username, # в новой схеме этого нет
            ).model_dump()

            if sender_id != receiver_id:
                await sender.send_json(message_data)
                await receiver.send_json(message_data)
            else:
                await sender.send_json(message_data)

            return {"detail": "Message sent successfully."}
        case "group-message":
            message_data = ResponseGroupMessage(
                message=message.message,
                sender_id=sender_id,
                sender_username=sender_username,
                chat_id=message.chat_id,
            ).model_dump()

            chat_data = crud.get_chat(db, message.chat_id)

            if chat_data is None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Not Found",
                )
                
            recipient_users = chat_data.owners
            for recipient_user in recipient_users:
                recipient_user_socket = connected_clients.get(recipient_user.id)
                if recipient_user_socket:
                    await recipient_user_socket.send_json(message_data)
                    


@router.post("/api/chats/", response_model=Chat)
def create_chat_for_user(
    current_user: Annotated[User, Depends(get_current_active_user)],
    chat: ChatCreate,
    db: Session = Depends(get_db),
):
    return crud.create_chat(db=db, chat=chat, user=current_user, users_id=chat.users_id)

# Можно оставить для отлатки
# @router.get("/api/chats/", response_model=list[Chat])
# def read_chats(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
#     chats = crud.get_chats(db, skip=skip, limit=limit)
#     return chats


@router.get("/api/chats/{chat_id:int}", response_model=Chat)
def read_user(chat_id: int, current_user: Annotated[User, Depends(get_current_active_user)], db: Session = Depends(get_db)):
    user_chats_id = [chat.id for chat in current_user.chats]
    if chat_id not in user_chats_id:        
        raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied",
                )

    db_chat = crud.get_chat(db, chat_id=chat_id)
    if db_chat is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_chat
