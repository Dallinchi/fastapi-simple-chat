import hashlib

from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext

from config import SECRET_KEY, ALGORITHM


pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

router = APIRouter()

def generate_chat_id(user1_id, user2_id):
    sorted_ids = sorted([user1_id, user2_id])
    chat_id = hashlib.md5(f"{sorted_ids[0]}-{sorted_ids[1]}".encode()).hexdigest()
    return chat_id

# Список подключенных клиентов
connected_clients: dict = {}

# Обработчик для подключения к веб-сокету
@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, token, other_user_id: int):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")
    chat_id = generate_chat_id(user_id, other_user_id)

    await websocket.accept()

    if not connected_clients.get(chat_id):
        connected_clients[chat_id] = [websocket]
    else:
        connected_clients[chat_id].append(websocket)

    try:
        while True:
            # data = await websocket.receive_text()
            data = await websocket.receive_json()
            # Отправляем полученное сообщение всем клиентам
            if data["type"] == "message":
                for client in connected_clients[chat_id]:
                    message_data = {"type": "message", "message": data["message"]}
                    
                    await client.send_json(message_data)
    except WebSocketDisconnect:
        # Удаляем клиента из списка при отключении
        connected_clients[chat_id].remove(websocket) 


# Обработчик для отправки сообщения через вебсокет
@router.post("/send-message/")
async def send_message(token: str, other_user_id: int, message: str):
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    user_id = payload.get("user_id")
    chat_id = generate_chat_id(user_id, other_user_id)

    if not connected_clients.get(chat_id):
        return {"detail": "No connected clients for the chat."}

    # Отправляем сообщение всем клиентам
    for client in connected_clients[chat_id]:
        # await client.send_text(f"Сообщение получено: {other_user_id} {message}")
        message_data = {"type": "message", "message": message}
        await client.send_json(message_data)

    return {"detail": "Message sent successfully."}
