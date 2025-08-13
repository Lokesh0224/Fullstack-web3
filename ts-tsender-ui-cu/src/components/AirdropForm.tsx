"use client"
import { useState, useMemo, useEffect } from "react";
import InputField from "./ui/InputField";
import {chainsToTSender, erc20Abi, tsenderAbi} from "@/constants"
import {useChainId, useConfig, useAccount, useWriteContract,} from 'wagmi'
import {readContract, waitForTransactionReceipt} from '@wagmi/core'
import calculateTotal from "@/utils/calculateTotal/calculateTotal"
import Spinner from './ui/spinner'

export default function AirdropForm(){

    /* instead of rendering with an empty value first and then 
    updating the useEffect you initialize your state directly 
    from the localstorage */
    const [tokenAddress, setTokenAddress] = useState(() => {
        if(typeof window !== 'undefined'){
            return localStorage.getItem('tSenderTokenAddress') || ""
        }
        return ""
    })
    const [recipients, setRecipients] = useState(() => {
        if(typeof window !== 'undefined'){
            return localStorage.getItem('tSenderRecipients') || ""
        }
        return ""
    })
    const [amount, setAmount] = useState(() => {
        if(typeof window !== 'undefined'){
            return localStorage.getItem('tSenderAmount') || ""
        }
        return ""
    })
    
    const chainId = useChainId()
    const config = useConfig()
    const account = useAccount()//address of the one who is gonna airdrop to the recipients
    const total: number = useMemo(() => calculateTotal(amount), [amount])
    const { data: hash, isPending,  writeContractAsync } = useWriteContract();//dont know how these are the exact return types, patrick just wrote so i did
    const [isWaitingWalletConfirmation, setIsWaitingWalletConfirmation] = useState(false);
    const [isWaitingMining, setIsWaitingMining] = useState(false);

    //Setting the localStorage
    useEffect(() => {
        if(tokenAddress) localStorage.setItem('tSenderTokenAddress', tokenAddress)
    }, [tokenAddress])

    useEffect(() => {
        if(recipients) localStorage.setItem('tSenderRecipients', recipients)
    }, [recipients])
     
    useEffect(() => {
        if(amount) localStorage.setItem('tSenderAmount', amount )
    }, [amount])

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
        try{
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
        }catch (error: any) {
            setIsWaitingWalletConfirmation(false);
            setIsWaitingMining(false);
            console.error("Transaction failed or was cancelled:", error);

            if (error.code === 'ACTION_REJECTED' || error.message?.includes('User rejected')) {
                alert("Transaction was cancelled by the user.");
            } else {
                alert("Something went wrong. Please try again.");
            }
        }finally{
            setIsWaitingWalletConfirmation(false);
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
                className={`py-2.5 px-5 me-2 text-sm font-medium text-gray-900 bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 inline-flex items-center
                    ${isWaitingWalletConfirmation || isWaitingMining ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 active:scale-95'}`}
                >{
                    isWaitingMining ? (<><Spinner/> Mining transaction... </>) : isWaitingWalletConfirmation ? 
                                      (<><Spinner/> Conforming in wallet... </>) : ('SendTokens')
                }
            </button>


        </div>
    )
}