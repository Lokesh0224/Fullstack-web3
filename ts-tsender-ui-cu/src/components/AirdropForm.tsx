"use client"
import { useState, useMemo } from "react";
import InputField from "./ui/InputField";
import {chainsToTSender, erc20Abi, tsenderAbi} from "@/constants"
import {useChainId, useConfig, useAccount, useWriteContract,} from 'wagmi'
import {readContract, waitForTransactionReceipt} from '@wagmi/core'
import calculateTotal from "@/utils/calculateTotal/calculateTotal"
import Spinner from './ui/spinner'

export default function AirdropForm(){

    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amount, setAmount] = useState("")
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()//address of the one who is gonna airdrop to the recipients
    const total: number = useMemo(() => calculateTotal(amount), [amount])
    const { data: hash, isPending,  writeContractAsync } = useWriteContract();//dont know how these are the exact return types, patrick just wrote so i did
    const [isWaitingWalletConfirmation, setIsWaitingWalletConfirmation] = useState(false);
    const [isWaitingMining, setIsWaitingMining] = useState(false);


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
            address: tokenAddress as `0x${string}` , //address of the ERC-20 token contract that TSender want to airdrop.
            //The allowance is the amount of tokens you've approved a spender to use from your wallet via the approve function.
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
        if(approvedAmount < total){

            setIsWaitingWalletConfirmation(true);
            const approvalHash= await writeContractAsync({
                abi: erc20Abi, 
                address: tokenAddress as `0x${string}`, 
                //Allow the TSender contract to spend up to total tokens from my wallet.
                functionName: 'approve', //“Allow spender to spend up to amount of my tokens on my behalf.”
                args: [tSenderAddress as `0x${string}`, BigInt(total)]
            }) 
            setIsWaitingWalletConfirmation(false)
            setIsWaitingMining(true);
            //if we have enough approvedAmount
            const approvalReceipt = await waitForTransactionReceipt(config, {
                hash: approvalHash
            })
            console.log("Approval confirmed", approvalReceipt)

            setIsWaitingMining(false);
            

            setIsWaitingWalletConfirmation(true);
            const airdropResult=await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`, 
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[\n,]+/).map(addr => addr.trim()).filter(addr => addr !==''), //Two address
                    amount.split(/[\n,]+/).map(amt => amt.trim()).filter(amt => amt !== ''), //Two input
                    //ex: There are two recipients, so the amount inputbox should contain two amount values like 100, 100
                    BigInt(total)
                 ],
            })
            console.log('The airdropResult is', airdropResult)
            setIsWaitingWalletConfirmation(false);

            setIsWaitingMining(true);
            await waitForTransactionReceipt(config, { hash: airdropResult });
            setIsWaitingMining(false);
        }
        else{
            setIsWaitingWalletConfirmation(true)
            const airdropResult= await writeContractAsync({
                abi: tsenderAbi,
                address: tSenderAddress as `0x${string}`, 
                functionName: "airdropERC20",
                args: [
                    tokenAddress,
                    recipients.split(/[\n,]+/).map(addr => addr.trim()).filter(addr => addr !==''), 
                    amount.split(/[\n,]+/).map(amt => amt.trim()).filter(amt => amt !== ''), 
                    BigInt(total)
                 ],
            })
            console.log('The airdropResult is', airdropResult)
            setIsWaitingWalletConfirmation(false)

            setIsWaitingMining(true);
            await waitForTransactionReceipt(config, { hash: airdropResult });
            setIsWaitingMining(false);
        }
        
        
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

            <button 
                onClick={handleSubmit} 
                disabled={isWaitingWalletConfirmation || isWaitingMining}
                className={`mt-4 px-6 py-2 text-white font-semibold rounded-lg shadow-md transition-all duration-200 ease-in-out focus:outline-none
                    ${isWaitingWalletConfirmation || isWaitingMining ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                >
                {(isWaitingWalletConfirmation && <>Confirming in wallet... <Spinner /></>) ||
                (isWaitingMining && <>Mining transaction... <Spinner /></>) ||
                'SendTokens'}
            </button>


        </div>
    )
}