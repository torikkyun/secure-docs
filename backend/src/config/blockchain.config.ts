export default () => ({
  blockchain: {
    adminPrivateKey: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY || '',
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL || 'https://sepolia.infura.io/v3/YOUR_PROJECT_ID',
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS || '',
    enabled: process.env.BLOCKCHAIN_ENABLED === 'true' || false,
  },
});