import hre from "hardhat";
import { formatEther, parseGwei } from "viem";

async function main() {
  const { viem } = await hre.network.connect();
  const publicClient = await viem.getPublicClient();
  const [deployer] = await viem.getWalletClients();

  console.log("Estimating deployment cost...");

  const artifact = await hre.artifacts.readArtifact("FileShare");
  const deployGas = await publicClient.estimateGas({
    account: deployer.account,
    data: artifact.bytecode as `0x${string}`,
  });

  // Assumptions
  const gasPriceGwei = 10;
  const ethPriceUsd = 2800;
  const gasPrice = parseGwei(gasPriceGwei.toString());

  const deployCostWei = deployGas * gasPrice;
  const deployCostEth = formatEther(deployCostWei);
  const deployCostUsd = Number(deployCostEth) * ethPriceUsd;

  console.log("\n--- Deployment Cost Estimation ---");
  console.log(
    `Assumptions: Gas Price = ${gasPriceGwei} gwei, ETH Price = $${ethPriceUsd}`
  );
  console.log(`Gas Used: ${deployGas}`);
  console.log(`Cost (ETH): ${deployCostEth} ETH`);
  console.log(`Cost (USD): $${deployCostUsd.toFixed(2)}`);

  // Estimate shareFile
  const fileShare = await viem.deployContract("FileShare");
  const receiver = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
  const fileHash = "Qm123456789abcdef";

  console.log("FileShare deployed at:", fileShare.address);
  console.log("FileShare keys:", Object.keys(fileShare));

  try {
    const shareGas = await publicClient.estimateContractGas({
      address: fileShare.address,
      abi: fileShare.abi,
      functionName: "shareFile",
      args: [receiver, fileHash],
      account: deployer.account,
    });
    const shareCostWei = shareGas * gasPrice;
    const shareCostEth = formatEther(shareCostWei);
    const shareCostUsd = Number(shareCostEth) * ethPriceUsd;

    console.log("\n--- Function: shareFile ---");
    console.log(`Gas Used: ${shareGas}`);
    console.log(`Cost (ETH): ${shareCostEth} ETH`);
    console.log(`Cost (USD): $${shareCostUsd.toFixed(4)}`);
  } catch (e) {
    console.error("Error estimating shareFile:", e);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
