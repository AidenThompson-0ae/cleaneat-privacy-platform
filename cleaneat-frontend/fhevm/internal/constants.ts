/**
 * FHEVM constants
 */

export const FHEVM_CONSTANTS = {
  // Local network (Hardhat)
  LOCALHOST_CHAIN_ID: 31337,
  
  // Sepolia network
  SEPOLIA_CHAIN_ID: 11155111,
  
  // Mock detection marker
  MOCK_METADATA_KEY: "fhevm_relayer_metadata",
  
  // Storage keys
  STORAGE_KEYS: {
    DECRYPTION_SIGNATURE: (account: string) => `fhevm.decryptionSignature.${account.toLowerCase()}`,
  },
  
  // Relayer SDK CDN URL (official Zama CDN - v0.3.0-5)
  RELAYER_SDK_CDN: "https://cdn.zama.org/relayer-sdk-js/0.3.0-5/relayer-sdk-js.umd.cjs",
} as const;

