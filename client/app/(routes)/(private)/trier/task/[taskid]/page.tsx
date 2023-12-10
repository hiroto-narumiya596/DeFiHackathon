"use client"
import { useContext } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation";
import {useForm, SubmitHandler } from 'react-hook-form';

import Header from "@/app/_components/ui_parts/header"
import Footer from "@/app/_components/ui_parts/footer"
import { UserStateContext } from "@/app/_common/hooks/statemanagement"
import { Task, Trier, Request, Commit } from "@/app/_common/types/datadefinition"
import ServiceIcon from "source/img/serviceicon1.svg"



const TaskPage = ({ params }: { params: {taskid: string }}) => {
    const userstate_ = useContext(UserStateContext);
    const router = useRouter()
    const task_: Task = {id:params.taskid, name:"", img:"", description:"", checkerid:"", missionspan:0, taskinfoURL:"", testinfoURL:""};
    const commit_: Commit = {id:"", taskid:params.taskid, trierid:"", checkerid:"", bettoken:0, date:0};

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

    for(let commit of userstate_.trierstate.commits){
        if(commit.taskid == params.taskid){
            commit_.id = commit.id;
            commit_.trierid = commit.trierid;
            commit_.checkerid = commit.checkerid;
            commit_.bettoken = commit.bettoken;
            commit_.date = commit.date;
        }
    }

    //タスク承認申請ボタン
    const onSubmit = async() => {
        const data: Request = {id:"", commitid:commit_.id, taskid: task_.id, trierid:userstate_.trierstate.id, checkerid:task_.checkerid, date:0 }
        try{
            const response = await fetch('http://127.0.0.1:8000/requestapproval',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1:8000/requestapproval',
                }, 
                body: JSON.stringify(data),
            })

            const res_data: Trier = await response.json();
            userstate_.trierstate = res_data
            router.push("/trier/account")
            console.log("Yes")
        }
        catch(e){
            console.log(e);
        }

    }

    return(
        <div>
            <Header {...userstate_.loginstate}/>
            <div className="w-screen h-screen px-32 py-6">
                <div className="flex my-4 space-x-8">
                    <Image src={ServiceIcon} className="w-48 h-48" alt="serviceicon"/>
                    <div className="space-y-8">
                        <div className="text-5xl font-bold text-green1">{task_.name}</div>
                        <div className="flex ml-2 text-2xl text-red-600 space-x-4">
                            <div className="font-medium">deadline : </div>
                            <div className="font-semibold">{task_.missionspan} days</div>
                        </div>
                        <button className="px-4 py-3 rounded bg-green1" type="button" onClick={onSubmit}>
                            <div className='m-auto text-white font-medium'>
                                <a href={task_.testinfoURL} target="_blank">Request Approval</a>
                            </div>
                        </button>
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
                </div>
            </div>
            <Footer/>
        </div>
    )
}

//https://nextjs.org/docs/app/building-your-application/routing/dynamic-routes

export default TaskPage;