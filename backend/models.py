from sqlalchemy.sql import func
from sqlalchemy.orm import Mapped, mapped_column, relationship
from sqlalchemy import ForeignKey, Text, DateTime, JSON
from database import Base
from typing import List, Any
from datetime import datetime


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    email: Mapped[str] = mapped_column(unique=True, index=True, nullable=False)
    hashed_password: Mapped[str] = mapped_column(nullable=False)

    posts: Mapped[List["TILPost"]] = relationship(back_populates="owner")


class TILPost(Base):
    __tablename__ = "til_posts"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    title: Mapped[str] = mapped_column(nullable=False)
    short_note: Mapped[str] = mapped_column()

    #AI generated fields
    related_topics: Mapped[Any] = mapped_column(JSON, nullable=True)
    web_links: Mapped[Any] = mapped_column(JSON, nullable=True)
    keywords: Mapped[Any] = mapped_column(JSON, nullable=True)


    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    owner_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    
    owner: Mapped["User"] = relationship(back_populates="posts")


class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[int] = mapped_column(primary_key=True, index=True)
    token: Mapped[str] = mapped_column(unique=True, index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"))
    expires_at: Mapped[datetime] = mapped_column(DateTime)

    owner = relationship("User")