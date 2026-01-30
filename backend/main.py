from fastapi import FastAPI

app = FastAPI(title="Today I Learned API..")

@app.get("/")
def root():
    return {"Message": "Welcome to TIL App.."}