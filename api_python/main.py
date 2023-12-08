from fastapi import FastAPI
import os
import traceback, time
#CORSエラー回避
from starlette.middleware.cors import CORSMiddleware

from datadifinition import LoginData, LoginState, Task, Trier, Checker, UserAuthState


# ダミーデータ
loginstate_null: LoginState = LoginState(loginstate="")
task_null: Task = Task(id="", name="", img="", description="", checkerid="", taskinfoURL="", testinfoURL="")
task1: Task = Task(id="Biufwe243Nknink", name="らくらく英単語", img="", description="らくらく英単語帳のP1~10までが範囲", checkerid="InjeBi12ni1NJd", taskinfoURL="", testinfoURL="")
task2: Task = Task(id="Biufwe243NDjink", name="らくらく英単語", img="", description="らくらく英単語帳のP11~20までが範囲", checkerid="InjeBi12ni1NJd", taskinfoURL="", testinfoURL="")
task3: Task = Task(id="siuGweV43NDjink", name="らくらく英単語", img="", description="らくらく英単語帳のP21~30までが範囲", checkerid="InjeBi12ni1NJd", taskinfoURL="", testinfoURL="")
trier_null: Trier = Trier(id="", name="", token=0, tasks=[])
trier1: Trier = Trier(id="Ugjw874NJboef", name="Ryodai", token=3000, tasks=[task1])
checker_null: Checker = Checker(id="", name="", tasks=[])
checker1: Checker = Checker(id="InjeBi12ni1NJd", name="Ohmiya1207", tasks=[task1, task2, task3])
trier1_password: str = "Ryodai1207"
checker1_password: str = "Ohmiya1207"

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=['*',], #フロントのオリジンからのアクセスを許可
    allow_credentials=True,  
    allow_methods=['*'],
    allow_headers=['*']  #ヘッダーにAccess-Control-Allow-Originが含まれるアクセスを許可
)

@app.post("/login")
def login(data: LoginData):
    responsedata: UserAuthState = UserAuthState(loginstate=loginstate_null,trierstate=trier_null, checkerstate=checker_null)
    try:
        if data.user_type == "trier":
            if data.name == trier1.name and data.password == trier1_password:
                responsedata.loginstate = LoginState(loginstate=data.user_type)
                responsedata.trierstate = trier1
        if data.user_type == "checker":
            if data.name == checker1.name and data.password == checker1_password:
                responsedata.loginstate = LoginState(loginstate=data.user_type)
                responsedata.checkerstate = checker1
        
        return responsedata.dict()
    except:
        print(traceback.format_exc())  
        return responsedata.dict()

