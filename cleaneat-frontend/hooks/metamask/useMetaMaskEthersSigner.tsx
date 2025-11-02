"use client";

/**
 * Ethers Signer Hook for MetaMask
 */

import { useMemo } from "react";
import { BrowserProvider, JsonRpcSigner } from "ethers";

export function useMetaMaskEthersSigner(provider: any, account: string | null) {
  const signer = useMemo(() => {
    if (!provider || !account) return null;

    try {
      const ethersProvider = new BrowserProvider(provider);
      return ethersProvider.getSigner(account);
    } catch (error) {
      console.error("Failed to create signer:", error);
      return null;
    }
  }, [provider, account]);

  return signer;
}

