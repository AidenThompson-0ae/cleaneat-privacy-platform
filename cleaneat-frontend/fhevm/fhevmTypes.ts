/**
 * FHEVM types and interfaces
 * Based on @zama-fhe/relayer-sdk
 */

// Import types from Relayer SDK if available, otherwise define minimal types
export type FhevmInstance = {
  createEncryptedInput: (contractAddress: string, userAddress: string) => EncryptedInputBuilder;
  userDecrypt: (
    handleContractPairs: HandleContractPair[],
    privateKey: string,
    publicKey: string,
    signature: string,
    contractAddresses: `0x${string}`[],
    userAddress: `0x${string}`,
    startTimestamp: number,
    durationDays: number
  ) => Promise<UserDecryptResults>;
  generateKeypair: () => { publicKey: string; privateKey: string };
  createEIP712: (
    publicKey: string,
    contractAddresses: string[],
    startTimestamp: number,
    durationDays: number
  ) => EIP712Type;
  getPublicKey?: () => { publicKey: string }; // Optional, not supported in Mock mode
};

export type EncryptedInputBuilder = {
  add16: (value: number) => EncryptedInputBuilder;
  add32: (value: number) => EncryptedInputBuilder;
  add64: (value: bigint) => EncryptedInputBuilder;
  encrypt: () => Promise<EncryptedInput>;
};

export type EncryptedInput = {
  handles: string[];
  inputProof: string;
};

export type HandleContractPair = {
  handle: string;
  contractAddress: string;
};

// v0.3.0 renamed DecryptedResults to UserDecryptResults
export type UserDecryptResults = {
  [handle: string]: bigint | boolean;
};

// Backward compatibility alias
export type DecryptedResults = UserDecryptResults;

export type FhevmInstanceConfig = {
  chainId?: number;
  network?: any;
  aclAddress?: `0x${string}`;
  kmsVerifierAddress?: `0x${string}`;
  inputVerifierAddress?: `0x${string}`;
  gatewayUrl?: string;
};

export type FhevmDecryptionSignatureType = {
  publicKey: string;
  privateKey: string;
  signature: string;
  startTimestamp: number;
  durationDays: number;
  userAddress: `0x${string}`;
  contractAddresses: `0x${string}`[];
  eip712: EIP712Type;
};

export type EIP712Type = {
  domain: {
    chainId: number;
    name: string;
    verifyingContract: `0x${string}`;
    version: string;
  };
  message: any;
  primaryType: string;
  types: {
    [key: string]: {
      name: string;
      type: string;
    }[];
  };
};

export type FhevmMode = "mock" | "relayer";
