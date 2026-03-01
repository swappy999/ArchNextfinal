const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    // We are going to use Account 1: 0x70997970C51812dc3A010C7d01b50e0d17dc79C8
    // Note: Account 0 is the deployer, so Account 1 is the first buyer
    const signers = await hre.ethers.getSigners();
    const buyer = signers[1];
    console.log("Initiating purchase with Buyer Account:", buyer.address);

    const marketplacePath = path.join(__dirname, "../../backend/contracts/marketplace_address.txt");
    const nftPath = path.join(__dirname, "../../backend/contracts/nft_address.txt");

    const marketplaceAddress = fs.readFileSync(marketplacePath, "utf8").trim();
    const nftAddress = fs.readFileSync(nftPath, "utf8").trim();

    const PropertyMarketplace = await hre.ethers.getContractAt("PropertyMarketplace", marketplaceAddress);

    // Let's buy Token ID 0 (the first listed property)
    const tokenIdToBuy = 0;
    const priceWei = hre.ethers.parseEther("0.1");

    console.log(`Purchasing Token ID ${tokenIdToBuy} on behalf of ${buyer.address} for 0.1 ETH...`);

    const tx = await PropertyMarketplace.connect(buyer).buyProperty(nftAddress, tokenIdToBuy, {
        value: priceWei
    });

    console.log("Transaction sent! Waiting for confirmation...");
    await tx.wait();

    console.log("✅ Purchase Successful! Token ID 0 is now owned by Account 1.");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
