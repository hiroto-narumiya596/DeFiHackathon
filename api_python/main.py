from fastapi import FastAPI
import os
import traceback, time
from typing import List
import uuid
#CORSエラー回避
from starlette.middleware.cors import CORSMiddleware

from datadifinition import LoginData, LoginState, Task, Trier, Checker, UserAuthState, AddTaskData, Request, Commit, CheckandApprovalData


# ダミーデータ
taskinfoURL: str = "https://note.com/preview/nb4d6984e61fc?prev_access_key=80574b57237f7e28be15e33a0b066282"
loginstate_null: LoginState = LoginState(loginstate="")
task_null: Task = Task(id="", name="", img="", description="", checkerid="", missionspan=0, taskinfoURL="", testinfoURL="")
trier_null: Trier = Trier(id="", name="", token=0, tasks=[], commits=[])
checker_null: Checker = Checker(id="", name="", token=0, tasks=[], commits=[], requests=[])
commit1: Commit = Commit(id="", taskid="Biufwe243Nknink", checkerid="InjeBi12ni1NJd", trierid="Ugjw874NJboef", date=0, bettoken=30)
task1: Task = Task(id="Biufwe243Nknink", name="らくらく英単語", img="", description="らくらく英単語帳のP1~10までが範囲", checkerid="InjeBi12ni1NJd", missionspan=2, taskinfoURL=taskinfoURL, testinfoURL="https://docs.google.com/forms/d/e/1FAIpQLScn-lH0GxFSZOiNjYqBogF5ozXzhb40lxvZyqIDjuQWdqY1Zw/viewform")
task2: Task = Task(id="Biufwe243NDjink", name="らくらく英単語", img="", description="らくらく英単語帳のP11~20までが範囲", checkerid="InjeBi12ni1NJd", missionspan=0, taskinfoURL=taskinfoURL, testinfoURL="https://docs.google.com/forms/d/e/1FAIpQLSeYhiqxOrVglvNBfbiYkeYtwy00JU_aOWcgUqC0bY_trm31sw/viewform")
task3: Task = Task(id="siuGweV43NDjink", name="らくらく英単語", img="", description="らくらく英単語帳のP21~30までが範囲", checkerid="InjeBi12ni1NJd", missionspan=0, taskinfoURL=taskinfoURL, testinfoURL="https://docs.google.com/forms/d/e/1FAIpQLSfuW-aFOL9NEZY7F3l2OlWQH5RjvNzrYppJjhnb2JQJIcwPcA/viewform")
trier1: Trier = Trier(id="Ugjw874NJboef", name="Ryodai", token=3000, tasks=[task1], commits=[commit1])
checker1: Checker = Checker(id="InjeBi12ni1NJd", name="Ohmiya", token=10000, tasks=[task1, task2, task3], commits=[commit1], requests=[])
responsedata: UserAuthState = UserAuthState(loginstate=loginstate_null,trierstate=trier_null, checkerstate=checker_null)
logindata_trier1: LoginData = LoginData(user_type="trier",name="Ryodai",password="Ryodai1207")
logindata_checker1: LoginData = LoginData(user_type="checker",name="Ohmiya",password="Ohmiya1207")
checker1_tasks: List[Task] = [task1,task2,task3]


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'], #フロントのオリジンからのアクセスを許可
    allow_credentials=True,  
    allow_methods=['*'],
    allow_headers=['*']  #ヘッダーにAccess-Control-Allow-Originが含まれるアクセスを許可
)

# ログインのデータベースサーバorチェーンサイドの処理
@app.post("/login")
def login(data: LoginData):
    try:
        if data.user_type == "trier":
            if data.name == logindata_trier1.name and data.password == logindata_trier1.password:
                responsedata.loginstate = LoginState(loginstate=data.user_type)
                responsedata.trierstate = trier1
        if data.user_type == "checker":
            if data.name == logindata_checker1.name and data.password == logindata_checker1.password:
                responsedata.loginstate = LoginState(loginstate=data.user_type)
                responsedata.checkerstate = checker1
        
        return responsedata.dict()
    except:
        print(traceback.format_exc())  
        return responsedata.dict()


# トライヤーがタスクをコミットする時の処理
@app.post("/addcommittask")
def committask(data: Commit):
    try:
        commit_: Commit = data
        commit_.id = str(uuid.uuid4())

        if data.checkerid == "InjeBi12ni1NJd":
            for task in checker1_tasks:
                if task.id == data.taskid:
                    trier1.tasks.append(task)
                    trier1.commits.append(commit_)
                    checker1.commits.append(commit_)
                    trier1.token = trier1.token - data.bettoken
                    return trier1.dict()
    except:
        print(traceback.format_exc())  
        return trier_null.dict()


# チェッカーがタスクを追加する時の処理
@app.post("/addtask")
def addtask(data: AddTaskData):
    try:
        if data.checkerid == "InjeBi12ni1NJd":
            task: Task = Task(id=str(uuid.uuid4()), name=data.taskname, img="", description=data.description, checkerid=data.checkerid, missionspan=data.missionspan, taskinfoURL=data.taskinfoURL, testinfoURL=data.testinfoURL)
            checker1_tasks.append(task)
            checker1.tasks = checker1_tasks
            return checker1
    except:
        print(traceback.format_exc())
        return checker_null.dict()       
    

# コミット申請
@app.post("/requestapproval")
def requestapproval(data: Request):
    try:
        if data.trierid == trier1.id:
            for task in trier1.tasks:
                if task.id == data.taskid:
                    trier1.tasks.remove(task)
            for commit in trier1.commits:
                if commit.id == data.commitid:
                    trier1.commits.remove(commit)
            if  data.checkerid == checker1.id:
                checker1.requests.append(data)
            
            print("requestapproval")
            return trier1.dict()
    except:
        print(traceback.format_exc())
        return trier1.dict()
    
#コミット承認
@app.post("/checkandapproval")
def checkandapproval(data: CheckandApprovalData):
    try:
        if data.checkerid == checker1.id:
            for request_ in checker1.requests:
                if data.requestid == request_.id:
                    targetrequest = request_
                    for commit_ in checker1.commits:
                        if commit_.id == targetrequest.commitid:
                            targetcommit = commit_
                            checker1.commits.remove(targetcommit)
                            checker1.requests.remove(targetrequest)                            
                            if data.approval == True:
                                trier1.token += targetcommit.bettoken * 2
                                checker1.token += targetcommit.bettoken * 0.3
                            else:
                                checker1.token += targetcommit * 0.1

        
        return checker1.dict()
    except:
        print(traceback.format_exc())
        return checker1.dict()