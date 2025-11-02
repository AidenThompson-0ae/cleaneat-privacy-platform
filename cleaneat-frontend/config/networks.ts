/**
 * Network configurations for CleanEat
 */

export interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  blockExplorer?: string;
  fhevmConfig?: {
    aclAddress: string;
    inputVerifierAddress: string;
    kmsVerifierAddress: string;
    gatewayUrl?: string;
  };
}

export const networks: Record<string, NetworkConfig> = {
  localhost: {
    chainId: 31337,
    name: "Localhost",
    rpcUrl: "http://localhost:8545",
    fhevmConfig: {
      aclAddress: "0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c",
      inputVerifierAddress: "0x3d6b3489b4e3a3e6c3f3f3f3f3f3f3f3f3f3f3f3",
      kmsVerifierAddress: "0x4d6b3489b4e3a3e6c3f3f3f3f3f3f3f3f3f3f3f4",
      gatewayUrl: "http://localhost:8545",
    },
  },
  sepolia: {
    chainId: 11155111,
    name: "Sepolia",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_KEY",
    blockExplorer: "https://sepolia.etherscan.io",
    fhevmConfig: {
      aclAddress: "0x05fD9B5EFE0a996095f42Ed7e77c390810CF660c",
      inputVerifierAddress: "0x3d6b3489b4e3a3e6c3f3f3f3f3f3f3f3f3f3f3f3",
      kmsVerifierAddress: "0x4d6b3489b4e3a3e6c3f3f3f3f3f3f3f3f3f3f3f4",
      gatewayUrl: "https://gateway.sepolia.zama.ai",
    },
  },
};

export function getNetworkConfig(chainId: number): NetworkConfig | undefined {
  return Object.values(networks).find((n) => n.chainId === chainId);
}

export function isSupportedNetwork(chainId: number): boolean {
  return Object.values(networks).some((n) => n.chainId === chainId);
}

export const supportedChainIds = Object.values(networks).map((n) => n.chainId);

