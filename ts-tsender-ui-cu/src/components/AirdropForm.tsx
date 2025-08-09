"use client"
import { useState } from "react";
import InputField from "./ui/InputField";
import {chainsToTSender, erc20Abi, tsenderAbi} from "@/constants"
import {useChainId, useConfig, useAccount} from 'wagmi'
import {readContract} from '@wagmi/core'

export default function AirdropForm(){

    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amount, setAmount] = useState("")
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()//address of the one who is gonna airdrop to the recipients

    /*  
        tokenAddress	The address of the ERC-20 token contract
        account.address	Your wallet address (the token owner)
        tSenderAddress	The TSender contract address (the spender) 
    */
    async function getApprovedAmount(tSenderAddress: string | null): Promise<number> {
        if(!tSenderAddress){
            alert("No address found, please use a supported chain")
            return 0;
        }
        //read from the chain that we've approved enough tokens
        const response = await readContract(config, {
            abi: erc20Abi, //erc20 contract abi
            address: tokenAddress as `0x${string}` , //address of the ERC-20 token contract that you want to airdrop.
            functionName: "allowance", 
            /* function allowance(address owner, address spender) external view returns (uint256); 

            owner: the address that owns the tokens (i.e., your wallet)
            spender: the address that is allowed to spend those tokens (i.e., your TSender contract)*/

            args:[account.address, tSenderAddress as `0x${string}`] // Check how many tokens your wallet (owner) has approved for the TSender contract (spender) to use
        })
        return response as number

    }

    async function handleSubmit(){
        /* address of the Tsender airdrop smart contract that is 
        deployed to the chain that is currently connected to. */
        const tSenderAddress = chainsToTSender[chainId]["tsender"]//my contract address deployed on different chains
        const approvedAmount = await getApprovedAmount(tSenderAddress)
        console.log(approvedAmount)
        
    }

    return(
        <div>
            <InputField 
                label="Token Address"
                placeholder="0x"
                value={tokenAddress}
                onChange={e => setTokenAddress(e.target.value)}
            />
            
             <InputField 
                label="Recipients (comma or new line separated)"
                placeholder="0x123, 0x456..."
                value={recipients}
                onChange={e => setRecipients(e.target.value)}
                large={true}
            />

             <InputField 
                label="Amounts (wei; comma or new line separated)"
                placeholder="100, 200, 300..."
                value={amount}
                onChange={e => setAmount(e.target.value)}
                large={true}
            />

            <button onClick={handleSubmit}
                className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 active:scale-95 transition-all duration-200 ease-in-out focus:outline-none">
                SendTokens
            </button>

        </div>
    )
}