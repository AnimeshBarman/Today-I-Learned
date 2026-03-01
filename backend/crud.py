from sqlalchemy.orm import Session
from . import security, models, schemas, ai_service
from datetime import timezone, datetime




def login(db: Session, data: schemas.UserCreate):

    existing_user = db.query(models.User).filter(models.User.email == data.email).first()

    if not existing_user:
        raise ValueError("User not logged in, pls sign up first..!")
        
    verify_pwd = security.verify_password(data.password, existing_user.hashed_password)

    if not verify_pwd:
        raise ValueError("Invalid password..!")
    
    return existing_user


def get_user_by_email(db:Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()



def create_user(db: Session, data: schemas.UserCreate):

    hashed_pwd = security.hash_password(data.password)

    db_user = models.User(
        email = data.email,
        hashed_password = hashed_pwd
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user




def store_refresh_token(db: Session, token: str, user_id: int, expires_at: datetime):

    db_token = models.RefreshToken(
        token = token,
        user_id = user_id,
        expires_at = expires_at
    )

    db.add(db_token)
    db.commit()

    return db_token


def get_refresh_token(db: Session, token: str):

    return db.query(models.RefreshToken).filter(models.RefreshToken.token == token).first()


def revoke_token(db: Session, token: str):

    db_token = db.query(models.RefreshToken).filter(models.RefreshToken.token == token).first()

    if db_token:
        db.delete(db_token)
        db.commit()

    return True




def create_post(db: Session, data: schemas.TILPostCreate, user_id: int):
    
    # user = db.query(models.User).filter(models.User.id == user_id).first()
    # if not user:
    #     raise ValueError("User not found..!")
    
    results = ai_service.generate_ai_content(data.title)

    if not results or "error" in results:
        raise ValueError("Error while generating ai response..!")
    
    new_post = models.TILPost(
        title = data.title,
        short_note = data.short_note,
        related_topics = results.get("related_topics"),
        web_links = results.get("web_links"),
        keywords = results.get("keywords"),
        owner_id = user_id
    )
    
    db.add(new_post)
    db.commit()
    db.refresh(new_post)
    return new_post


def get_user_post(db: Session, user_id: int):
    return db.query(models.TILPost).filter(models.TILPost.owner_id == user_id).all()