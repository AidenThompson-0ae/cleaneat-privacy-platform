/**
 * FHEVM Decryption Signature Management
 * Based on reference implementation from frontend/fhevm/FhevmDecryptionSignature.ts
 */

import type { FhevmInstance, FhevmDecryptionSignatureType, EIP712Type } from "./fhevmTypes";
import { FHEVM_CONSTANTS } from "./internal/constants";

export class FhevmDecryptionSignature {
  #publicKey: string;
  #privateKey: string;
  #signature: string;
  #startTimestamp: number;
  #durationDays: number;
  #userAddress: `0x${string}`;
  #contractAddresses: `0x${string}`[];
  #eip712: EIP712Type;

  private constructor(parameters: FhevmDecryptionSignatureType) {
    this.#publicKey = parameters.publicKey;
    this.#privateKey = parameters.privateKey;
    this.#signature = parameters.signature;
    this.#startTimestamp = parameters.startTimestamp;
    this.#durationDays = parameters.durationDays;
    this.#userAddress = parameters.userAddress;
    this.#contractAddresses = parameters.contractAddresses;
    this.#eip712 = parameters.eip712;
  }

  public get privateKey() {
    return this.#privateKey;
  }

  public get publicKey() {
    return this.#publicKey;
  }

  public get signature() {
    return this.#signature;
  }

  public get startTimestamp() {
    return this.#startTimestamp;
  }

  public get durationDays() {
    return this.#durationDays;
  }

  public get contractAddresses() {
    return this.#contractAddresses;
  }

  public get userAddress() {
    return this.#userAddress;
  }

  public get eip712() {
    return this.#eip712;
  }

  /**
   * Always create new signature (no cache)
   */
  public static async loadOrSign(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    ethersSigner: any,
    storage: any
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      // Always create new signature, no cache
      return await FhevmDecryptionSignature.sign(
        instance,
        contractAddresses,
        ethersSigner,
        storage
      );
    } catch (error) {
      console.error("Failed to sign:", error);
      return null;
    }
  }

  /**
   * Create new EIP712 signature for decryption
   */
  public static async sign(
    instance: FhevmInstance,
    contractAddresses: `0x${string}`[],
    ethersSigner: any,
    storage: any
  ): Promise<FhevmDecryptionSignature | null> {
    try {
      const userAddress = (await ethersSigner.getAddress()) as `0x${string}`;

      // Generate key pair (works for both Mock and Relayer modes)
      const { publicKey, privateKey } = instance.generateKeypair();

      // Validate publicKey format
      if (!publicKey || typeof publicKey !== 'string') {
        console.error("Invalid publicKey generated:", publicKey);
        return null;
      }

      const startTimestamp = Math.floor(Date.now() / 1000);
      const durationDays = 365;

      // Ensure contractAddresses is a string array (not typed as 0x${string}[])
      // Validate and normalize addresses (ensure they are valid Ethereum addresses)
      const sortedContractAddresses: string[] = [];
      for (const addr of contractAddresses) {
        // Validate address format
        if (!addr || typeof addr !== 'string' || !addr.startsWith('0x')) {
          console.error("Invalid contract address format:", addr);
          continue;
        }
        // Normalize to lowercase (Ethereum addresses are case-insensitive)
        const normalized = addr.toLowerCase();
        // Basic validation: should be 42 characters (0x + 40 hex chars)
        if (normalized.length !== 42) {
          console.error("Invalid contract address length:", addr);
          continue;
        }
        sortedContractAddresses.push(normalized);
      }

      // Sort for consistency (as per reference implementation)
      sortedContractAddresses.sort();

      // Validate that we have at least one contract address
      if (sortedContractAddresses.length === 0) {
        console.error("No valid contract addresses provided for EIP712 signature");
        return null;
      }

      console.log("[FhevmDecryptionSignature] Creating EIP712 with:", {
        publicKey: publicKey.substring(0, 20) + "...",
        publicKeyLength: publicKey.length,
        contractAddresses: sortedContractAddresses,
        contractAddressesCount: sortedContractAddresses.length,
        startTimestamp,
        durationDays,
      });

      // Use FHEVM instance's standard EIP712 generation (works for both Mock and Relayer)
      // Note: createEIP712 expects string[], not 0x${string}[]
      // Mock mode may have stricter validation, so ensure all parameters are correct
      let eip712;
      try {
        eip712 = instance.createEIP712(
          publicKey,
          sortedContractAddresses,
          startTimestamp,
          durationDays
        );
        console.log("[FhevmDecryptionSignature] EIP712 created successfully");
      } catch (eip712Error: any) {
        console.error("[FhevmDecryptionSignature] createEIP712 failed:", eip712Error);
        console.error("Error details:", {
          message: eip712Error.message,
          stack: eip712Error.stack,
          publicKeyType: typeof publicKey,
          publicKeyLength: publicKey.length,
          publicKeyPreview: publicKey.substring(0, 50),
          contractAddresses: sortedContractAddresses,
          contractAddressesCount: sortedContractAddresses.length,
          startTimestamp,
          durationDays,
        });
        throw eip712Error;
      }

      // Sign EIP712 data
      const signature = await ethersSigner.signTypedData(
        eip712.domain,
        { UserDecryptRequestVerification: eip712.types.UserDecryptRequestVerification },
        eip712.message
      );

      const sigData: FhevmDecryptionSignatureType = {
        publicKey,
        privateKey,
        signature,
        startTimestamp,
        durationDays,
        userAddress,
        contractAddresses: sortedContractAddresses as `0x${string}`[],
        eip712,
      };

      // Store signature
      const storageKey = FHEVM_CONSTANTS.STORAGE_KEYS.DECRYPTION_SIGNATURE(userAddress);
      storage.set(storageKey, JSON.stringify(sigData));

      return new FhevmDecryptionSignature(sigData);
    } catch (error) {
      console.error("Failed to sign:", error);
      return null;
    }
  }

  /**
   * Remove signature from storage
   */
  public static removeSignature(account: string, storage: any): void {
    const key = FHEVM_CONSTANTS.STORAGE_KEYS.DECRYPTION_SIGNATURE(account);
    storage.remove(key);
  }
}
