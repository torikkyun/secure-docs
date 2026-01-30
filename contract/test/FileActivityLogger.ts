import { expect } from "chai";
import { ethers } from "hardhat";
import { FileActivityLogger } from "../typechain-types";

describe("FileActivityLogger", function () {
  let fileActivityLogger: FileActivityLogger;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addr3: any;

  const fileId1 = "file-123";
  const fileId2 = "file-456";

  beforeEach(async function () {
    [owner, addr1, addr2, addr3] = await ethers.getSigners();

    const FileActivityLoggerFactory = await ethers.getContractFactory("FileActivityLogger");
    fileActivityLogger = await FileActivityLoggerFactory.deploy();
    await fileActivityLogger.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await fileActivityLogger.owner()).to.equal(owner.address);
    });

    it("Should set deployed timestamp", async function () {
      const deployedAt = await fileActivityLogger.deployedAt();
      expect(deployedAt).to.be.gt(0);
    });
  });

  describe("File Sharing", function () {
    it("Should log file share successfully", async function () {
      const recipients = [addr1.address, addr2.address];

      await expect(fileActivityLogger.logFileShare(fileId1, owner.address, recipients))
        .to.emit(fileActivityLogger, "FileShared")
        .withArgs(fileId1, owner.address, recipients, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1), await ethers.provider.getBlockNumber() + 1);

      const shares = await fileActivityLogger.getFileShares(fileId1);
      expect(shares.length).to.equal(1);
      expect(shares[0].fileId).to.equal(fileId1);
      expect(shares[0].sender).to.equal(owner.address);
      expect(shares[0].recipients.length).to.equal(2);
      expect(shares[0].recipients[0]).to.equal(addr1.address);
      expect(shares[0].recipients[1]).to.equal(addr2.address);
    });

    it("Should revert when non-owner tries to log share", async function () {
      const recipients = [addr1.address];
      await expect(
        fileActivityLogger.connect(addr1).logFileShare(fileId1, addr2.address, recipients)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert with empty fileId", async function () {
      const recipients = [addr1.address];
      await expect(
        fileActivityLogger.logFileShare("", owner.address, recipients)
      ).to.be.revertedWith("FileId cannot be empty");
    });

    it("Should revert with invalid sender address", async function () {
      const recipients = [addr1.address];
      await expect(
        fileActivityLogger.logFileShare(fileId1, ethers.ZeroAddress, recipients)
      ).to.be.revertedWith("Invalid sender address");
    });

    it("Should revert with empty recipients", async function () {
      await expect(
        fileActivityLogger.logFileShare(fileId1, owner.address, [])
      ).to.be.revertedWith("Must have at least one recipient");
    });

    it("Should revert when sender is also recipient", async function () {
      const recipients = [owner.address, addr1.address];
      await expect(
        fileActivityLogger.logFileShare(fileId1, owner.address, recipients)
      ).to.be.revertedWith("Sender cannot be recipient");
    });

    it("Should handle multiple shares for same file", async function () {
      const recipients1 = [addr1.address];
      const recipients2 = [addr2.address, addr3.address];

      await fileActivityLogger.logFileShare(fileId1, owner.address, recipients1);
      await fileActivityLogger.logFileShare(fileId1, addr1.address, recipients2);

      const shares = await fileActivityLogger.getFileShares(fileId1);
      expect(shares.length).to.equal(2);
      expect(await fileActivityLogger.getShareCount(fileId1)).to.equal(2);
    });
  });

  describe("File Download", function () {
    beforeEach(async function () {
      // Setup: share file first
      const recipients = [addr1.address, addr2.address];
      await fileActivityLogger.logFileShare(fileId1, owner.address, recipients);
    });

    it("Should log file download successfully", async function () {
      await expect(fileActivityLogger.logFileDownload(fileId1, addr1.address))
        .to.emit(fileActivityLogger, "FileDownloaded")
        .withArgs(fileId1, addr1.address, await ethers.provider.getBlock("latest").then(b => b.timestamp + 1), await ethers.provider.getBlockNumber() + 1);

      expect(await fileActivityLogger.hasRecipientDownloaded(fileId1, addr1.address)).to.be.true;
      expect(await fileActivityLogger.hasRecipientDownloaded(fileId1, addr2.address)).to.be.false;
    });

    it("Should revert when non-owner tries to log download", async function () {
      await expect(
        fileActivityLogger.connect(addr1).logFileDownload(fileId1, addr2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });

    it("Should revert with empty fileId", async function () {
      await expect(
        fileActivityLogger.logFileDownload("", addr1.address)
      ).to.be.revertedWith("FileId cannot be empty");
    });

    it("Should revert with invalid recipient address", async function () {
      await expect(
        fileActivityLogger.logFileDownload(fileId1, ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid recipient address");
    });

    it("Should handle multiple downloads for same file", async function () {
      await fileActivityLogger.logFileDownload(fileId1, addr1.address);
      await fileActivityLogger.logFileDownload(fileId1, addr2.address);
      await fileActivityLogger.logFileDownload(fileId1, addr1.address); // Duplicate download

      const downloads = await fileActivityLogger.getFileDownloads(fileId1);
      expect(downloads.length).to.equal(3);
      expect(await fileActivityLogger.getDownloadCount(fileId1)).to.equal(3);
      expect(await fileActivityLogger.hasRecipientDownloaded(fileId1, addr1.address)).to.be.true;
      expect(await fileActivityLogger.hasRecipientDownloaded(fileId1, addr2.address)).to.be.true;
    });
  });

  describe("Query Functions", function () {
    beforeEach(async function () {
      // Setup test data
      await fileActivityLogger.logFileShare(fileId1, owner.address, [addr1.address, addr2.address]);
      await fileActivityLogger.logFileShare(fileId2, addr1.address, [addr2.address]);
      await fileActivityLogger.logFileDownload(fileId1, addr1.address);
      await fileActivityLogger.logFileDownload(fileId1, addr2.address);
      await fileActivityLogger.logFileDownload(fileId2, addr2.address);
    });

    it("Should return correct share count", async function () {
      expect(await fileActivityLogger.getShareCount(fileId1)).to.equal(1);
      expect(await fileActivityLogger.getShareCount(fileId2)).to.equal(1);
      expect(await fileActivityLogger.getShareCount("nonexistent")).to.equal(0);
    });

    it("Should return correct download count", async function () {
      expect(await fileActivityLogger.getDownloadCount(fileId1)).to.equal(2);
      expect(await fileActivityLogger.getDownloadCount(fileId2)).to.equal(1);
      expect(await fileActivityLogger.getDownloadCount("nonexistent")).to.equal(0);
    });

    it("Should return unique download recipients", async function () {
      const recipients = await fileActivityLogger.getDownloadRecipients(fileId1);
      expect(recipients.length).to.equal(2);
      expect(recipients).to.include(addr1.address);
      expect(recipients).to.include(addr2.address);

      const recipients2 = await fileActivityLogger.getDownloadRecipients(fileId2);
      expect(recipients2.length).to.equal(1);
      expect(recipients2[0]).to.equal(addr2.address);
    });

    it("Should return empty arrays for non-existent files", async function () {
      const shares = await fileActivityLogger.getFileShares("nonexistent");
      const downloads = await fileActivityLogger.getFileDownloads("nonexistent");

      expect(shares.length).to.equal(0);
      expect(downloads.length).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should only allow owner to call restricted functions", async function () {
      await expect(
        fileActivityLogger.connect(addr1).logFileShare(fileId1, owner.address, [addr2.address])
      ).to.be.revertedWith("Only owner can call this function");

      await expect(
        fileActivityLogger.connect(addr1).logFileDownload(fileId1, addr2.address)
      ).to.be.revertedWith("Only owner can call this function");
    });
  });
});