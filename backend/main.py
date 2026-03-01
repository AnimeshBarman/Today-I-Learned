from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from . import schemas, crud, security, database
from datetime import timedelta, timezone, datetime




app = FastAPI(title="Today I Learned API..")


app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def root():
    return {"Message": "Welcome to TIL App.."}


@app.post("/signup")
def sign_up(data: schemas.UserCreate, db: Session = Depends(database.get_db)):

    existing_user = crud.get_user_by_email(db, email= data.email)

    if existing_user:
        raise HTTPException(status_code=400, detail="User already exist, pls log in..!")

    return crud.create_user(db, data=data)


@app.post("/login")
def login(data: schemas.UserLogin, db: Session = Depends(database.get_db)):

    user = crud.get_user_by_email(db, email= data.email)

    if not user or not security.verify_password(data.password, user.hashed_password):
        raise HTTPException(
            status_code= status.HTTP_401_UNAUTHORIZED,
            detail="Wrong email/password..!"
        )
    
    access_token = security.create_access_token(user_id=user.id)
    refresh_token = security.create_refresh_token(user_id=user.id)

    expiry_time = security.datetime.now(security.timezone.utc) + timedelta(days=7)

    crud.store_refresh_token(db, token=refresh_token, user_id=user.id, expires_at=expiry_time)

    return {
        "acsess_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
        "user_id": user.id
    }


def get_current_user(token: str = Depends(security.oauth2_scheme), db: Session = Depends(database.get_db)):

    payload = security.verify_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid token type..!")
    
    user_id = payload.get("sub")

    if not user_id: 
        raise HTTPException(status_code=404, detail="User id not found..!")
    
    return int(user_id)


@app.post("/create-post")
def create_post(
    data: schemas.TILPostCreate, 
    db: Session = Depends(database.get_db), 
    current_user_id: int = Depends(get_current_user)
):
    

    new_post = crud.create_post(
        db,
        data=data,
        user_id=current_user_id
    )

    return {"message": "success!", "data": new_post}



@app.get("/get-posts")
def get_all_posts(
    db: Session = Depends(database.get_db),
    current_user_id: int = Depends(get_current_user)
):
    
    posts = crud.get_user_post(db, user_id=current_user_id)

    return posts


@app.post("/refresh")
def refresh_access_token(
    data: schemas.TokenRefresh,
    db: Session = Depends(database.get_db),
):
    db_token = crud.get_refresh_token(db, token=data.refresh_token)

    if not db_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token..!"
        )

    if db_token.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        crud.revoke_token(db, token=data.refresh_token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired, pls login again..!"
        )
    
    new_access_token = security.create_access_token(user_id=db_token.user_id)

    return {
        "access_token": new_access_token,
        "refresh_token": data.refresh_token,
        "token_type": "bearer"
    }



