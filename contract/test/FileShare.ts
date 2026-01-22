import assert from "node:assert/strict";
import { describe, it } from "node:test";
import hre from "hardhat";
import { getAddress } from "viem";

describe("FileShare", () => {
  async function deployFileShareFixture() {
    const { viem } = await hre.network.connect();
    const [owner, otherAccount] = await viem.getWalletClients();
    const fileShare = await viem.deployContract("FileShare");
    const publicClient = await viem.getPublicClient();

    return {
      fileShare,
      owner,
      otherAccount,
      publicClient,
    };
  }

  it("Should emit FileShared event with correct args", async () => {
    const { fileShare, owner, publicClient } = await deployFileShareFixture();

    const receiver = "0x70997970C51812dc3A010C7d01b50e0d17dc79C8";
    const cid = "Qm123456789abcdef";

    const hash = await fileShare.write.shareFile([receiver, cid]);
    await publicClient.waitForTransactionReceipt({ hash });

    const fileSharedEvents = await publicClient.getContractEvents({
      address: fileShare.address,
      abi: fileShare.abi,
      eventName: "FileShared",
      fromBlock: 0n,
    });
    assert.strictEqual(fileSharedEvents.length, 1);
    assert.strictEqual(
      fileSharedEvents[0].args.sender,
      getAddress(owner.account.address)
    );
    assert.strictEqual(fileSharedEvents[0].args.receiver, getAddress(receiver));
    assert.strictEqual(fileSharedEvents[0].args.cid, cid);
  });

  it("Should allow multiple shares", async () => {
    const { fileShare, publicClient } = await deployFileShareFixture();

    const receiver = "0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC";
    const cid1 = "QmHash1";
    const cid2 = "QmHash2";

    const hash1 = await fileShare.write.shareFile([receiver, cid1]);
    await publicClient.waitForTransactionReceipt({
      hash: hash1,
    });

    const hash2 = await fileShare.write.shareFile([receiver, cid2]);
    await publicClient.waitForTransactionReceipt({
      hash: hash2,
    });

    const fileSharedEvents = await publicClient.getContractEvents({
      address: fileShare.address,
      abi: fileShare.abi,
      eventName: "FileShared",
      fromBlock: 0n,
    });
    assert.strictEqual(fileSharedEvents.length, 2);
    assert.strictEqual(fileSharedEvents[0].args.cid, cid1);
    assert.strictEqual(fileSharedEvents[1].args.cid, cid2);
  });
});
