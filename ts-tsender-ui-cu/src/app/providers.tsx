"use client" //these are not server side codes, contain hooks etc..
import {type ReactNode} from "react"
import { RainbowKitProvider,  } from "@rainbow-me/rainbowkit"
import config from "@/rainbowKitConfig"
import { WagmiProvider } from "wagmi"
import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { useState } from "react"
import "@rainbow-me/rainbowkit/styles.css"

export default function Providers(props: {children: ReactNode}){
    const [queryClient]= useState(() => new QueryClient())
    return (
        
        //wagmi is written on viem
        <WagmiProvider config= {config}>
            <QueryClientProvider client={queryClient}>
                <RainbowKitProvider>
                    {props.children}
                </RainbowKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
        
    )
}

/*
<RainbowKitProvider>
    {props.children} all the website code will be here
</RainbowKitProvider>
 */

 //wagmi is written on viem
{/* <WagmiProvider config= {config}>
    <RainbowKitProvider>
        {props.children}
    </RainbowKitProvider>
</WagmiProvider> */}