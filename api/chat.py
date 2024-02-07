import hashlib

from fastapi import APIRouter
from jose import jwt

from api.authorization import connected_clients
from schemas.chat import Message
from config import SECRET_KEY, ALGORITHM


router = APIRouter()


def generate_chat_id(user1_id, user2_id):
    sorted_ids = sorted([user1_id, user2_id])
    chat_id = hashlib.md5(f"{sorted_ids[0]}-{sorted_ids[1]}".encode()).hexdigest()
    return chat_id


# Обработчик для отправки сообщения через вебсокет
@router.post("/api/send-message/")
async def send_message(message: Message):
    payload = jwt.decode(message.token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")
    sender_user_id = message.reciver_user_id

    if not connected_clients.get(sender_user_id):
        return {"detail": "No connected clients for the chat."}
    if not connected_clients.get(user_id):
        return {"detail": "No connected clients for the chat."}

    # Отправляем сообщение клиенту
    client = connected_clients[user_id]
    other_client = connected_clients[sender_user_id]

    message_data = {
        "type": "message",
        "message": message.message,
        "sender_id": user_id,
        "reciver_id": sender_user_id,
    }
    if user_id != sender_user_id:
        await client.send_json(message_data)
        await other_client.send_json(message_data)
    else:
        await client.send_json(message_data)

    return {"detail": "Message sent successfully."}
