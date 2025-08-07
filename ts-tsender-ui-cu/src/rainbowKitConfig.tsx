"use client";

//This file says about what chains(like eth mainnet) we can connect to.
import { getDefaultConfig } from '@rainbow-me/rainbowkit'
import {anvil, mainnet, zksync, polygon, arbitrum, optimism, sepolia } from "wagmi/chains"

const config= getDefaultConfig({
    appName: "TSender", 
    projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID!, 
    chains: [anvil, zksync, mainnet, polygon, arbitrum, optimism, sepolia], 
    ssr: false

})

export default config