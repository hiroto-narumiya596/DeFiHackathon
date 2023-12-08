from pydantic import BaseModel
from typing import List

class LoginState(BaseModel):
    loginstate: str

class Task(BaseModel):
    id: str
    name: str
    img: str
    description: str
    checkerid: str
    taskinfoURL: str
    testinfoURL: str 

class Trier(BaseModel):
    id: str
    name: str
    token: int
    tasks: List[Task]

class Checker(BaseModel):
    id: str
    name: str
    token: int
    tasks: List[Task]

class UserAuthState(BaseModel):
    loginstate: LoginState
    trierstate: Trier
    checkerstate: Checker    

class LoginData(BaseModel):
    user_type: str
    name: str
    password: str