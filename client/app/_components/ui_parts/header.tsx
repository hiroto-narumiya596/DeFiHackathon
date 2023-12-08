
import Link from "next/link";
import Image from "next/image";
import { useContext } from "react";
import Button from "../ui_elements/Button";
import {PageButtonProperty, ImageButtonProperty} from "../ui_elements/Button";
import AccountButtonImage from "source/img/account_circle_FILL1_wght400_GRAD0_opsz24.svg";
import { LoginState } from "@/app/_common/types/datadefinition";


const LogInAsset = () => {
    const ButtonProperty_LogIn: PageButtonProperty = {name: "Log In", link: "/login", appearance: "white"};
    return(
        <div className="flex space-x-5 w-fit h-fit border-2 border-red-600">
            <Button.PageButton {...ButtonProperty_LogIn}/>
           
            <div className="px-4 py-1 rounded bg-green1">
                <div className="text-white font-medium">
                    Sign Up
                </div>
            </div>
        </div>
    )
};

const AccountButtonAsset = (loginstate: LoginState) => {
    const ImageButtonProperty_Account: ImageButtonProperty = {
        name: "Account", 
        className: "w-12 h-12 border-2 border-red-600", 
        link: "", 
        img: AccountButtonImage};
    
    
    if(loginstate.loginstate=="trier"){
        ImageButtonProperty_Account.link = "/trier/account"
    }
    if(loginstate.loginstate=="checker"){
        ImageButtonProperty_Account.link = "/checker/account"     
    }
    return(
        <div>
            <Button.ImageButton {...ImageButtonProperty_Account}/>
        </div>
    )
}

const Header = (loginstate_: LoginState) => {
    if(loginstate_.loginstate=="checker" || loginstate_.loginstate=="trier"){
        return(
            <header>
                <div className="content">
                    <div className="font-Inter text-2xl font-bold">TaCS System</div>
                </div>
                <div className="flex space-x-10 w-fit h-fit">
                    <div className="content"><Link href={'/'}>Home</Link></div>
                    <div className="content">Concept</div>
                    <div className="content">About us</div>
                    <div className="content">Q&A</div>
                </div>
                <div className="w-auto h-auto">
                    <AccountButtonAsset {...loginstate_}/>
                </div>
            </header>
    
        )
    }else{
        return(
            <header>
                <div className="content">
                    <div className="font-Inter text-2xl font-bold">TaCS System</div>
                </div>
                <div className="flex space-x-10 w-fit h-fit">
                    <div className="content"><Link href={'/'}>Home</Link></div>
                    <div className="content">Concept</div>
                    <div className="content">About us</div>
                    <div className="content">Q&A</div>
                </div>
                <div>
                    <LogInAsset />
                </div>
            </header>
    
        )
    }
};

export default Header;