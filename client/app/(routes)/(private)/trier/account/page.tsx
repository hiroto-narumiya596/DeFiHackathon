"use client"
import { useContext, useState } from "react"
import Image from "next/image"
import { useRouter } from "next/navigation"
import {useForm, SubmitHandler } from 'react-hook-form';

import Header from "@/app/_components/ui_parts/header"
import Footer from "@/app/_components/ui_parts/footer"
import { UserStateContext } from "@/app/_common/hooks/statemanagement"
import { UserAuthState, Task, Trier, Commit } from "@/app/_common/types/datadefinition"
import ServiceIcon from "source/img/serviceicon1.svg"
import UserIcon from "source/img/usericon.svg"
import { Chain } from "@/app/api/api_chain/chain";




const AccountPage_Trier = () => {
    const userstate_ = useContext(UserStateContext)
    return(
        <div>
            <UserStateContext.Provider value={userstate_}>
                <Header {...userstate_.loginstate}/>
                <div>
                   <AccountPage_Trier_Body {...userstate_} />
                </div>
                <Footer/>
            </UserStateContext.Provider>
        </div>
    )
}

const AccountPage_Trier_Body = (userstate_: UserAuthState) => {

    const [isModalOpen, setModalOpen] = useState(false);
    return(
        <div>
            {isModalOpen?<div className="absolute"><ModalComponent userstate_={userstate_} setModalOpen={setModalOpen}/></div>:<></>}
        <div className="min-h-fit w-screen px-32 py-6">
            <div className="text-4xl font-bold">Account Information</div>
            <div className="flex space-x-8 my-5">
                <Image src={UserIcon} className="h-28 w-28 m-5" alt="UserIcon"/>
                <div className="space-y-4">
                    <div className="space-y-1">
                        <div>name</div>
                        <div className="text-xl font-medium">{userstate_.trierstate.name}</div>
                    </div>
                    <div className="space-y-1">
                        <div>token</div>
                        <div className="text-xl font-medium">{userstate_.trierstate.token}</div>
                    </div>
                </div>
            </div>
            <hr className="border-gray-400"></hr>
            <TaskList {...userstate_}/>
            <button className="w-fit h-fit px-4 py-2 rounded bg-green1" onClick={() => {setModalOpen(true)}}>
                <div className="text-xl text-semibold text-white">新規コミット追加</div>
            </button>
        </div>
        </div>
    )
}

const TaskList = (userstate_: UserAuthState) => {
    return (
        <div className="mx-1 my-5 space-y-5">
                <div className="text-3xl font-semibold">List of Committed Tasks</div>
                <div className="space-y-3 justify-between">
                    {userstate_.trierstate.tasks.map((task)=>(
                        <TaskBlock {...task} key={task.id}/>
                    ))}
                </div>
            </div>
    )
}

const TaskBlock = (task_: Task) => {

    const router = useRouter();

    const onSubmit = async () => {
        router.push('/trier/task/'+task_.id);
    }

    return (
        <button type="submit" onClick={() => onSubmit()}>
        <div className="taskbanner">
                <div className="flex space-x-8 ">
                    <Image src={ServiceIcon} className="w-36 h-36" alt="ServiceImage"/>
                    <div className="space-y-8 text-left">
                        <p className="text-2xl font-semibold text-green1">{task_.name}</p>
                        <p className="text-lg font-medium text-red-600">あと {task_.missionspan}日</p>
                        <p className="mt-2 flex-wrap text-clip">{task_.description}</p>
                    </div>
                </div>
        </div></button>
    )
}


//コミット用のモーダル
const ModalComponent = (props: {userstate_: UserAuthState, setModalOpen: any}) => {
    const router = useRouter()

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
      } = useForm<Commit>({
        defaultValues: {
            id: '',
            taskid : '',
            checkerid : '',
            trierid: props.userstate_.trierstate.id,
            bettoken: 0,
            date: 0,
        },
    });    

    const onSubmit: SubmitHandler<Commit> = async (data: Commit) => {
        console.log(data)
        try{
            //チェーンのAPI
            //以下の3つの要件を満たした、コミットを行う関数を定義（さしあたり、結果だけ渡す）
            //コミット固有のIDを取得する
            //タスクIDを使ってチェーンから、チェッカーIDを取得する
            //コミット後のトークン残高を取得する
            if (props.userstate_.chain.loadLastCommitmentId()==undefined){
                throw Error('error');
            }
            const commitID: string = String(props.userstate_.chain.loadLastCommitmentId());
            if (Chain.getCheckerIdFromTaskId(data.taskid)==undefined){
                throw Error('error');
            }            
            const checkerID: string = String(Chain.getCheckerIdFromTaskId(data.taskid));
            //後回し
            props.userstate_.chain.commit("");

            
            const res_token: number = props.userstate_.trierstate.token - data.bettoken;
            data.checkerid = checkerID;
            data.id = commitID;
    

            //データベースのAPI
            const response = await fetch('http://127.0.0.1:8000/addcommittask',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1:8000/addcommittask',
                }, 
                body: JSON.stringify(data),
            })
            const task_data: Task = await response.json();


            //クライアント側の状態データの更新
            props.userstate_.trierstate.token = res_token;
            props.userstate_.trierstate.tasks.push(task_data);
            props.userstate_.trierstate.commits.push(data);
            

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
                    TaskCommit
                </div>
                <div className="space-y-4">
                    <div className='flex-col space-y-0.5'>
                        <div>Task ID</div>
                        <input className='h-10 border-2 border-gray' placeholder='taskid' {...register('taskid')}></input>
                    </div>
                    <div className='flex-col space-y-0.5'>
                        <div>Bet Token</div>
                        <input className='h-10 border-2 border-gray' placeholder='0' {...register('bettoken')}></input>
                    </div>                    
                </div>
                <div className="w-full flex justify-center border-2">
                    <button className='w-full px-6 py-2 rounded bg-green1' type='submit'>
                        <div className='m-auto text-white font-medium'>
                            commit
                        </div>
                    </button>
                </div>
            </form>
        </div>
    )
}



export default AccountPage_Trier;