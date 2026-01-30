import { ethers } from "hardhat";

async function main() {
  console.log("🚀 Demo File Activity Logger Contract\n");

  // Get the contract factory
  const FileActivityLogger = await ethers.getContractFactory("FileActivityLogger");

  // Deploy the contract
  console.log("📝 Deploying FileActivityLogger contract...");
  const fileActivityLogger = await FileActivityLogger.deploy();
  await fileActivityLogger.waitForDeployment();

  const contractAddress = await fileActivityLogger.getAddress();
  console.log(`✅ Contract deployed at: ${contractAddress}\n`);

  // Demo data
  const [owner, alice, bob, charlie] = await ethers.getSigners();
  const fileId1 = "doc-2024-001";
  const fileId2 = "presentation-q1-2024";

  console.log("👥 Demo participants:");
  console.log(`Owner/Admin: ${owner.address}`);
  console.log(`Alice: ${alice.address}`);
  console.log(`Bob: ${bob.address}`);
  console.log(`Charlie: ${charlie.address}\n`);

  // Demo 1: Log file sharing
  console.log("📤 Demo 1: File Sharing Activities");
  console.log(`Sharing ${fileId1} from Owner to Alice and Bob...`);

  await fileActivityLogger.logFileShare(fileId1, owner.address, [alice.address, bob.address]);
  console.log("✅ File share logged on blockchain\n");

  console.log(`Sharing ${fileId2} from Alice to Bob and Charlie...`);
  await fileActivityLogger.logFileShare(fileId2, alice.address, [bob.address, charlie.address]);
  console.log("✅ File share logged on blockchain\n");

  // Demo 2: Log file downloads
  console.log("📥 Demo 2: File Download Activities");
  console.log("Alice downloads doc-2024-001...");
  await fileActivityLogger.logFileDownload(fileId1, alice.address);
  console.log("✅ Download logged on blockchain\n");

  console.log("Bob downloads doc-2024-001...");
  await fileActivityLogger.logFileDownload(fileId1, bob.address);
  console.log("✅ Download logged on blockchain\n");

  console.log("Bob downloads presentation-q1-2024...");
  await fileActivityLogger.logFileDownload(fileId2, bob.address);
  console.log("✅ Download logged on blockchain\n");

  // Demo 3: Query activities
  console.log("🔍 Demo 3: Querying Activities\n");

  console.log(`📊 Activities for ${fileId1}:`);
  const shares1 = await fileActivityLogger.getFileShares(fileId1);
  console.log(`Shares: ${shares1.length}`);
  shares1.forEach((share: any, index: number) => {
    console.log(`  Share ${index + 1}:`);
    console.log(`    Sender: ${share.sender}`);
    console.log(`    Recipients: ${share.recipients.join(", ")}`);
    console.log(`    Timestamp: ${new Date(Number(share.timestamp) * 1000).toISOString()}`);
    console.log(`    Block: ${share.blockNumber}`);
  });

  const downloads1 = await fileActivityLogger.getFileDownloads(fileId1);
  console.log(`Downloads: ${downloads1.length}`);
  downloads1.forEach((download: any, index: number) => {
    console.log(`  Download ${index + 1}:`);
    console.log(`    Recipient: ${download.recipient}`);
    console.log(`    Timestamp: ${new Date(Number(download.timestamp) * 1000).toISOString()}`);
    console.log(`    Block: ${download.blockNumber}`);
  });

  console.log(`\n📊 Activities for ${fileId2}:`);
  const shares2 = await fileActivityLogger.getFileShares(fileId2);
  console.log(`Shares: ${shares2.length}`);
  const downloads2 = await fileActivityLogger.getFileDownloads(fileId2);
  console.log(`Downloads: ${downloads2.length}`);

  // Demo 4: Check download status
  console.log("\n✅ Demo 4: Download Status Checks");
  const aliceDownloaded = await fileActivityLogger.hasRecipientDownloaded(fileId1, alice.address);
  const bobDownloaded = await fileActivityLogger.hasRecipientDownloaded(fileId1, bob.address);
  const charlieDownloaded = await fileActivityLogger.hasRecipientDownloaded(fileId1, charlie.address);

  console.log(`${fileId1} download status:`);
  console.log(`  Alice: ${aliceDownloaded ? "✅ Downloaded" : "❌ Not downloaded"}`);
  console.log(`  Bob: ${bobDownloaded ? "✅ Downloaded" : "❌ Not downloaded"}`);
  console.log(`  Charlie: ${charlieDownloaded ? "✅ Downloaded" : "❌ Not downloaded"}`);

  // Demo 5: Get download recipients
  console.log(`\n👥 Recipients who downloaded ${fileId1}:`);
  const downloadRecipients = await fileActivityLogger.getDownloadRecipients(fileId1);
  downloadRecipients.forEach((recipient: string) => {
    console.log(`  - ${recipient}`);
  });

  // Demo 6: Statistics
  console.log("\n📈 Demo 6: Statistics");
  console.log(`${fileId1}:`);
  console.log(`  Share count: ${await fileActivityLogger.getShareCount(fileId1)}`);
  console.log(`  Download count: ${await fileActivityLogger.getDownloadCount(fileId1)}`);

  console.log(`${fileId2}:`);
  console.log(`  Share count: ${await fileActivityLogger.getShareCount(fileId2)}`);
  console.log(`  Download count: ${await fileActivityLogger.getDownloadCount(fileId2)}`);

  console.log("\n🎉 Demo completed successfully!");
  console.log(`\nContract address: ${contractAddress}`);
  console.log("You can view the contract on Etherscan (if deployed to Sepolia):");
  console.log(`https://sepolia.etherscan.io/address/${contractAddress}`);
}

// Execute the demo
main().catch((error) => {
  console.error("❌ Demo failed:", error);
  process.exitCode = 1;
});