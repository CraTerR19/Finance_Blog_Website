from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base
import datetime

class Post(Base):
    __tablename__ = "posts"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    content = Column(Text)
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    
    comments = relationship("Comment", back_populates="post")

class Comment(Base):
    __tablename__ = "comments"
    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("posts.id"))
    author_name = Column(String(255))
    content = Column(Text)
    likes = Column(Integer, default=0)
    dislikes = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    post = relationship("Post", back_populates="comments")

class ContactSubmission(Base):
    __tablename__ = "contacts"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255))
    phone = Column(String(50))
    email = Column(String(255))
    preferred_contact = Column(String(50), nullable=True)
    review = Column(Text)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class Subscriber(Base):
    __tablename__ = "subscribers"
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True)
    subscribed_at = Column(DateTime, default=datetime.datetime.utcnow)

class LearnModule(Base):
    __tablename__ = "learn_modules"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), index=True)
    content = Column(Text) # Will contain the study material
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    questions = relationship("QuizQuestion", back_populates="module")

class QuizQuestion(Base):
    __tablename__ = "quiz_questions"
    id = Column(Integer, primary_key=True, index=True)
    module_id = Column(Integer, ForeignKey("learn_modules.id"))
    question_text = Column(Text)
    options = Column(String(500)) # Stored as JSON string
    correct_answer = Column(String(255))
    
    module = relationship("LearnModule", back_populates="questions")
