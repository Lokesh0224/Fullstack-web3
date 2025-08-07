import { ConnectButton } from "@rainbow-me/rainbowkit"
import {FaGithub} from 'react-icons/fa'

export default function Header(){
    return(
        <header className="flex items-center justify-between p-4 bg-red-500 ">
            <div className="flex items-center gap-4">
                <a
                href="https://github.com/Lokesh0224/Fullstack-web3/tree/main/ts-tsender-ui-cu"
                target="_blank"
                rel="noopener noreferrer"
                className=" bg-red-500 hover:text-gray-600 transition-colors"
                >
                    <FaGithub size={30}/>
                </a>
                <h1 className="text-3xl font-bold text-gray-800">TSender</h1>
            </div>
            <ConnectButton/>
        </header>
    )
}