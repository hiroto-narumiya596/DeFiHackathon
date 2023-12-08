"use client"
import Image from 'next/image'
import { useContext} from 'react';

import TopImage from "source/img/Illustration.svg";
import { UserStateContext } from '@/app/_common/hooks/statemanagement';
import Header from '@/app/_components/ui_parts/header';
import Footer from '@/app/_components/ui_parts/footer';

const Checker_Home = () => {
    const userstate_ = useContext(UserStateContext);
    return(
        <div>
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
        </div>
    )
}

export default Checker_Home;