import { defineChain, createWalletClient, custom, createPublicClient, parseEther, formatEther } from "https://esm.sh/viem"
import { coffeeAbi, contractAddress } from "./constants-js.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const ethAmountInput = document.getElementById("ethAmount")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdraw")

let walletClient
let publicClient

async function connect() {
    if (typeof window.ethereum !== 'undefined') {
        try {
            walletClient = createWalletClient({ transport: custom(window.ethereum) })
            const [address] = await walletClient.requestAddresses() //[address] will give the first metamask address
            /* address will give the address array which are 
               in the metamask */
            console.log(address)
            connectButton.innerHTML = 'Connected'
        } catch (error) {
            console.error("Failed to Connect:", error);
            connectButton.innerHTML = "Connection Failed"
        }
    }
    else {
        connectButton.innerHTML = "Please install MetaMask!"
    }
}

async function fund() {
    const ethAmount = ethAmountInput.value
    console.log(`Funding with ${ethAmount}...`)

    if (typeof window.ethereum !== 'undefined') {
        try {
            walletClient = createWalletClient({ transport: custom(window.ethereum) })
            const [account] = await walletClient.requestAddresses()
            const currentChain = await getCurrentChain(walletClient);
            console.log("Processing transaction...")

            publicClient = createPublicClient({ transport: custom(window.ethereum) })
            console.log("Public client intialized")

            /*this is simulting the contract, if this passes then we have the assurance that actually calling the 
            contract will pass*/
            const { request } = await publicClient.simulateContract({//this gives us the request object back
                address: contractAddress,
                abi: coffeeAbi,
                account: account,
                functionName: "fund",
                chain: currentChain,
                value: parseEther(ethAmount)
            })
            console.log("Simulation successful", request);

            /* you're funding the eth to the contract the fund fn will return a transaction
             hash then it will get mined on the chian*/
            const hash = await walletClient.writeContract(request);
            console.log(`transction hash: ${hash}`);

        } catch (error) {
            console.error("Simulation Failed", error)
        }
    }
    else {
        connectButton.innerHTML = "Please install Metamask"
    }


}

async function getbalance() {
    if (typeof window.ethereum !== "undefined") {
        publicClient = await createPublicClient({ transport: custom(window.ethereum) })
        const balance = await publicClient.getBalance({ address: contractAddress });
        console.log(`Fund contract balance ${formatEther(balance)}`) // 1000000000000000000wei ==>1ETH
    }

}

async function withdraw() {
    console.log("Withdrawing....")
    if (typeof window.ethereum !== "undefined") {
        walletClient = createWalletClient({ transport: custom(window.ethereum) })
        publicClient = createPublicClient({ transport: custom(window.ethereum) })
        const [account] = await walletClient.requestAddresses()
        const currentChain = await getCurrentChain(walletClient)

        console.log("Processing transaction")
        const { request } = await publicClient.simulateContract({
            address: contractAddress,
            abi: coffeeAbi,
            account: account,
            functionName: 'withdraw', //withdraw ETH from the contract if they are the owner
            chain: currentChain
        })
        const hash = await walletClient.writeContract(request);
        console.log(`Withdraw txn hash: ${hash}`)
    }

}

async function getCurrentChain(client) {
    const chainId = await client.getChainId()
    const currentChain = defineChain({
        id: chainId,
        name: "Custom Chain",
        nativeCurrency: {
            name: "Ether",
            symbol: "ETH",
            decimals: 18,
        },
        rpcUrls: {
            default: {
                http: ["http://localhost:8545"],
            },
        },
    })
    return currentChain
}

connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getbalance
withdrawButton.onclick = withdraw