import { NextResponse } from "next/server";
import { NextApiRequest, NextApiResponse } from "next"; 
import { LoginState, Task, Trier, Checker, UserAuthState } from '@/app/_common/types/datadefinition';

//ダミーデータ
const task1: Task = {
    id:"Biufwe243Nknink", 
    name: "らくらく英単語",
    img: "",
    description: "らくらく英単語帳のP1~10までが範囲",
    checkerid: "InjeBi12ni1NJd",
    taskinfoURL: "",
    testinfoURL: "",
}

const task2: Task = {
    id:"Biufwe243NDjink", 
    name: "らくらく英単語",
    img: "",
    description: "らくらく英単語帳のP11~20までが範囲",
    checkerid: "InjeBi12ni1NJd",
    taskinfoURL: "",
    testinfoURL: "",
}

const task3: Task = {
    id:"siuGweV43NDjink", 
    name: "らくらく英単語",
    img: "",
    description: "らくらく英単語帳のP21~30までが範囲",
    checkerid: "InjeBi12ni1NJd",
    taskinfoURL: "",
    testinfoURL: "",
}

const trier1: Trier = {id:"Ugjw874NJboef", name:"Ryodai", token:3000, tasks:[task1]};
const trier1_password: string = "Ryodai1207";
const checker1: Checker = {id:"InjeBi12ni1NJd", name:"Ohmiya", tasks:[task1,task2,task3]};
const checker1_password: string = "Ohmiya1207";
const notlogin: LoginState = {loginstate: ""};
const login_checker: LoginState = {loginstate: "checker"};
const login_trier: LoginState = {loginstate: "trier"};
const trier_empty: Trier = {id: "", name: "", token:0, tasks: []};
const checker_empty: Checker = {id: "", name: "", tasks: []};



//API
//エラー処理はテキトーに書いた。
export async function POST(req: NextApiRequest , res: NextApiResponse<UserAuthState>) {
    console.log("ok_api")
    console.log(req.body.getReader().read())
    console.log(req.method)
    if(req.body.user_type == 'trier'){
        console.log("ok_api0trier")
        if(req.body.name == trier1.name && req.body.password == trier1_password){
            console.log("ok_api1")
            res.status(200).json({
                loginstate: login_trier,
                trierstate: trier1,
                checkerstate: checker_empty
            });
        }
        else{
            /*
            console.log("ok_api1")
            res.status(405).json({
                error: {
                  message: `Method ${req.method} Not Allowed1`,
                  statusCode: 405,
                },
              });*/
        }
    }
    else if(req.body.user_type == 'checker'){
        console.log("ok_api0checker")
        if(req.body.name == checker1.name && req.body.password == checker1_password){
            res.status(200).json({
                loginstate: login_checker,
                trierstate: trier_empty,
                checkerstate: checker1,
            });
        }
        else{
            /*
            res.status(405).json({
                error: {
                  message: `Method ${req.method} Not Allowed2`,
                  statusCode: 405,
                },
              });*/
        }
    }else{
        /*
        console.log("ok_api0else")
        res.status(405).json({
            
            error: {
              message: `Method Not Allowed3`,
              statusCode: 405,
            },
          });*/
    }
}