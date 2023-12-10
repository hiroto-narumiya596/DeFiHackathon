//差し当たり普通のHTTP通信orAPI方式で実装の予定
"use client"
import React from 'react';
import {useContext} from 'react';
import {useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { LoginState, Trier, Checker,UserAuthState, Commit, Request, Task } from '@/app/_common/types/datadefinition';
import { UserStateContext } from '@/app/_common/hooks/statemanagement';
import Header from '@/app/_components/ui_parts/header';
import Footer from '@/app/_components/ui_parts/footer';


//readablestream?
//キャッシュサーバに送信するデータ
type Logindata = {
    user_type: string, //trier or checker
    name: string, //なくても良い。ただの表示用。
    id: string,
};

//キャッシュサーバから受信するデータ
type CurrentTasksCommitsRequests = {
    tasks: Task[],
    commits: Commit[],
    requests: Request[],
};


const Login = () => {
    const {
        register,
        handleSubmit,
        watch,
        formState: { errors }
      } = useForm<Logindata>({
        defaultValues: {
            user_type : '',
            name : '',
            id : '',
        },
    });

    const router = useRouter();
    const userstate_ = useContext(UserStateContext);

    //onSubmit関数は、このコンポーネント内で定義しなければならない
    const onSubmit: SubmitHandler<Logindata> = async(data: Logindata) => {
        const user_type= data.user_type;
        userstate_.loginstate.loginstate = user_type;
        if(user_type=="Trier"){
            userstate_.chain.loginState = "Trier";
        }
        if(user_type=="Checker"){
            userstate_.chain.loginState = "Checker";
        }

        try{
            //データベースのAPI
            const response = await fetch('http://127.0.0.1:8000/login',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1:8000/login',
                }, 
                body: JSON.stringify(data),
            })
    
            const currentdatas: CurrentTasksCommitsRequests = await response.json(); //データの受け取り

            //チェーンのAPI
            //チェーンからトークン残高を取得する関数を定義（さしあたり、結果だけ渡す）
            userstate_.chain.updateLoginState(userstate_.chain.loginState,data.id);
            if(userstate_.chain.loadTokenBalance()==undefined){
                throw Error('error');
            }
            const token: number = Number(userstate_.chain.loadTokenBalance())
            


            //グローバルデータ（state）の更新
            if(userstate_.chain.loginState=="Checker"){
                userstate_.checkerstate.id = data.id
                userstate_.checkerstate.name = data.name
                userstate_.checkerstate.token = token
                userstate_.checkerstate.tasks = currentdatas.tasks
                userstate_.checkerstate.commits = currentdatas.commits
                userstate_.checkerstate.requests = currentdatas.requests
                router.push("/checker");
            }
            if(userstate_.chain.loginState=="Trier"){
                userstate_.trierstate.id = data.id
                userstate_.trierstate.name = data.name
                userstate_.trierstate.token = token
                userstate_.trierstate.tasks = currentdatas.tasks
                userstate_.trierstate.commits = currentdatas.commits              
                router.push("/trier");
            }
        }
        catch(e){
            console.log(e)
            router.push("/");
        }
    }
    return(
        <div>
            <Header {...userstate_.loginstate}/>
            <div className='h-screen py-5'>
                <UserStateContext.Provider value={userstate_}>
                    <form className='px-40 py-12 space-y-4 w-fit m-auto rounded border-2 border-gray' method="post" onSubmit={handleSubmit(onSubmit)}>
                        <div className='text-3xl text-green1 font-medium'>TaCS LOGIN</div>
                        <div className='space-y-8'>
                            <div className='space-y-3'>
                                <div className='flex-col space-y-0.5'>
                                    <div>usertype</div>
                                    <select {...register('user_type')} className='w-full h-8 border-2 border-gray'>
                                        <option value="trier">trier</option>
                                        <option value="checker">checker</option>
                                    </select>
                                </div>
                                <div className='flex-col space-y-0.5'>
                                    <div>name</div>
                                    <input className='w-full h-8 border-2 border-gray' placeholder='name' {...register('name')}/>
                                </div>
                                <div className='flex-col space-y-0.5'>
                                    <div>password</div>
                                    <input className='w-full h-8 border-2 border-gray' placeholder='password' {...register('id')}/>
                                </div>
                            </div>
                            <button className='w-full py-2 rounded bg-green1' type='submit'>
                                <div className='mx-auto text-white font-medium'>
                                    log in
                                </div>
                            </button>
                        </div>
                    </form>
                </UserStateContext.Provider>
            </div>
            <Footer/>
        </div>
    )
}



export default Login;



