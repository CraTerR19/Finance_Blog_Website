from sqlalchemy.orm import Session
import models

def get_all_learn_modules(db: Session):
    return db.query(models.LearnModule).all()

def get_learn_module_by_id(db: Session, module_id: int):
    return db.query(models.LearnModule).filter(models.LearnModule.id == module_id).first()
