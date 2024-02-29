from sqlalchemy.orm import Session

from schemas.user import UserCreate
from schemas.chat import ChatCreate
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

def get_chats(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Chat).offset(skip).limit(limit).all()


def create_chat(db: Session, chat: ChatCreate, users_id: list[int]):
    db_chat = models.Chat(**chat.dict())
    for id in users_id:
        user = get_user(db, id)
        print('Пользоветель -> ', user.username)
        db_chat.owners.append(user)
        print(db_chat.owners)
        
    db.add(db_chat)
    db.commit()
    db.refresh(db_chat)
    return db_chat