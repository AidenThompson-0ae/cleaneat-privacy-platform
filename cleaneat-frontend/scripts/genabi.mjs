#!/usr/bin/env node
/**
 * Generate ABI and contract addresses from Hardhat deployments
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const FRONTEND_ROOT = path.resolve(__dirname, '..');
const HARDHAT_ROOT = path.resolve(FRONTEND_ROOT, '..', 'fhevm-hardhat-template');
const ABI_OUTPUT_DIR = path.join(FRONTEND_ROOT, 'abi');

// Contract name
const CONTRACT_NAME = 'CleanEat';

// Ensure output directory exists
if (!fs.existsSync(ABI_OUTPUT_DIR)) {
  fs.mkdirSync(ABI_OUTPUT_DIR, { recursive: true });
}

/**
 * Generate ABI file
 */
function generateABI() {
  try {
    // Try to read from deployments/localhost first
    const localhostDeploymentPath = path.join(
      HARDHAT_ROOT,
      'deployments',
      'localhost',
      `${CONTRACT_NAME}.json`
    );

    let deploymentData;
    if (fs.existsSync(localhostDeploymentPath)) {
      deploymentData = JSON.parse(fs.readFileSync(localhostDeploymentPath, 'utf-8'));
      console.log(`✅ Found deployment at: ${localhostDeploymentPath}`);
    } else {
      // Fallback to artifacts
      const artifactPath = path.join(
        HARDHAT_ROOT,
        'artifacts',
        'contracts',
        `${CONTRACT_NAME}.sol`,
        `${CONTRACT_NAME}.json`
      );
      if (fs.existsSync(artifactPath)) {
        deploymentData = JSON.parse(fs.readFileSync(artifactPath, 'utf-8'));
        console.log(`✅ Found artifact at: ${artifactPath}`);
      } else {
        // Check if ABI file already exists (for CI/CD builds like Vercel)
        const existingABIPath = path.join(ABI_OUTPUT_DIR, `${CONTRACT_NAME}ABI.ts`);
        if (fs.existsSync(existingABIPath)) {
          console.log(`⚠️  No deployment or artifact found, but ABI file exists. Skipping ABI generation.`);
          return; // Skip ABI generation, use existing file
        } else {
          console.error(`❌ No deployment or artifact found for ${CONTRACT_NAME}`);
          console.log('   Run: cd ../fhevm-hardhat-template && npx hardhat compile && npx hardhat deploy --network localhost');
          process.exit(1);
        }
      }
    }

    // Write ABI file
    const abiContent = `// Auto-generated ABI for ${CONTRACT_NAME}
export const ${CONTRACT_NAME}ABI = ${JSON.stringify(deploymentData.abi, null, 2)} as const;
`;

    fs.writeFileSync(path.join(ABI_OUTPUT_DIR, `${CONTRACT_NAME}ABI.ts`), abiContent);
    console.log(`✅ Generated: abi/${CONTRACT_NAME}ABI.ts`);
  } catch (error) {
    console.error(`❌ Error generating ABI:`, error.message);
    process.exit(1);
  }
}

/**
 * Generate addresses file
 */
function generateAddresses() {
  try {
    const addresses = {};

    // Localhost
    const localhostPath = path.join(
      HARDHAT_ROOT,
      'deployments',
      'localhost',
      `${CONTRACT_NAME}.json`
    );
    if (fs.existsSync(localhostPath)) {
      const data = JSON.parse(fs.readFileSync(localhostPath, 'utf-8'));
      addresses['31337'] = data.address;
      console.log(`✅ Localhost address: ${data.address}`);
    }

    // Sepolia
    const sepoliaPath = path.join(
      HARDHAT_ROOT,
      'deployments',
      'sepolia',
      `${CONTRACT_NAME}.json`
    );
    if (fs.existsSync(sepoliaPath)) {
      const data = JSON.parse(fs.readFileSync(sepoliaPath, 'utf-8'));
      addresses['11155111'] = data.address;
      console.log(`✅ Sepolia address: ${data.address}`);
    }

    // Write addresses file (only if we have addresses or file doesn't exist)
    const addressFilePath = path.join(ABI_OUTPUT_DIR, `${CONTRACT_NAME}Addresses.ts`);
    if (Object.keys(addresses).length > 0 || !fs.existsSync(addressFilePath)) {
      const addressContent = `// Auto-generated contract addresses
export const ${CONTRACT_NAME}Addresses: Record<number, string> = ${JSON.stringify(addresses, null, 2)};

export function get${CONTRACT_NAME}Address(chainId: number): string | undefined {
  return ${CONTRACT_NAME}Addresses[chainId];
}
`;

      fs.writeFileSync(addressFilePath, addressContent);
      console.log(`✅ Generated: abi/${CONTRACT_NAME}Addresses.ts`);
    } else {
      console.log(`⚠️  No deployed addresses found, but addresses file exists. Skipping address generation.`);
    }

    if (Object.keys(addresses).length === 0 && fs.existsSync(addressFilePath)) {
      console.log('ℹ️  Using existing addresses file.');
    } else if (Object.keys(addresses).length === 0) {
      console.warn('⚠️  No deployed addresses found. Deploy contracts first.');
    }
  } catch (error) {
    console.error(`❌ Error generating addresses:`, error.message);
    process.exit(1);
  }
}

// Main
console.log('🔧 Generating ABI and addresses...\n');
generateABI();
generateAddresses();
console.log('\n✅ ABI generation complete!');

