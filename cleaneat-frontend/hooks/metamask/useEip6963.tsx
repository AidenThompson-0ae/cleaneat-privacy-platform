"use client";

/**
 * EIP-6963: Multi Injected Provider Discovery
 */

import { useState, useEffect, useCallback } from "react";
import type { EIP6963ProviderDetail } from "./Eip6963Types";

export function useEip6963() {
  const [providers, setProviders] = useState<Map<string, EIP6963ProviderDetail>>(new Map());
  const [selectedProvider, setSelectedProvider] = useState<EIP6963ProviderDetail | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const providerMap = new Map<string, EIP6963ProviderDetail>();

    // Listen for announcements
    const handleAnnouncement = (event: any) => {
      const detail = event.detail as EIP6963ProviderDetail;
      providerMap.set(detail.info.uuid, detail);
      setProviders(new Map(providerMap));
    };

    window.addEventListener("eip6963:announceProvider", handleAnnouncement);

    // Request providers
    window.dispatchEvent(new Event("eip6963:requestProvider"));

    // Cleanup
    return () => {
      window.removeEventListener("eip6963:announceProvider", handleAnnouncement);
    };
  }, []);

  const selectProvider = useCallback((uuid: string) => {
    const provider = providers.get(uuid);
    if (provider) {
      setSelectedProvider(provider);
      // Store last connector ID
      localStorage.setItem("wallet.lastConnectorId", uuid);
    }
  }, [providers]);

  const clearSelection = useCallback(() => {
    setSelectedProvider(null);
    localStorage.removeItem("wallet.lastConnectorId");
  }, []);

  // Auto-select last connected provider
  useEffect(() => {
    const lastConnectorId = localStorage.getItem("wallet.lastConnectorId");
    if (lastConnectorId && providers.has(lastConnectorId)) {
      setSelectedProvider(providers.get(lastConnectorId)!);
    }
  }, [providers]);

  return {
    providers: Array.from(providers.values()),
    selectedProvider,
    selectProvider,
    clearSelection,
  };
}

