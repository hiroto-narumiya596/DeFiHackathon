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


# 通信用データ
#コミットのときに使うデータ型
class AddCommitTaskData(BaseModel):
    taskid: str
    checkerid: str
    trierid: str

#タスクを追加するときに使うデータ型
class AddTaskData(BaseModel):
    taskname: str
    description: str
    checkerid: str
    missionspan: int
    taskinfoURL: str
    testinfoURL: str


#　サーバーサイドorチェーンサイド独自
class LoginData(BaseModel):
    user_type: str
    name: str
    password: str