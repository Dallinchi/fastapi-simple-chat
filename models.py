from sqlalchemy import Boolean, Column, ForeignKey, Integer, String, Table
from sqlalchemy.orm import relationship

from database import Base


association_table = Table('association', Base.metadata,
    Column('user_id', Integer, ForeignKey('users.id')),
    Column('chat_id', Integer, ForeignKey('chats.id'))
)

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    disabled = Column(Boolean, default=False)
    chats = relationship("Chat", secondary=association_table, back_populates="owners")

class Chat(Base):
    __tablename__ = "chats"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    
    owners = relationship("User", secondary=association_table, back_populates="chats")