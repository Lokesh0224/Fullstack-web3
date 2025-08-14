"use client"
import HomeContent from "@/components/HomeComponents";
import { useAccount } from "wagmi";
export default function Home() {
  const {isConnected} = useAccount(); //this returns object so we're just getting one value from the returned object
  return (
    <div className="">
      {isConnected ? (
          <div>
            <HomeContent/> 
          </div> 
        ) : (
          <div> 
            Please connect a wallet...
          </div>
        )
      }
      
    </div>
  );
}
