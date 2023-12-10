"use client"
import { createContext } from "react";
import { LoginState, Trier, Checker, UserAuthState } from "../types/datadefinition";
import { Chain } from "@/app/api/api_chain/chain";

const chain: Chain = new Chain("");
const defaultloginState: LoginState = {loginstate:"not login"} //not login、checker、trierのどれか
const defaulttrier: Trier = {id:"", name:"", token:0, tasks:[], commits:[]}
const defaultchecker: Checker = {id:"", name:"", token:0, tasks:[], commits:[], requests:[]}
const defaultuserstate: UserAuthState = {chain:chain, loginstate: defaultloginState, trierstate: defaulttrier, checkerstate: defaultchecker}

//初期設定
export const UserStateContext = createContext<UserAuthState>(defaultuserstate);

