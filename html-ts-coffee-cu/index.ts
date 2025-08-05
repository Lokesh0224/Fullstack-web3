import {
  defineChain,
  createWalletClient,
  custom,
  createPublicClient,
  parseEther,
  formatEther
} from "https://esm.sh/viem";
import { coffeeAbi, contractAddress } from "./constants.js";

const connectButton = document.getElementById("connectButton") as HTMLButtonElement;
const fundButton = document.getElementById("fundButton") as HTMLButtonElement;
const ethAmountInput = document.getElementById("ethAmount") as HTMLInputElement;
const balanceButton = document.getElementById("balanceButton") as HTMLButtonElement;
const withdrawButton = document.getElementById("withdraw") as HTMLButtonElement;

let walletClient: any;
let publicClient: any;

async function connect(): Promise<void> {
  if (typeof window.ethereum !== 'undefined') {
    try {
      walletClient = createWalletClient({ transport: custom(window.ethereum) });
      const [address] = await walletClient.requestAddresses();
      console.log(address);
      connectButton.innerHTML = 'Connected';
    } catch (error) {
      console.error("Failed to Connect:", error);
      connectButton.innerHTML = "Connection Failed";
    }
  } else {
    connectButton.innerHTML = "Please install MetaMask!";
  }
}

async function fund(): Promise<void> {
  const ethAmount = ethAmountInput.value;
  console.log(`Funding with ${ethAmount}...`);

  if (typeof window.ethereum !== 'undefined') {
    try {
      walletClient = createWalletClient({ transport: custom(window.ethereum) });
      const [account] = await walletClient.requestAddresses();
      const currentChain = await getCurrentChain(walletClient);

      publicClient = createPublicClient({ transport: custom(window.ethereum) });
      console.log("Public client initialized");

      const { request } = await publicClient.simulateContract({
        address: contractAddress,
        abi: coffeeAbi,
        account: account,
        functionName: "fund",
        chain: currentChain,
        value: parseEther(ethAmount)
      });
      console.log("Simulation successful", request);

      const hash = await walletClient.writeContract(request);
      console.log(`Transaction hash: ${hash}`);
    } catch (error) {
      console.error("Simulation Failed", error);
    }
  } else {
    connectButton.innerHTML = "Please install Metamask";
  }
}

async function getbalance(): Promise<void> {
  if (typeof window.ethereum !== "undefined") {
    publicClient = createPublicClient({ transport: custom(window.ethereum) });
    const balance = await publicClient.getBalance({ address: contractAddress });
    console.log(`Fund contract balance ${formatEther(balance)}`);
  }
}

async function withdraw(): Promise<void> {
  console.log("Withdrawing....");

  if (typeof window.ethereum !== "undefined") {
    walletClient = createWalletClient({ transport: custom(window.ethereum) });
    publicClient = createPublicClient({ transport: custom(window.ethereum) });
    const [account] = await walletClient.requestAddresses();
    const currentChain = await getCurrentChain(walletClient);

    console.log("Processing transaction");

    const { request } = await publicClient.simulateContract({
      address: contractAddress,
      abi: coffeeAbi,
      account: account,
      functionName: 'withdraw',
      chain: currentChain
    });

    const hash = await walletClient.writeContract(request);
    console.log(`Withdraw txn hash: ${hash}`);
  }
}

async function getCurrentChain(client: any): Promise<any> {
  const chainId = await client.getChainId();
  const currentChain = defineChain({
    id: chainId,
    name: "Custom Chain",
    nativeCurrency: {
      name: "Ether",
      symbol: "ETH",
      decimals: 18
    },
    rpcUrls: {
      default: {
        http: ["http://localhost:8545"]
      }
    }
  });
  return currentChain;
}

connectButton.onclick = connect;
fundButton.onclick = fund;
balanceButton.onclick = getbalance;
withdrawButton.onclick = withdraw;
