import { network } from "hardhat";
import hre from "hardhat";
import { formatEther, parseGwei } from "viem";

async function main() {
  console.log("Estimating deployment cost for FileActivityLogger...\n");

  const { viem } = await network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log(`Deployer address: ${deployer.account.address}`);

  // Get current network gas price
  const currentGasPrice = await publicClient.getGasPrice();
  const currentGasPriceGwei = Number(formatEther(currentGasPrice)) * 1e9;

  console.log(`Current gas price: ${currentGasPriceGwei.toFixed(2)} gwei\n`);

  // Assumptions for estimation
  const assumedGasPriceGwei = 10; // Conservative estimate for Sepolia
  const ethPriceUsd = 2800;
  const gasPrice = parseGwei(assumedGasPriceGwei.toString());

  // Estimate deployment cost
  const artifact = await hre.artifacts.readArtifact("FileActivityLogger");
  const deployGas = await publicClient.estimateGas({
    account: deployer.account,
    data: artifact.bytecode as `0x${string}`,
  });

  const deployCostWei = deployGas * gasPrice;
  const deployCostEth = formatEther(deployCostWei);
  const deployCostUsd = Number(deployCostEth) * ethPriceUsd;

  console.log("=".repeat(50));
  console.log("📊 DEPLOYMENT COST ESTIMATION");
  console.log("=".repeat(50));
  console.log(`Contract: FileActivityLogger`);
  console.log(
    `Assumptions: Gas Price = ${assumedGasPriceGwei} gwei, ETH = $${ethPriceUsd}`,
  );
  console.log(`Gas Required: ${deployGas.toLocaleString()}`);
  console.log(`Cost (ETH): ${deployCostEth} ETH`);
  console.log(`Cost (USD): $${deployCostUsd.toFixed(2)}`);
  console.log("=".repeat(50));

  // Deploy contract for function estimation
  console.log("\n📝 Deploying contract for function cost estimation...");
  const fileActivityLogger = await viem.deployContract("FileActivityLogger");
  const contractAddress = fileActivityLogger.address;
  console.log(`✅ Contract deployed at: ${contractAddress}\n`);

  // Test addresses
  const sender = deployer.account.address;
  const recipient1 = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const recipient2 = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
  const fileId = "test-file-001";

  // Estimate logFileShare
  try {
    console.log("=".repeat(50));
    console.log("📤 FUNCTION: logFileShare");
    console.log("=".repeat(50));

    const shareGas = await publicClient.estimateContractGas({
      address: contractAddress,
      abi: fileActivityLogger.abi,
      functionName: "logFileShare",
      args: [fileId, sender, [recipient1, recipient2]],
      account: deployer.account,
    });

    const shareCostWei = shareGas * gasPrice;
    const shareCostEth = formatEther(shareCostWei);
    const shareCostUsd = Number(shareCostEth) * ethPriceUsd;

    console.log(`Gas Required: ${shareGas.toLocaleString()}`);
    console.log(`Cost (ETH): ${shareCostEth} ETH`);
    console.log(`Cost (USD): $${shareCostUsd.toFixed(4)}`);
    console.log("=".repeat(50));
  } catch (e: any) {
    console.error("❌ Error estimating logFileShare:", e.message);
  }

  // Estimate logFileDownload
  try {
    console.log("\n" + "=".repeat(50));
    console.log("📥 FUNCTION: logFileDownload");
    console.log("=".repeat(50));

    const downloadGas = await publicClient.estimateContractGas({
      address: contractAddress,
      abi: fileActivityLogger.abi,
      functionName: "logFileDownload",
      args: [fileId, recipient1],
      account: deployer.account,
    });

    const downloadCostWei = downloadGas * gasPrice;
    const downloadCostEth = formatEther(downloadCostWei);
    const downloadCostUsd = Number(downloadCostEth) * ethPriceUsd;

    console.log(`Gas Required: ${downloadGas.toLocaleString()}`);
    console.log(`Cost (ETH): ${downloadCostEth} ETH`);
    console.log(`Cost (USD): $${downloadCostUsd.toFixed(4)}`);
    console.log("=".repeat(50));
  } catch (e: any) {
    console.error("❌ Error estimating logFileDownload:", e.message);
  }

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("💡 SUMMARY");
  console.log("=".repeat(50));
  console.log("✅ All cost estimations completed");
  console.log(`📍 Contract deployed at: ${contractAddress}`);
  console.log(`🔗 View on Sepolia Etherscan:`);
  console.log(`   https://sepolia.etherscan.io/address/${contractAddress}`);
  console.log("=".repeat(50));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
