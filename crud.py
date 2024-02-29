from sqlalchemy.orm import Session

import models, schemas


class User:
    @staticmethod
    def get_user(db: Session, user_id: int):
        return db.query(models.user.User).filter(models.user.User.id == user_id).first()

    @staticmethod
    def get_user_by_email(db: Session, email: str):
        return db.query(models.user.User).filter(models.user.User.email == email).first()

    @staticmethod
    def get_user_by_username(db: Session, username: str):
        return db.query(models.user.User).filter(models.user.User.username == username).first()

    @staticmethod
    def get_users(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.user.User).offset(skip).limit(limit).all()

    @staticmethod
    def create_user(db: Session, user: schemas.user.UserCreate, hash_function):
        hashed_password = hash_function(user.password)
        db_user = models.user.User(username=user.username, hashed_password=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
class Chat:    
    @staticmethod
    def create_chat(db: Session, chat: schemas.chat.ChatCreate, user_id: int):
        db_chat = models.chat.Chat(**chat.dict(), users_id=user_id)
        db.add(db_chat)
        db.commit()
        db.refresh(db_chat)
        return db_chat
    
    @staticmethod
    def get_chats(db: Session, skip: int = 0, limit: int = 100):
        return db.query(models.chat.Chat).offset(skip).limit(limit).all()