"use client"
import { useContext } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"

import Header from "@/app/_components/ui_parts/header"
import Footer from "@/app/_components/ui_parts/footer"
import { UserStateContext } from "@/app/_common/hooks/statemanagement"
import { UserAuthState, Task, Checker } from "@/app/_common/types/datadefinition"
import ServiceIcon from "source/img/serviceicon1.svg"
import UserIcon from "source/img/usericon.svg"

const AccountPage_Checker = () => {
    const userstate_ = useContext(UserStateContext)    
    return(
        <div>
            <UserStateContext.Provider value={userstate_}>
                <Header {...userstate_.loginstate}/>
                <AccountPage_Checker_Body {...userstate_}/>
                <Footer/>
            </UserStateContext.Provider>
        </div>
    )
}

const AccountPage_Checker_Body = (userstate_: UserAuthState) => {
    const checkerstate_: Checker = userstate_.checkerstate;
    return(
        <div className="min-h-fit w-screen px-32 py-6">
            <div className="text-4xl font-bold">Account Information</div>
            <div className="flex space-x-8 my-5">
                <Image src={UserIcon} className="h-28 w-28 m-5" alt="UserIcon"/>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div>name</div>
                        <div className="text-xl font-medium">{checkerstate_.name}</div>
                    </div>
                    <div className="space-y-1">
                        <div>token</div>
                        <div className="text-xl font-medium">{checkerstate_.token}</div>
                    </div>
                </div>
            </div>
            <hr className="border-gray-400"></hr>
            <div className="mx-1 my-5 space-y-5">
                <div className="text-3xl font-semibold">List of Committed Tasks</div>
                <div className="space-y-3">
                    {userstate_.checkerstate.tasks.map((task)=>(
                        <TaskBlock {...task} key={task.id}/>
                    ))}
                </div>
            </div>
        </div>
    )
}

const TaskBlock = (task_: Task) => {

    const router = useRouter();

    const onSubmit = async () => {
        router.push('/checker/task/'+task_.id);
    }

    return (
        <button type="submit" onClick={() => onSubmit()}>
        <div className="taskbanner">
                <div className="flex space-x-8 ">
                    <Image src={ServiceIcon} className="w-36 h-36" alt="ServiceImage"/>
                    <div className="space-y-8 text-left">
                        <p className="text-2xl font-semibold text-green1">{task_.name}</p>
                        <p className="mt-2 flex-wrap text-clip">{task_.description}</p>
                    </div>
                </div>
        </div></button>
    )
}

export default AccountPage_Checker;