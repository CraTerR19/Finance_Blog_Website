from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class CommentBase(BaseModel):
    author_name: str
    content: str

class CommentCreate(CommentBase):
    post_id: int

class CommentResponse(CommentBase):
    id: int
    likes: int
    dislikes: int
    created_at: datetime
    class Config:
        orm_mode = True

class PostBase(BaseModel):
    title: str
    content: str

class PostCreate(PostBase):
    pass

class PostResponse(PostBase):
    id: int
    likes: int
    dislikes: int
    created_at: datetime
    comments: List[CommentResponse] = []
    class Config:
        orm_mode = True

class ReactionRequest(BaseModel):
    action: str # "like" or "dislike"

class ContactCreate(BaseModel):
    name: str
    phone: str
    email: str
    preferred_contact: Optional[str] = None
    review: str

class SubscriberCreate(BaseModel):
    email: str

class QuizQuestionBase(BaseModel):
    question_text: str
    options: str # Should be valid JSON string array
    correct_answer: str

class QuizQuestionResponse(QuizQuestionBase):
    id: int
    module_id: int
    class Config:
        orm_mode = True

class LearnModuleBase(BaseModel):
    title: str
    content: str

class LearnModuleResponse(LearnModuleBase):
    id: int
    created_at: datetime
    questions: List[QuizQuestionResponse] = []
    class Config:
        orm_mode = True
