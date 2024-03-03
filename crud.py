from sqlalchemy.orm import Session

from schemas.user import UserCreate, User
from schemas.chat import ChatCreate, RequestMessage
import models

def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: UserCreate, hash_function):
    hashed_password = hash_function(user.password)
    db_user = models.User(username=user.username, hashed_password=hashed_password)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def get_chat(db: Session, chat_id: int):
    return db.query(models.Chat).filter(models.Chat.id == chat_id).first()


def get_chats(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Chat).offset(skip).limit(limit).all()


def create_chat(db: Session, chat: ChatCreate, user:User, users_id: list[int]):
    db_chat = models.Chat(
        title=chat.title,
    )
    users_id.append(user.id)
    users_id = list(set(users_id))
    for user_id in users_id:
        user = get_user(db, user_id)
        if user:
            db_chat.owners.append(user)
        
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat


def create_message(db: Session, message: RequestMessage):
    db_message = models.Message(
        message=message.message,
        chat_id=message.chat_id,
        user_id=message.sender_id,
    )
        
    db.add(db_message)
    db.commit()
    db.refresh(db_message)
    return db_message


def get_messages(db: Session, chat_id: int, skip: int = 0, limit: int = 100):
    return db.query(models.Message).filter(models.Message.chat_id == chat_id).order_by(models.Message.id.desc()).offset(skip).limit(limit).all()