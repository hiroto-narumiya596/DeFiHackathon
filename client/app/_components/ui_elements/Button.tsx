import Link from 'next/link'
import Image from 'next/image'
import AccountButtonImage from "source/img/account_circle_FILL1_wght400_GRAD0_opsz24.svg";
import { LoginState } from "@/app/_common/types/datadefinition";

interface PageButtonProperty{
    name: string,
    link: string,
    appearance: string //white or green
};

interface ImageButtonProperty{
    name: string,
    className: string,
    link: string,
    img: any,
};

const PageButton: React.FC<PageButtonProperty> = (props) => {
    if(props.appearance=="white"){//この部分は、いずれきれいにしたい。
        return(
            <div className='px-4 py-1 rounded border border-green1'>
                <Link href={props.link}>
                    <div className='text-green1 font-medium'>
                        {props.name}
                    </div>
                </Link>
            </div>
        );
    }else{
        return(
            <div className='px-4 py-1 rounded bg-green1'>
                <Link href={props.link}>
                    <a className='text-white font-medium'>
                        {props.name}
                    </a>
                </Link>
            </div>            
        );
    }
}


const ImageButton: React.FC<ImageButtonProperty> = (props) => {
    return(
        <div className={props.className}>
            <Link href={props.link}>
                <Image src={props.img} alt={props.name} className='w-full h-full'/>
            </Link>
        </div>
    )    
}

export default {PageButton, ImageButton};
export type {PageButtonProperty, ImageButtonProperty};
