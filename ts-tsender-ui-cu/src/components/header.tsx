import { ConnectButton } from "@rainbow-me/rainbowkit"
import {FaGithub} from 'react-icons/fa'

export default function Header(){
    return(
        <header className="flex items-center justify-between p-4 bg-white ">
            <div className="flex items-center gap-4">
                <img src="/utilities/T-Sender.svg" alt="TSender logo" className="w-18 h-18"></img>

                <h1 className="text-3xl font-bold text-gray-800">TSender</h1>
                <a
                href="https://github.com/Lokesh0224/Fullstack-web3/tree/main/ts-tsender-ui-cu"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red-500 w-18 h-18 hover:text-gray-600 transition-colors"
                >
                    <FaGithub size={30}/>
                </a>
            </div>
            <ConnectButton/>
        </header>
    )
}