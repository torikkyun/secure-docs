import { network } from "hardhat";
import hre from "hardhat";
import { formatEther, parseGwei, getContract } from "viem";

// Already-deployed contract address on Sepolia
const DEPLOYED_CONTRACT_ADDRESS =
  "0xDE4DedE583bFd5D0691BFDB57FFcf3DF69a3aC79" as const;

async function main() {
  console.log("FileActivityLogger — Cost Analysis");
  console.log(`Network: Sepolia`);
  console.log(`Contract: ${DEPLOYED_CONTRACT_ADDRESS}`);
  console.log(
    `Etherscan: https://sepolia.etherscan.io/address/${DEPLOYED_CONTRACT_ADDRESS}\n`,
  );

  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log(`Deployer address: ${deployer.account.address}`);

  // Get current network gas price
  const currentGasPrice = await publicClient.getGasPrice();
  const currentGasPriceGwei = Number(formatEther(currentGasPrice)) * 1e9;
  console.log(`Current gas price: ${currentGasPriceGwei.toFixed(4)} gwei\n`);

  // Use current gas price for all estimates
  const gasPrice = currentGasPrice;
  const ethPriceUsd = 2800;

  function costSummary(gas: bigint) {
    const costWei = gas * gasPrice;
    const costEth = formatEther(costWei);
    const costUsd = Number(costEth) * ethPriceUsd;
    return { gas, costEth, costUsd };
  }

  // ── 1. Deployment cost (estimated, not re-deployed) ──────────────────────
  console.log("=".repeat(50));
  console.log("📊 DEPLOYMENT COST (estimated)");
  console.log("=".repeat(50));

  const artifact = await hre.artifacts.readArtifact("FileActivityLogger");
  const deployGas = await publicClient.estimateGas({
    account: deployer.account,
    data: artifact.bytecode as `0x${string}`,
  });
  const deploy = costSummary(deployGas);
  console.log(`Gas Required : ${deploy.gas.toLocaleString()}`);
  console.log(`Cost (ETH)   : ${deploy.costEth} ETH`);
  console.log(`Cost (USD)   : $${deploy.costUsd.toFixed(2)}`);

  // ── Load deployed contract ────────────────────────────────────────────────
  const contractArtifact =
    await hre.artifacts.readArtifact("FileActivityLogger");
  const contract = getContract({
    address: DEPLOYED_CONTRACT_ADDRESS,
    abi: contractArtifact.abi,
    client: { public: publicClient, wallet: deployer },
  });

  // Sample values for estimation
  const fileId = "sample-file-001";
  const senderEmail = "alice@example.com";
  const recipientEmail = "bob@example.com";
  const expiresAt = BigInt(Math.floor(Date.now() / 1000) + 7 * 24 * 3600); // 7 days

  // ── 2. logFileShare ───────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("📤 FUNCTION: logFileShare");
  console.log("=".repeat(50));
  try {
    const shareGas = await publicClient.estimateContractGas({
      address: DEPLOYED_CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: "logFileShare",
      args: [fileId, senderEmail, recipientEmail, expiresAt],
      account: deployer.account,
    });
    const share = costSummary(shareGas);
    console.log(`Gas Required : ${share.gas.toLocaleString()}`);
    console.log(`Cost (ETH)   : ${share.costEth} ETH`);
    console.log(`Cost (USD)   : $${share.costUsd.toFixed(6)}`);
  } catch (e: any) {
    console.error("❌ Error:", e.shortMessage ?? e.message);
  }

  // ── 3. logFileDownload ────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("📥 FUNCTION: logFileDownload");
  console.log("=".repeat(50));
  try {
    const downloadGas = await publicClient.estimateContractGas({
      address: DEPLOYED_CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: "logFileDownload",
      args: [fileId, recipientEmail],
      account: deployer.account,
    });
    const dl = costSummary(downloadGas);
    console.log(`Gas Required : ${dl.gas.toLocaleString()}`);
    console.log(`Cost (ETH)   : ${dl.costEth} ETH`);
    console.log(`Cost (USD)   : $${dl.costUsd.toFixed(6)}`);
  } catch (e: any) {
    console.error("❌ Error:", e.shortMessage ?? e.message);
  }

  // ── 4. logFileView ────────────────────────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("👁  FUNCTION: logFileView");
  console.log("=".repeat(50));
  try {
    const viewGas = await publicClient.estimateContractGas({
      address: DEPLOYED_CONTRACT_ADDRESS,
      abi: contractArtifact.abi,
      functionName: "logFileView",
      args: [fileId, senderEmail],
      account: deployer.account,
    });
    const view = costSummary(viewGas);
    console.log(`Gas Required : ${view.gas.toLocaleString()}`);
    console.log(`Cost (ETH)   : ${view.costEth} ETH`);
    console.log(`Cost (USD)   : $${view.costUsd.toFixed(6)}`);
  } catch (e: any) {
    console.error("❌ Error:", e.shortMessage ?? e.message);
  }

  // ── 5. On-chain stats (read, no gas) ─────────────────────────────────────
  console.log("\n" + "=".repeat(50));
  console.log("📈 CONTRACT STATS (on-chain, no gas cost)");
  console.log("=".repeat(50));
  try {
    const [totalShares, totalDownloads, totalViews] =
      (await contract.read.getContractStats()) as [bigint, bigint, bigint];
    console.log(`Total shares    : ${totalShares.toLocaleString()}`);
    console.log(`Total downloads : ${totalDownloads.toLocaleString()}`);
    console.log(`Total views     : ${totalViews.toLocaleString()}`);
  } catch (e: any) {
    console.error("❌ Error:", e.shortMessage ?? e.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("Note: costs use current Sepolia gas price.");
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
