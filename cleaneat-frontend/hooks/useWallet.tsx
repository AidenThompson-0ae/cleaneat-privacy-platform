"use client";

/**
 * Wallet connection hook with persistence and event listeners
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { useMetaMaskProvider } from "./metamask/useMetaMaskProvider";
import { GenericStringStorage } from "../fhevm/GenericStringStorage";

interface WalletContextType {
  account: string | null;
  chainId: number | null;
  provider: any;
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  connect: () => Promise<void>;
  disconnect: () => void;
  switchNetwork: (targetChainId: number) => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

const walletStorage = new GenericStringStorage("wallet");

export function WalletProvider({ children }: { children: ReactNode }) {
  const { provider, requestProvider } = useMetaMaskProvider();
  const [account, setAccount] = useState<string | null>(null);
  const [chainId, setChainId] = useState<number | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Silent reconnect on page load using eth_accounts
  useEffect(() => {
    if (!provider) return;

    const attemptSilentReconnect = async () => {
      const wasConnected = walletStorage.get("connected") === "true";
      if (!wasConnected) return;

      try {
        // Use eth_accounts (silent, no prompt)
        const accounts = await provider.request({ method: "eth_accounts" });
        if (accounts && accounts.length > 0) {
          const savedAccounts = walletStorage.get("lastAccounts");
          const savedAccount = savedAccounts ? JSON.parse(savedAccounts)[0] : null;

          if (savedAccount && accounts.includes(savedAccount)) {
            setAccount(savedAccount);

            const chainIdHex = await provider.request({ method: "eth_chainId" });
            const chainIdNum = parseInt(chainIdHex, 16);
            setChainId(chainIdNum);
            setIsConnected(true);

            console.log("✅ Wallet reconnected silently");
          }
        }
      } catch (err) {
        console.error("Silent reconnect failed:", err);
      }
    };

    attemptSilentReconnect();
  }, [provider]);

  // Setup event listeners
  useEffect(() => {
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("👤 Accounts changed:", accounts);
      
      if (accounts.length === 0) {
        // Disconnected
        disconnect();
      } else {
        const newAccount = accounts[0];
        setAccount(newAccount);
        walletStorage.set("lastAccounts", JSON.stringify(accounts));
        
        // Clear old FHEVM signature, user needs to sign again
        localStorage.removeItem(`fhevm.decryptionSignature.${account}`);
      }
    };

    const handleChainChanged = (chainIdHex: string) => {
      const newChainId = parseInt(chainIdHex, 16);
      console.log("🔗 Chain changed:", newChainId);
      
      setChainId(newChainId);
      walletStorage.set("lastChainId", String(newChainId));
      
      // Reload page to reinitialize (common practice for chain changes)
      window.location.reload();
    };

    const handleConnect = (connectInfo: { chainId: string }) => {
      console.log("🔌 Wallet connected:", connectInfo);
      const newChainId = parseInt(connectInfo.chainId, 16);
      setChainId(newChainId);
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      console.log("🔌 Wallet disconnected");
      disconnect();
    };

    provider.on("accountsChanged", handleAccountsChanged);
    provider.on("chainChanged", handleChainChanged);
    provider.on("connect", handleConnect);
    provider.on("disconnect", handleDisconnect);

    return () => {
      provider.removeListener("accountsChanged", handleAccountsChanged);
      provider.removeListener("chainChanged", handleChainChanged);
      provider.removeListener("connect", handleConnect);
      provider.removeListener("disconnect", handleDisconnect);
    };
  }, [provider, account]);

  const connect = useCallback(async () => {
    if (!provider) {
      setError("No wallet provider found. Please install MetaMask.");
      return;
    }

    setIsConnecting(true);
    setError(null);

    try {
      // Request accounts (prompts user)
      const accounts = await provider.request({ method: "eth_requestAccounts" });
      
      if (accounts.length === 0) {
        throw new Error("No accounts found");
      }

      const newAccount = accounts[0];
      const chainIdHex = await provider.request({ method: "eth_chainId" });
      const newChainId = parseInt(chainIdHex, 16);

      setAccount(newAccount);
      setChainId(newChainId);
      setIsConnected(true);

      // Persist state
      walletStorage.set("connected", "true");
      walletStorage.set("lastAccounts", JSON.stringify(accounts));
      walletStorage.set("lastChainId", String(newChainId));

      console.log("✅ Wallet connected:", newAccount, "Chain:", newChainId);
    } catch (err: any) {
      console.error("Connection failed:", err);
      
      if (err.code === 4001) {
        setError("Connection rejected. Please approve to continue.");
      } else {
        setError(err.message || "Failed to connect wallet");
      }
    } finally {
      setIsConnecting(false);
    }
  }, [provider]);

  const disconnect = useCallback(() => {
    setAccount(null);
    setChainId(null);
    setIsConnected(false);
    setError(null);

    // Clear persisted state
    walletStorage.clear();

    // Clear FHEVM signatures
    if (account) {
      localStorage.removeItem(`fhevm.decryptionSignature.${account}`);
    }

    console.log("🔌 Wallet disconnected");
  }, [account]);

  const switchNetwork = useCallback(
    async (targetChainId: number) => {
      if (!provider) {
        setError("No wallet provider found");
        return;
      }

      try {
        await provider.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: `0x${targetChainId.toString(16)}` }],
        });
      } catch (err: any) {
        console.error("Failed to switch network:", err);
        setError(`Failed to switch network: ${err.message}`);
      }
    },
    [provider]
  );

  return (
    <WalletContext.Provider
      value={{
        account,
        chainId,
        provider,
        isConnected,
        isConnecting,
        error,
        connect,
        disconnect,
        switchNetwork,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error("useWallet must be used within WalletProvider");
  }
  return context;
}

