from sqlalchemy.orm import Session
from fastapi import HTTPException
import models

def react_to_post(db: Session, post_id: int, action: str):
    post = db.query(models.Post).filter(models.Post.id == post_id).first()
    if not post:
        raise HTTPException(status_code=404, detail="Post not found")
        
    if action == "like":
        post.likes += 1
    elif action == "dislike":
        post.dislikes += 1
    else:
        raise HTTPException(status_code=400, detail="Invalid reaction type")
        
    db.commit()
    db.refresh(post)
    return post

def react_to_comment(db: Session, comment_id: int, action: str):
    comment = db.query(models.Comment).filter(models.Comment.id == comment_id).first()
    if not comment:
        raise HTTPException(status_code=404, detail="Comment not found")
        
    if action == "like":
        comment.likes += 1
    elif action == "dislike":
        comment.dislikes += 1
    else:
        raise HTTPException(status_code=400, detail="Invalid reaction type")
        
    db.commit()
    db.refresh(comment)
    return comment
