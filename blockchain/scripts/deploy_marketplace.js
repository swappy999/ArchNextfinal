const hre = require("hardhat");
const fs = require("fs");

async function main() {
    const [deployer] = await hre.ethers.getSigners();
    console.log("Deploying PropertyMarketplace with account:", deployer.address);

    const PropertyMarketplace = await hre.ethers.getContractFactory("PropertyMarketplace");
    const contract = await PropertyMarketplace.deploy();
    await contract.waitForDeployment();

    const address = await contract.getAddress();
    console.log("PropertyMarketplace deployed to:", address);

    const artifact = await hre.artifacts.readArtifact("PropertyMarketplace");

    fs.writeFileSync(
        "../backend/marketplace_abi.json",
        JSON.stringify(artifact.abi, null, 2)
    );
    fs.writeFileSync(
        "../backend/marketplace_address.txt",
        address
    );

    console.log("Marketplace ABI saved to backend/marketplace_abi.json");
    console.log("Marketplace address saved to backend/marketplace_address.txt");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
