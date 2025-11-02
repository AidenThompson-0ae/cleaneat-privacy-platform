#!/usr/bin/env node
/**
 * Check if Hardhat node is running on localhost:8545
 */

import http from 'http';

const HARDHAT_HOST = 'localhost';
const HARDHAT_PORT = 8545;

function checkHardhatNode() {
  return new Promise((resolve) => {
    const options = {
      hostname: HARDHAT_HOST,
      port: HARDHAT_PORT,
      path: '/',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    };

    const req = http.request(options, (res) => {
      resolve(res.statusCode === 200 || res.statusCode === 405);
    });

    req.on('error', () => {
      resolve(false);
    });

    req.write(JSON.stringify({
      jsonrpc: '2.0',
      method: 'net_version',
      params: [],
      id: 1,
    }));

    req.end();
  });
}

async function main() {
  console.log('🔍 Checking if Hardhat node is running...');
  
  const isRunning = await checkHardhatNode();

  if (isRunning) {
    console.log('✅ Hardhat node is running on http://localhost:8545');
    process.exit(0);
  } else {
    console.error('❌ Hardhat node is NOT running!');
    console.log('\n📝 To start Hardhat node:');
    console.log('   cd ../fhevm-hardhat-template');
    console.log('   npx hardhat node');
    console.log('\n📝 Then deploy the contract:');
    console.log('   npx hardhat deploy --network localhost');
    process.exit(1);
  }
}

main();

