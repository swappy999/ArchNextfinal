const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying PropertyNFT with account:", deployer.address);

    const PropertyNFT = await hre.ethers.getContractFactory("PropertyNFT");
    const contract = await PropertyNFT.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("PropertyNFT deployed to:", address);

    // Save ABI + address to backend
    const artifact = await hre.artifacts.readArtifact("PropertyNFT");

    fs.writeFileSync(
        "../backend/property_nft_abi.json",
        JSON.stringify(artifact.abi, null, 2)
    );
    fs.writeFileSync(
        "../backend/property_nft_address.txt",
        address
    );

    console.log("NFT ABI saved to backend/property_nft_abi.json");
    console.log("NFT Address saved to backend/property_nft_address.txt");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
