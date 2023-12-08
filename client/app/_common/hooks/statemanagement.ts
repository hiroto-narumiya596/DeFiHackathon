"use client"
import { useContext, createContext } from "react";
import { LoginState, Trier, Checker, UserAuthState } from "../types/datadefinition";

const defaultloginState: LoginState = {loginstate:"not login"} //not login、checker、trierのどれか
const defaulttrier: Trier = {id:"", name:"", token:0, tasks:[]}
const defaultchecker: Checker = {id:"", name:"", tasks:[]}
const defaultuserstate: UserAuthState = {loginstate: defaultloginState, trierstate: defaulttrier, checkerstate: defaultchecker}

//初期設定
export const UserStateContext = createContext<UserAuthState>(defaultuserstate);
/*
export const loginstate = createContext(defaultloginState);
export const trier = createContext([defaulttrier, (data: Trier)=>{}]);
export const checker = createContext([defaultchecker, (data: Checker)=>{}]);
*/
