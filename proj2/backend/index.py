from fastapi import FastAPI

app = FastAPI()


@app.get("/api")
def read_root():
    return {"The server is running": "Hello World"}
