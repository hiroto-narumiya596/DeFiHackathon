"use client"
import { useContext } from "react"
import Image from "next/image"

import Header from "@/app/_components/ui_parts/header"
import Footer from "@/app/_components/ui_parts/footer"
import { UserStateContext } from "@/app/_common/hooks/statemanagement"
import { Task } from "@/app/_common/types/datadefinition"
import ServiceIcon from "source/img/serviceicon1.svg"

const TaskPage = ({ params }: { params: {taskid: string }}) => {
    const userstate_ = useContext(UserStateContext);
    const task_: Task = {id:"", name:"", img:"", description:"", checkerid:"", missionspan:0, taskinfoURL:"", testinfoURL:""};

    for(let task of userstate_.trierstate.tasks){
        if(task.id == params.taskid){
            task_.name = task.name;
            task_.img = task.img;
            task_.description = task.description;
            task_.checkerid = task.checkerid;
            task_.missionspan = task.missionspan
            task_.taskinfoURL = task.taskinfoURL;
            task_.testinfoURL = task.testinfoURL;
        }
    }

    return(
        <div>
            <Header {...userstate_.loginstate}/>
            <div className="w-screen h-screen px-32 py-6">
                <div className="flex my-4 space-x-8">
                    <Image src={ServiceIcon} className="w-48 h-48" alt="serviceicon"/>
                    <div className="space-y-24">
                    <div className="text-5xl font-bold text-green1">{task_.name}</div>
                    <div className="flex ml-2 text-3xl text-gray1 space-x-4">
                        <div className="font-medium">CheckerID : </div>
                        <div className="font-semibold">{task_.checkerid}</div>
                    </div>
                    </div>
                </div>
                <hr className="border-gray-400"></hr>
                <div className="my-4 space-y-5">
                    <div className="text-3xl font-semibold">Information</div>
                    <div className="space-y-1">
                        <div className="text-2xl medium">Description</div>
                        <div className="text-lg ">{task_.description}</div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl medium">TaskURL</div>
                        <div className="text-lg "><a>{task_.taskinfoURL}</a></div>
                    </div>
                    <div className="space-y-1">
                        <div className="text-2xl medium">TestURL</div>
                        <div className="text-lg "><a>{task_.testinfoURL}</a></div>
                    </div>                                        
                </div>
            </div>
            <Footer/>
        </div>
    )
}

//https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

export default TaskPage;