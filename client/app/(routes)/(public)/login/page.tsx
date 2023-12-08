//差し当たり普通のHTTP通信orAPI方式で実装の予定
"use client"
import React from 'react';
import {useContext} from 'react';
import {useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';

import { LoginState, Task, Trier, Checker,UserAuthState } from '@/app/_common/types/datadefinition';
import { UserStateContext } from '@/app/_common/hooks/statemanagement';
import Header from '@/app/_components/ui_parts/header';
import Footer from '@/app/_components/ui_parts/footer';
//import { loginstate, trier, checker } from '@/app/_common/hooks/statemanagement';


//readablestream?
type Logindata = {
    user_type: string, //trier or checker
    name: string,
    password: string,
};

const api_service_login: string = '/api/service/login';
//'http://localhost:3001/api/service/login'

const defaultloginState: LoginState = {loginstate:"not login"} //not login、checker、trierのどれか
const defaulttrier: Trier = {id:"", name:"", token:0, tasks:[]}
const defaultchecker: Checker = {id:"", name:"", tasks:[]}
const defaultuserstate: UserAuthState = {loginstate: defaultloginState, trierstate: defaulttrier, checkerstate: defaultchecker}


//これを信じた
//https://zenn.dev/uttk/scraps/f4959ea0cb27ef
//useStateとuseContextを合わせて使ってはいけない。
/*
const LoginPage = () => {
    const [userstate_, setUserState_] = useState<UserAuthState>(defaultuserstate);
    return (
        <UserStateContext.Provider value={userstate_}>
            <Login/>
        </UserStateContext.Provider>
    )
}*/

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

    //const [trier_, setLogTrier] = useContext(trier);
    //const [checker_, setChecker] = useContext(checker);
    //const [userState_, setUserState_] = useState<UserAuthState>();

    const onSubmit: SubmitHandler<Logindata> = async(data: Logindata) => {
        
        const user_type= data.user_type;
        console.log(JSON.stringify(data));
        try{
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

            console.log(userstate_.loginstate)
            
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




/*
//import { useRouter } from 'next/router'
//import { useSession, signIn, signOut, SessionProvider } from 'next-auth/react'
//import { useSearchParams } from 'next/navigation';
const Login = () => {

    const {error} = useSearchParams().size
    const {data: session, status }  = useSession();
  
    return (
      <div>
        <h1>カスタムログインページ</h1>
        {session ? (
          // ログイン状態の場合。ユーザー名、ログアウトボタンを表示。
          <>
            <div>ユーザー：{session.user?.name}</div>
            <button onClick={() => signOut()}>ログアウト</button>
          </>
        ) : (
          // ログアウト状態の場合。入力フォームを表示。
          <form method='post' action={() => signIn()}>
            <label>
              <div>name</div>
              <input name='login' />
            </label>
            <label>
              <div>password</div>
              <input name='password' type='password' />
            </label>
            <div>
              <button type='submit'>ログイン</button>
            </div>
            
            {error && <div>ログインID又はパスワードが間違っています。</div>}
          </form>
        )}
      </div>
    )
}
//getserversideprops削除（App Routerでは廃止のため）
const LoginPage = () => {
    return(
        
        <SessionProvider>
            <Login/>
        </SessionProvider>
        
    )
}
*/