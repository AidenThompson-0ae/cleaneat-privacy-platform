# CleanEat - Privacy-Preserving Food Rating Platform

CleanEat is a decentralized application (dApp) that enables users to submit and view food stall ratings while preserving privacy through Fully Homomorphic Encryption (FHE). Built with FHEVM v0.9, the platform allows users to rate food stalls based on nutrition and satisfaction scores without exposing individual ratings until aggregated.

## Features

- **Privacy-Preserving Ratings**: Submit encrypted ratings that remain private until aggregated
- **Aggregated Statistics**: View average nutrition and satisfaction scores for each food stall
- **User Dashboard**: Track your own rating history
- **Leaderboard**: Compare food stalls based on aggregated ratings
- **Logistics Dashboard**: Authorized staff can view detailed analytics
- **Dual Mode Support**: Works with both Mock mode (localhost) and Relayer mode (testnet/mainnet)

## Project Structure

```
.
├── fhevm-hardhat-template/    # Smart contracts and Hardhat configuration
│   ├── contracts/              # Solidity smart contracts
│   ├── deploy/                 # Deployment scripts
│   ├── test/                   # Contract tests
│   └── tasks/                  # Hardhat custom tasks
└── cleaneat-frontend/          # Next.js frontend application
    ├── app/                    # Next.js app router pages
    ├── components/             # React components
    ├── hooks/                  # Custom React hooks
    ├── fhevm/                  # FHEVM integration logic
    └── abi/                    # Contract ABIs and addresses
```

## Prerequisites

- **Node.js**: Version 20 or higher
- **npm**: Package manager
- **MetaMask** or compatible Web3 wallet
- **Hardhat Node** (for local development with Mock mode)

## Installation

### 1. Install Contract Dependencies

```bash
cd fhevm-hardhat-template
npm install
```

### 2. Install Frontend Dependencies

```bash
cd ../cleaneat-frontend
npm install
```

### 3. Set Up Environment Variables

In `fhevm-hardhat-template/`:

```bash
npx hardhat vars set MNEMONIC
npx hardhat vars set INFURA_API_KEY
npx hardhat vars set ETHERSCAN_API_KEY
```

## Development

### Local Development (Mock Mode)

1. **Start Hardhat Node**:
   ```bash
   cd fhevm-hardhat-template
   npx hardhat node
   ```

2. **Deploy Contracts**:
   ```bash
   npx hardhat deploy --network localhost
   ```

3. **Start Frontend**:
   ```bash
   cd ../cleaneat-frontend
   npm run dev:mock
   ```

### Testnet Development (Relayer Mode)

1. **Deploy to Sepolia**:
   ```bash
   cd fhevm-hardhat-template
   npx hardhat deploy --network sepolia
   ```

2. **Start Frontend**:
   ```bash
   cd ../cleaneat-frontend
   npm run dev
   ```

3. **Connect Wallet** to Sepolia testnet

## Building for Production

### Frontend

```bash
cd cleaneat-frontend
npm run build
```

The static export will be generated in `cleaneat-frontend/out/`.

## Smart Contracts

### CleanEat Contract

The main contract (`contracts/CleanEat.sol`) provides:

- **Submit Rating**: Users can submit encrypted nutrition and satisfaction scores
- **View Aggregates**: Get average scores for each food stall
- **Authorization**: Owner can authorize logistics staff
- **Privacy**: All ratings are encrypted using FHEVM

### Contract Addresses

- **Localhost (31337)**: `0x4A1F65Ea8655521FDBe3CD5a0236Fde851dBfD51`
- **Sepolia (11155111)**: `0x4A1F65Ea8655521FDBe3CD5a0236Fde851dBfD51`

## Testing

### Contract Tests

```bash
cd fhevm-hardhat-template
npm run test
```

### Test on Sepolia

```bash
npm run test:sepolia
```

## Deployment

### Deploy to Sepolia

```bash
cd fhevm-hardhat-template
npx hardhat deploy --network sepolia
npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
```

### Deploy Frontend to Vercel

The frontend is configured for static export and can be deployed to Vercel or any static hosting service.

## Technologies

- **FHEVM v0.9.1**: Fully Homomorphic Encryption Virtual Machine
- **Hardhat**: Ethereum development environment
- **Next.js 15**: React framework with static export
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Utility-first CSS framework
- **ethers.js v6.13.0**: Ethereum library
- **Relayer SDK v0.3.0-5**: FHEVM Relayer integration
- **Mock Utils v0.3.0-1**: FHEVM Mock utilities for local development

## License

This project is licensed under the BSD-3-Clause-Clear License.

## Support

For issues and questions:
- Check the [FHEVM Documentation](https://docs.zama.ai/fhevm)
- Review contract tests in `fhevm-hardhat-template/test/`
- Check frontend implementation in `cleaneat-frontend/`

