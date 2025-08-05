import {defineChain, createWalletClient, custom, createPublicClient, parseEther } from "https://esm.sh/viem"
import {coffeeAbi, contractAddress} from "./constants.js"

const connectButton= document.getElementById("connectButton")
const fundButton= document.getElementById("fundButton")
const ethAmountInput= document.getElementById("ethAmount")

let walletClient
let publicClient

 async function connect(){
    if(typeof window.ethereum !== 'undefined'){
        try{
            walletClient= createWalletClient({transport: custom(window.ethereum)})
            const [address] = await walletClient.requestAddresses() //[address] will give the first metamask address
                                                                    /* address will give the address array which are 
                                                                       in the metamask */
            console.log(address)
            connectButton.innerHTML= 'Connected'
        }catch(error){
            console.error("Failed to Connect:", error);
            connectButton.innerHTML= "Connection Failed"

        }
    }

    else{
        connectButton.innerHTML = "Please install MetaMask!"
        
    }
}

async function fund(){
    const ethAmount= ethAmountInput.value
    console.log(`Funding with ${ethAmount}...`)

    if(typeof window.ethereum !== 'undefined'){
        try{
            walletClient = createWalletClient({transport: custom(window.ethereum)})
            const [accAddress]= await walletClient.requestAddresses()
            console.log(accAddress)

            publicClient= createPublicClient({transport: custom(window.ethereum)})
            console.log("Public client intialized")

            const simulationResult= await publicClient.simulateContract({
                address: contractAddress, 
                abi: coffeeAbi, 
                account: accAddress, 
                functionName: "fund"
            })
            console.log("Simulation successful", simulationResult);
        }catch(error){
            console.error("Simulation Failed", error)

        }
    }
    else{
        connectButton.innerHTML="Please install Metamask"
    }


}

connectButton.onclick = connect
fundButton.onclick = fund