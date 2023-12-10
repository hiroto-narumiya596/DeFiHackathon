//このあたりは工夫が可能だが、大変なのでやらない
import { Chain } from "@/app/api/api_chain/chain";


//クライアントサイドで使うデータを定義
export type LoginState = {
    loginstate: string
}

export type Task = {
    id: string,
    name: string,
    img: string,
    description: string,
    checkerid: string,
    missionspan: number,
    taskinfoURL: string,
    testinfoURL: string,    
};

export type Commit = {
    id: string,
    taskid: string,
    checkerid: string,
    trierid: string,
    date: number,
    bettoken: number,
}

export type Request = {
    id: string,
    taskid: string,
    trierid: string,
    checkerid: string,
    commitid: string,
    date: number, 
}

export type Trier = {
    id: string,
    name: string,
    token: number,
    tasks: Task[],
    commits: Commit[],
};

export type Checker = {
    id: string,
    name: string,
    token: number,
    tasks: Task[],
    commits: Commit[],
    requests: Request[]
};

export type UserAuthState = {
    chain: Chain,
    loginstate: LoginState,
    trierstate: Trier,
    checkerstate: Checker,
}