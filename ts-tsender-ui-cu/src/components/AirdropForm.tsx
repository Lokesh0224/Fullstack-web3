"use client"
import { useState } from "react";
import InputField from "./ui/InputField";

export default function AirdropForm(){

    const [tokenAddress, setTokenAddress] = useState("")
    const [recipients, setRecipients] = useState("")
    const [amount, setAmount] = useState("")

    async function handleSubmit(){
        console.log(tokenAddress)
        console.log(recipients)
        console.log(amount)
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

            <button onClick={handleSubmit}>
                SendTokens
            </button>

        </div>
    )
}