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
    taskid: str
    trierid: str
    checkerid: str
    commitid: str
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


#ログインのときに使うデータ型
#キャッシュサーバ受信データ
class LoginData(BaseModel):
    user_type: str
    id: str

#キャッシュサーバ送信データ
class CurrentTasksCommitsRequests(BaseModel):
    tasks: List[Task]
    commits: List[Commit]
    requests: List[Request]

#タスク承認のときに使うデータ型
class CheckandApprovalData(BaseModel):
    requestid: str
    trierid: str
    checkerid: str
    approval: bool