"use client"
import { useContext } from "react"
import Image from "next/image"

import Header from "@/app/_components/ui_parts/header"
import Footer from "@/app/_components/ui_parts/footer"
import TaskPage from "../task/page"
import { UserStateContext } from "@/app/_common/hooks/statemanagement"
import { UserAuthState, Task, Trier, Checker } from "@/app/_common/types/datadefinition"
import ServiceIcon from "source/img/serviceicon1.svg"

const AccountPage_Trier = () => {
    const userstate_ = useContext(UserStateContext)
    return(
        <div>
            <UserStateContext.Provider value={userstate_}>
                <Header {...userstate_.loginstate}/>
                <AccountPage_Trier_Body {...userstate_}/>
                <Footer/>
            </UserStateContext.Provider>
        </div>
    )
}

const AccountPage_Trier_Body = (userstate_: UserAuthState) => {
    const trierstate_ = userstate_.trierstate;
    return(
        <div className="h-screen w-screen px-32 py-10">
            <div className="text-3xl font-bold">Account Information</div>
            <div>
                <div>
                    <div>name</div>
                    <div>{trierstate_.name}</div>
                </div>
                <div>
                    <div>token</div>
                    <div>{trierstate_.token}</div>
                </div>
            </div>
            <hr className="border-gray-400"></hr>
            <div>
                <div>List of Committed Tasks</div>
                <div>
                    {userstate_.trierstate.tasks.map((task)=>(
                        <TaskBlock {...task} key={task.id}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

const TaskBlock = (task_: Task) => {
    return (
        <div className="h-32 w-96 py-3 px-1 border-2 border-red-600">
            <div className="flex">
                <Image src={ServiceIcon} className="w-20 h-20" alt="ServiceImage"/>
                <div>
                    <p className="text-xl">{task_.name}</p>
                    <p>{task_.checkerid}</p>
                </div>
            </div>
            <div className="flex-wrap text-clip">{task_.description}</div>
        </div>
    )
}

export default AccountPage_Trier;