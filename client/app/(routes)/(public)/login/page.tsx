//差し当たり普通のHTTP通信orAPI方式で実装の予定
"use client"
import React from 'react';
import {useContext} from 'react';
import {useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { LoginState, Trier, Checker,UserAuthState } from '@/app/_common/types/datadefinition';
import { UserStateContext } from '@/app/_common/hooks/statemanagement';
import Header from '@/app/_components/ui_parts/header';
import Footer from '@/app/_components/ui_parts/footer';


//readablestream?
type Logindata = {
    user_type: string, //trier or checker
    name: string,
    password: string,
};


const defaultloginState: LoginState = {loginstate:"not login"} //not login、checker、trierのどれか
const defaulttrier: Trier = {id:"", name:"", token:0, tasks:[], commits:[]}
const defaultchecker: Checker = {id:"", name:"", token:0, tasks:[], commits:[], requests:[]}
const defaultuserstate: UserAuthState = {loginstate: defaultloginState, trierstate: defaulttrier, checkerstate: defaultchecker}




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
            password : '',
        },
    });

    const router = useRouter();
    const userstate_ = useContext(UserStateContext);

    //onSubmit関数は、このコンポーネント内で定義しなければならない
    const onSubmit: SubmitHandler<Logindata> = async(data: Logindata) => {
        
        const user_type= data.user_type;
        console.log(JSON.stringify(data));
        try{
            //ここでログインのAPIを実行する
            const response = await fetch('http://127.0.0.1:8000/login',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': 'http://127.0.0.1:8000/login',
                }, 
                body: JSON.stringify(data),
            })
    
            const userdata: any = await response.json(); //データの受け取り

            //グローバルデータ（state）の更新
            userstate_.loginstate = userdata.loginstate;
            userstate_.trierstate = userdata.trierstate;
            userstate_.checkerstate = userdata.checkerstate;

            
            if(userstate_.loginstate.loginstate=="checker"){
                router.push("/checker");
            }
            if(userstate_.loginstate.loginstate=="trier"){
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
            <div className='h-screen border-blue-600 border-2'>
                <UserStateContext.Provider value={userstate_}>
                    <form className='px-40 py-12 space-y-3 w-fit m-auto border-red-600 border-2' method="post" onSubmit={handleSubmit(onSubmit)}>
                        <div className='text-3xl text-green1 font-medium'>TaCS LOGIN</div>
                        <div className='flex-col space-y-0.5'>
                            <div>usertype</div>
                            <select {...register('user_type')}>
                                <option value="trier">trier</option>
                                <option value="checker">checker</option>
                            </select>
                        </div>
                        <div className='flex-col space-y-0.5'>
                            <div>name</div>
                            <input className='h-10 border-2 border-gray' placeholder='name' {...register('name')}/>
                        </div>
                        <div className='flex-col space-y-0.5'>
                            <div>password</div>
                            <input className='h-10 border-2 border-gray' placeholder='password' {...register('password')}/>
                        </div>
                        <button className='mx-auto px-4 py-1 rounded bg-green1' type='submit'>
                            <div className='mx-auto text-white font-medium'>
                                log in
                            </div>
                        </button>
                        
                    </form>
                </UserStateContext.Provider>
            </div>
            <Footer/>
        </div>
    )
}



export default Login;



