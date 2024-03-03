from typing import Annotated, Union

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt

from api.authorization import connected_clients, get_current_active_user
from models import Chat
from schemas.chat import (
    RequestMessage,
    ResponseMessage,
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
    message: RequestMessage,
    db: Session = Depends(get_db),
):
    payload = jwt.decode(message.token, SECRET_KEY, algorithms=[ALGORITHM])
    sender_id = payload.get("user_id")
    sender_username = crud.get_user(db, sender_id).username
    chat_data = crud.get_chat(db, message.chat_id)
    
    message_data = ResponseMessage(
        message_type=message.message_type,
        message=message.message,
        sender_id=sender_id,
        sender_username=sender_username,
        chat_id=message.chat_id,
    ).model_dump()

    if chat_data is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Not Found",
        )
    
    crud.create_message(db, message)

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


@router.get('/api/messages/{chat_id:int}')
def get_messages(chat_id:int,  current_user: Annotated[User, Depends(get_current_active_user)], skip: int, limit: int, db: Session = Depends(get_db)):
    user_chats_id = [chat.id for chat in current_user.chats]
    if chat_id not in user_chats_id:        
        raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Permission denied",
                )
        
    messages = crud.get_messages(db, chat_id, skip=skip, limit=limit)
    return messages