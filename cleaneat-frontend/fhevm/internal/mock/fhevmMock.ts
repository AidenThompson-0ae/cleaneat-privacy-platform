//////////////////////////////////////////////////////////////////////////
//
// WARNING!!
// ALWAYS USE DYNAMICALLY IMPORT THIS FILE TO AVOID INCLUDING THE ENTIRE 
// FHEVM MOCK LIB IN THE FINAL PRODUCTION BUNDLE!!
//
//////////////////////////////////////////////////////////////////////////

import { JsonRpcProvider, Contract } from "ethers";
import { MockFhevmInstance } from "@fhevm/mock-utils";
import { FhevmInstance } from "../../fhevmTypes";

export const fhevmMockCreateInstance = async (parameters: {
  rpcUrl: string;
  chainId: number;
  metadata: {
    ACLAddress: `0x${string}`;
    InputVerifierAddress: `0x${string}`;
    KMSVerifierAddress: `0x${string}`;
  };
}): Promise<FhevmInstance> => {
  console.log("[fhevmMock] Creating Mock instance with parameters:", parameters);
  
  const provider = new JsonRpcProvider(parameters.rpcUrl);
  
  // Query both InputVerifier and KMSVerifier contracts' EIP712 domains (required for v0.3.0)
  const inputVerifierContract = new Contract(
    parameters.metadata.InputVerifierAddress,
    ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
    provider
  );
  
  const kmsVerifierContract = new Contract(
    parameters.metadata.KMSVerifierAddress,
    ["function eip712Domain() external view returns (bytes1, string, string, uint256, address, bytes32, uint256[])"],
    provider
  );
  
  let verifyingContractAddressInputVerification: `0x${string}`;
  let verifyingContractAddressDecryption: `0x${string}`;
  let gatewayChainId: number;
  
  try {
    // Query InputVerifier EIP712 domain (for input verification)
    const inputDomain = await inputVerifierContract.eip712Domain();
    verifyingContractAddressInputVerification = inputDomain[4] as `0x${string}`; // index 4 is verifyingContract
    const inputChainId = Number(inputDomain[3]); // index 3 is chainId
    
    // Query KMSVerifier EIP712 domain (for decryption - this is what createEIP712 validates!)
    const kmsDomain = await kmsVerifierContract.eip712Domain();
    verifyingContractAddressDecryption = kmsDomain[4] as `0x${string}`; // index 4 is verifyingContract
    gatewayChainId = Number(kmsDomain[3]); // index 3 is chainId (this must match for createEIP712)
    
    console.log("[fhevmMock] InputVerifier EIP712 domain chainId:", inputChainId);
    console.log("[fhevmMock] InputVerifier EIP712 verifyingContract:", verifyingContractAddressInputVerification);
    console.log("[fhevmMock] KMSVerifier EIP712 domain chainId:", gatewayChainId);
    console.log("[fhevmMock] KMSVerifier EIP712 verifyingContract:", verifyingContractAddressDecryption);
  } catch (error) {
    console.warn("[fhevmMock] Could not query EIP712 domains, using defaults:", error);
    verifyingContractAddressInputVerification = parameters.metadata.InputVerifierAddress;
    verifyingContractAddressDecryption = parameters.metadata.KMSVerifierAddress;
    gatewayChainId = 55815;
  }
  
  // Create instance with v0.3.0 API (4th parameter: properties)
  const instance = await MockFhevmInstance.create(
    provider,
    provider,
    {
      aclContractAddress: parameters.metadata.ACLAddress,
      chainId: parameters.chainId,
      gatewayChainId: gatewayChainId, // Must match KMSVerifier EIP712 domain chainId
      inputVerifierContractAddress: parameters.metadata.InputVerifierAddress,
      kmsContractAddress: parameters.metadata.KMSVerifierAddress,
      verifyingContractAddressDecryption: verifyingContractAddressDecryption, // Must match KMSVerifier EIP712 domain verifyingContract
      verifyingContractAddressInputVerification: verifyingContractAddressInputVerification, // Must match InputVerifier EIP712 domain verifyingContract
    },
    {
      // v0.3.0 requires 4th parameter: properties
      inputVerifierProperties: {},
      kmsVerifierProperties: {},
    }
  );
  
  console.log("✅ Created FHEVM Mock instance (v0.3.0)");
  return instance as unknown as FhevmInstance;
};
