"use client"
import { useContext, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {useForm, SubmitHandler } from 'react-hook-form';

import Header from "@/app/_components/ui_parts/header"
import Footer from "@/app/_components/ui_parts/footer"
import { UserStateContext } from "@/app/_common/hooks/statemanagement"
import { UserAuthState, Task, Checker, Request, Commit } from "@/app/_common/types/datadefinition"
import ServiceIcon from "source/img/serviceicon1.svg"
import UserIcon from "source/img/usericon.svg"
import { exit } from "process";



//タスク承認のときに使われる
type CheckandApprovalData = {
    requestid: string,
    commitid: string,
    trierid: string,
    checkerid: string,
    approval: boolean, //承認非承認
};

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
    const [isModalOpen, setModalOpen] = useState(false);
    console.log(userstate_)
    return(
        <div className="min-h-fit w-screen">
            {isModalOpen?
            <div className="absolute">
                <ModalComponent checkerstate_={checkerstate_} setModalOpen={setModalOpen}/>
            </div>:<></>}
            <div className="px-32 py-6">
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
                <TaskList {...userstate_}/>
                <button className="w-fit h-fit mb-5 px-4 py-2 rounded bg-green1" onClick={() => {setModalOpen(true)}}>
                    <div className="text-xl text-semibold text-white">新規タスク追加</div>
                </button>
                <hr className="border-gray-400"></hr>
                <RequestList {...userstate_}/>            
            </div>
        </div>
    )
}

const TaskList = (userstate_: UserAuthState) => {
    return (
        <div className="mx-1 my-5 space-y-5">
                <div className="text-3xl font-semibold">List of Tasks</div>
                <div className="space-y-3">
                    {userstate_.checkerstate.tasks.map((task)=>(
                        <TaskBlock {...task} key={task.id}/>
                    ))}
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
                        <p className="text-lg font-medium text-red-600">ミッション期間：  {task_.missionspan}日</p>
                        <p className="mt-2 flex-wrap text-clip">{task_.description}</p>
                    </div>
                </div>
        </div></button>
    )
}


//タスク追加のときに使われるモーダルコンポーネント。
//タスク追加のときにチェーンとはやり取りしない。
const ModalComponent = (props: {checkerstate_: Checker, setModalOpen: any}) =>{
    const router = useRouter()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
      } = useForm<Task>({
        defaultValues: {
            id: "",
            name: "",
            img: "",
            description: "",
            checkerid: "",
            missionspan: 0,
            taskinfoURL: "",
            testinfoURL: "",
        },
    });    

    const onSubmit: SubmitHandler<Task> = async (data: Task) => {
        try{
            //ここでタスク追加のAPIを実行する
            const response = await fetch('http://127.0.0.1:8000/addtask',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1:8000/addtask',
                }, 
                body: JSON.stringify(data),
            })
            const task: Task = await response.json(); //データの受け取り
            props.checkerstate_.tasks.push(task);
            props.setModalOpen(false);
        }
        catch(e){
            console.log(e)
        }
    }

    return(
        <div className="h-screen w-screen py-12 bg-black bg-opacity-20">
            <form className='px-28 py-12 space-y-6 w-fit m-auto rounded bg-white border-2 border-gray' method="post" onSubmit={handleSubmit(onSubmit)}>
                <div className="text-3xl text-green1 font-medium">
                    Add Task
                </div>
                <div className="space-y-4">
                    <div className='flex-col space-y-0.5'>
                        <div>Task Name</div>
                        <input className='h-10 border-2 border-gray' placeholder='taskname' {...register('name')}></input>
                    </div>
                    <div className='flex-col space-y-0.5'>
                        <div>Description</div>
                        <input className='h-10 border-2 border-gray' placeholder='description' {...register('description')}></input>
                    </div>
                    <div className='flex-col space-y-0.5'>
                        <div>Checker ID</div>
                        <input className='h-10 border-2 border-gray' placeholder='checkerid' {...register('checkerid')}></input>
                    </div>
                    <div className='flex-col space-y-0.5'>
                        <div>Mission Span</div>
                        <input className='h-10 border-2 border-gray' placeholder='missionspan' {...register('missionspan')}></input>
                    </div>
                    <div className='flex-col space-y-0.5'>
                        <div>Task Page</div>
                        <input className='h-10 border-2 border-gray' placeholder='taskinfoURL' {...register('taskinfoURL')}></input>
                    </div>
                    <div className='flex-col space-y-0.5'>
                        <div>Test Page URL</div>
                        <input className='h-10 border-2 border-gray' placeholder='testinfoURL' {...register('testinfoURL')}></input>
                    </div>
                </div>
                <div className="w-full flex justify-center border-2">
                    <button className='w-full px-6 py-2 rounded bg-green1' type='submit'>
                        <div className='m-auto text-white font-medium'>
                            Register Task
                        </div>
                    </button>
                </div>
            </form>
        </div>
    )
}

