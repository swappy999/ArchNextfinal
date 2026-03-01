const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Seeding with account:", deployer.address);

    const nftPath = path.join(__dirname, "../../backend/contracts/nft_address.txt");
    const marketplacePath = path.join(__dirname, "../../backend/contracts/marketplace_address.txt");

    const nftAddress = fs.readFileSync(nftPath, "utf8").trim();
    const marketplaceAddress = fs.readFileSync(marketplacePath, "utf8").trim();

    const PropertyNFT = await hre.ethers.getContractAt("PropertyNFT", nftAddress);
    const PropertyMarketplace = await hre.ethers.getContractAt("PropertyMarketplace", marketplaceAddress);

    const listPrice = hre.ethers.parseEther("0.1");

    console.log("Minting & Listing 20 properties...");
    for (let i = 0; i < 20; i++) {
        // 1. Mint
        const tx = await PropertyNFT.mintProperty(
            deployer.address,
            `hash_${i}_${Date.now()}`,
            `db_id_${i}`
        );
        await tx.wait();

        // 2. Approve Marketplace
        const approveTx = await PropertyNFT.approve(marketplaceAddress, i);
        await approveTx.wait();

        // 3. List
        const listTx = await PropertyMarketplace.listProperty(nftAddress, i, listPrice);
        await listTx.wait();

        console.log(`Listed Token ID ${i} for 0.1 MATIC`);
    }

    console.log("Seeding complete!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
