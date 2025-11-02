// Auto-generated contract addresses
export const CleanEatAddresses: Record<number, string> = {
  "31337": "0x4A1F65Ea8655521FDBe3CD5a0236Fde851dBfD51", // localhost
  "11155111": "0x4A1F65Ea8655521FDBe3CD5a0236Fde851dBfD51" // Sepolia
};

export function getCleanEatAddress(chainId: number): string | undefined {
  return CleanEatAddresses[chainId];
}
