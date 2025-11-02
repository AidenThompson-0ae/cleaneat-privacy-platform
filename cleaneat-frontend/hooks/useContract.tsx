"use client";

/**
 * Generic contract interaction hook
 */

import { useState, useEffect } from "react";
import { Contract, BrowserProvider } from "ethers";
import { useWallet } from "./useWallet";

export function useContract(address: string | undefined, abi: any) {
  const { provider, account } = useWallet();
  const [contract, setContract] = useState<Contract | null>(null);

  useEffect(() => {
    if (!address || !provider || !abi || !account) {
      setContract(null);
      return;
    }

    let cancelled = false;

    const initContract = async () => {
      try {
        const ethersProvider = new BrowserProvider(provider);
        const signer = await ethersProvider.getSigner(account);
        
        if (cancelled) return;
        
        const contractInstance = new Contract(address, abi, signer);
        setContract(contractInstance);
      } catch (error) {
        console.error("Failed to create contract instance:", error);
        if (!cancelled) {
          setContract(null);
        }
      }
    };

    initContract();

    return () => {
      cancelled = true;
    };
  }, [address, provider, account, abi]);

  return contract;
}

