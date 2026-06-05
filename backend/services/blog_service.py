from sqlalchemy.orm import Session
from models import Post

def update_post_content(db: Session, post_id: int, title: str, content: str):
    post = db.query(Post).filter(Post.id == post_id).first()
    if post:
        post.title = title
        post.content = content
        db.commit()
        db.refresh(post)
    return post