//承認申請のリスト表示コンポーネント
const RequestList = (userstate_: UserAuthState) => {
    return(
        <div className="mx-1 my-5 space-y-5">
            <div className="text-3xl font-semibold">List of Requests</div>
                <div className="space-y-3">
                    {userstate_.checkerstate.requests.map((request)=>(
                        <RequestBlock request_={request} userstate_={userstate_} key={request.id}/>
                    ))}
            </div>
        </div>
    )
}

const RequestBlock = (props:{request_: Request, userstate_: UserAuthState}) => {
    const router = useRouter();

    const data: CheckandApprovalData = {
        requestid: props.request_.id,
        commitid: props.request_.commitid,
        trierid: props.request_.trierid,
        checkerid: props.request_.checkerid,
        approval: false,
    }


    const onSubmit = async(e: any) => {
        console.log(e.target.id)

        //承認非承認を決める
        if(e.target.id == "Approval"){
            console.log(true)
            data.approval = true;
        }
        else if(e.target.id == "Denial"){
            data.approval = false;
        }

        /*
        for(let req of props.userstate_.checkerstate.requests){
            if (req.id == data.requestid){
                props.userstate_.checkerstate.requests.push(req);
                break;
            } 
        }
        for(let commit_ of props.userstate_.checkerstate.commits){
            if (commit_.id == props.request_.commitid){
                props.userstate_.checkerstate.commits.push(commit_);
                break;
            }
        }*/


        


        try{
            //チェーンのAPI
            //要件は以下の通り
            //チェーン上のコミットに、コミットID(props.request_commitid)でアクセス
            //アクセスしたコミットに、承認・非承認（isApprovalの結果）を渡す
            //チェッカーのトークン残高を取得する
            props.userstate_.chain.evaluateCommit(props.request_.commitid, data.approval);
            if(props.userstate_.chain.loadTokenBalance()==undefined){
                throw Error("error");
            }
            const token: number = Number(props.userstate_.chain.loadTokenBalance());
            props.userstate_.checkerstate.token = token;
            const response = await fetch('http://127.0.0.1:8000/checkandapproval',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1:8000/checkandapproval',
                }, 
                body: JSON.stringify(data),
            })
            const checker_data: any = await response.json(); //データの受け取り

            props.userstate_.checkerstate.commits = checker_data.commits;
            props.userstate_.checkerstate.requests = checker_data.requests;

            console.log(props.userstate_.checkerstate);
            router.push("/checker");            
        }
        catch(error){
            console.log(error);
        }
    }
    

    return(
        <div className="flex px-5 py-3 justify-between border-2 border-gray">
            <div className="space-x-4">
                <div>
                    {props.request_.date}
                </div>
                <div>
                    {props.request_.taskid}
                </div>        
                <div>
                    {props.request_.trierid}
                </div>                        
            </div>
            <div className="w-20 space-y-4">
                <button className="w-full py-1 rounded bg-green1" onClick={e => onSubmit(e)}>
                    <div  id="Approval" className="text-white font-medium">Approve</div>
                </button>
                <button className="w-full py-1 rounded bg-white border-2 border-green1" onClick={e => onSubmit(e)}>
                    <div id="Denial" className="text-green1 font-medium">Deny</div>
                </button>
            </div>
        </div>
    )
}



export default AccountPage_Checker;