//このあたりは工夫が可能だが、大変なのでやらない

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
    taskinfoURL: string,
    testinfoURL: string,    
};

export type Trier = {
    id: string,
    name: string,
    token: number,
    tasks: Task[],
};

export type Checker = {
    id: string,
    name: string,
    token: number,
    tasks: Task[],
};

export type UserAuthState = {
    loginstate: LoginState,
    trierstate: Trier,
    checkerstate: Checker,
}