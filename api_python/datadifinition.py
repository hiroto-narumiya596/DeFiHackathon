from pydantic import BaseModel
from typing import List

# クライアントサイドと共通
class LoginState(BaseModel):
    loginstate: str

class Task(BaseModel):
    id: str
    name: str
    img: str
    description: str
    missionspan: int
    checkerid: str
    taskinfoURL: str
    testinfoURL: str 

class Commit(BaseModel):
    id: str
    taskid: str
    checkerid: str
    trierid: str
    date: int
    bettoken: float


class Request(BaseModel):
    id: str
    commitid: str
    taskid: str
    trierid: str
    checkerid: str
    date: int

class Trier(BaseModel):
    id: str
    name: str
    token: float
    tasks: List[Task]
    commits: List[Commit]

class Checker(BaseModel):
    id: str
    name: str
    token: float
    tasks: List[Task]
    commits: List[Commit]
    requests: List[Request]


class UserAuthState(BaseModel):
    loginstate: LoginState
    trierstate: Trier
    checkerstate: Checker    


# 通信用データ
#タスクを追加するときに使うデータ型
class AddTaskData(BaseModel):
    taskname: str
    description: str
    checkerid: str
    missionspan: int
    taskinfoURL: str
    testinfoURL: str

#タスク承認のときに使うデータ型
class CheckandApprovalData(BaseModel):
    requestid: str
    trierid: str
    checkerid: str
    approval: bool

#サーバーサイドorチェーンサイド独自
class LoginData(BaseModel):
    user_type: str
    name: str
    password: str