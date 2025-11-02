"use client";

/**
 * FHEVM Hook for managing FHEVM instance lifecycle
 */

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import type { FhevmInstance, FhevmMode } from "./fhevmTypes";
import { createFhevmInstance } from "./internal/fhevm";
import { FhevmDecryptionSignature as FhevmDecryptionSignatureManager } from "./FhevmDecryptionSignature";

interface FhevmContextType {
  instance: FhevmInstance | null;
  mode: FhevmMode | null;
  isLoading: boolean;
  error: string | null;
  initializeFhevm: (chainId: number, contractAddress: string, provider: any, account: string) => Promise<void>;
  requestDecryptionSignature: (ethersSigner: any, contractAddresses: string[], storage: any) => Promise<FhevmDecryptionSignatureManager | null>;
  clearInstance: () => void;
}

const FhevmContext = createContext<FhevmContextType | undefined>(undefined);

export function FhevmProvider({ children }: { children: ReactNode }) {
  const [instance, setInstance] = useState<FhevmInstance | null>(null);
  const [mode, setMode] = useState<FhevmMode | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initializeFhevm = useCallback(
    async (chainId: number, contractAddress: string, provider: any, account: string) => {
      setIsLoading(true);
      setError(null);

      try {
        // Create AbortController for this initialization
        const abortController = new AbortController();
        
        const newInstance = await createFhevmInstance({
          provider,
          mockChains: { 31337: "http://localhost:8545" },
          signal: abortController.signal,
          onStatusChange: (status) => {
            console.log(`[FHEVM] Status: ${status}`);
          },
        });

        setInstance(newInstance);
        
        // Detect mode based on chainId
        const detectedMode = chainId === 31337 ? "mock" : "relayer";
        setMode(detectedMode);

        // Note: Decryption signature is always created fresh (no caching in v0.9)
        console.log("✅ FHEVM instance ready. Request decryption signature when needed.");
      } catch (err: any) {
        console.error("Failed to initialize FHEVM:", err);
        setError(err.message || "Failed to initialize FHEVM");
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const requestDecryptionSignature = useCallback(
    async (ethersSigner: any, contractAddresses: string[], storage: any): Promise<any | null> => {
      if (!instance) {
        console.error("FHEVM instance not initialized");
        return null;
      }

      try {
        // Use FhevmDecryptionSignature.loadOrSign from reference implementation
        const sig = await FhevmDecryptionSignatureManager.loadOrSign(
          instance,
          contractAddresses as `0x${string}`[],
          ethersSigner,
          storage
        );

        if (sig) {
          console.log("✅ Decryption signature obtained");
        }

        return sig;
      } catch (err: any) {
        console.error("Failed to get decryption signature:", err);
        setError("Signature rejected. Decryption features will be unavailable.");
        return null;
      }
    },
    [instance]
  );

  const clearInstance = useCallback(() => {
    setInstance(null);
    setMode(null);
    setError(null);
  }, []);

  return (
    <FhevmContext.Provider
      value={{
        instance,
        mode,
        isLoading,
        error,
        initializeFhevm,
        requestDecryptionSignature,
        clearInstance,
      }}
    >
      {children}
    </FhevmContext.Provider>
  );
}

export function useFhevm() {
  const context = useContext(FhevmContext);
  if (!context) {
    throw new Error("useFhevm must be used within FhevmProvider");
  }
  return context;
}

