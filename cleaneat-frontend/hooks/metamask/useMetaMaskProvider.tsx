"use client";

/**
 * MetaMask Provider Hook
 */

import { useState, useEffect, useCallback } from "react";
import { useEip6963 } from "./useEip6963";

export function useMetaMaskProvider() {
  const { providers, selectedProvider, selectProvider } = useEip6963();
  const [provider, setProvider] = useState<any>(null);

  useEffect(() => {
    if (selectedProvider) {
      setProvider(selectedProvider.provider);
    } else if (typeof window !== "undefined" && (window as any).ethereum) {
      // Fallback to window.ethereum
      setProvider((window as any).ethereum);
    }
  }, [selectedProvider]);

  const requestProvider = useCallback(
    async (preferredUuid?: string) => {
      if (preferredUuid) {
        selectProvider(preferredUuid);
        return;
      }

      // If only one provider, auto-select
      if (providers.length === 1) {
        selectProvider(providers[0].info.uuid);
        return;
      }

      // Otherwise, let user choose (handled by UI component)
    },
    [providers, selectProvider]
  );

  return {
    provider,
    providers,
    requestProvider,
  };
}

