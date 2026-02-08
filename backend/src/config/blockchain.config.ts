export default () => ({
  blockchain: {
    adminPrivateKey: process.env.BLOCKCHAIN_ADMIN_PRIVATE_KEY,
    rpcUrl: process.env.BLOCKCHAIN_RPC_URL,
    contractAddress: process.env.BLOCKCHAIN_CONTRACT_ADDRESS,
  },
});
