"use client"
import Image from 'next/image'
import TopImage from "source/img/Illustration.svg";
import { useContext, createContext} from 'react';

import Header from './_components/ui_parts/header'
import Footer from './_components/ui_parts/footer'
import { UserStateContext } from '@/app/_common/hooks/statemanagement';


export default function Home() {
    
    const userstate_ = useContext(UserStateContext);
    require('dotenv').config()
    const env = process.env
    userstate_.chain.connect(String(env.CHAIN_URL)); //環境変数

    return (
        <main>
            <UserStateContext.Provider value={userstate_}>
                <Header {...userstate_.loginstate}/>
                    <div className="px-32">
                        <div className="h-96 my-52 flex items-center space-x-48">
                            <div className="min-w-max space-y-5">
                                <div className="font-Noto_Sans_JP text-6xl font-semibold text-gray1">
                                    <p>昨日よりも頑張れる</p>
                                    <p>自分になろう</p>
                                </div>
                                <div className="font-Inter text-xl font-normal text-gray1">
                                    Be Better, Get Better
                                </div>
                            </div>
                            <Image
                                src={TopImage}
                                className="h-96 w-96"
                                alt="TopImage"
                            />
                        </div>
                    </div>
                <Footer/>
            </UserStateContext.Provider>
        </main>
    )
}
