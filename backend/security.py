import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
import os
from dotenv import load_dotenv
from fastapi.security import OAuth2PasswordBearer


load_dotenv()


SECRET_KEY = os.getenv("ACCESS_TOKEN_SECRET", "fjaeiuweuu348ru2q3rj23rjew9fu3jrio")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRY = 30
REFRESH_TOKEN_EXPIRY=7


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")


# Password Hashing
def hash_password(password: str) -> str:

    bytes = password.encode('utf-8')

    salt = bcrypt.gensalt()

    hashed_password = bcrypt.hashpw(bytes, salt)

    return hashed_password.decode('utf-8')

def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))


# JWT tokens generation
def create_access_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(minutes=ACCESS_TOKEN_EXPIRY)

    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access"
    }

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def create_refresh_token(user_id: int):
    expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRY)

    to_encode = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh"
    }

    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_token(token: str):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])

        return payload
    except Exception as e:
        print(f"Token verify error: {e}")
        return None