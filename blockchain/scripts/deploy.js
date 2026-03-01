const hre = require("hardhat");
const fs = require("fs");
const path = require("path");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Current balance:", hre.ethers.formatEther(balance), "POL");

  if (balance === 0n) {
    throw new Error("Account has 0 balance. Please fund your wallet.");
  }

  const feeData = await hre.ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice;
  console.log("Using gas price:", gasPrice.toString(), "Wei");

  // 1. Deploy PropertyNFT
  console.log("Deploying PropertyNFT...");
  const PropertyNFT = await hre.ethers.getContractFactory("PropertyNFT");
  const nft = await PropertyNFT.deploy({ gasPrice: gasPrice });
  await nft.waitForDeployment();
  const nftAddress = await nft.getAddress();
  console.log("PropertyNFT deployed to:", nftAddress);

  const balanceAfterNft = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Balance after NFT deployment:", hre.ethers.formatEther(balanceAfterNft), "POL");

  // 2. Deploy PropertyMarketplace
  console.log("Deploying PropertyMarketplace...");
  const PropertyMarketplace = await hre.ethers.getContractFactory("PropertyMarketplace");
  const marketplace = await PropertyMarketplace.deploy({ gasPrice: gasPrice });
  await marketplace.waitForDeployment();
  const marketplaceAddress = await marketplace.getAddress();
  console.log("PropertyMarketplace deployed to:", marketplaceAddress);

  const finalBalance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Final balance:", hre.ethers.formatEther(finalBalance), "POL");

  // 3. Save ABIs and Addresses
  function saveFrontendFiles(contractName, address) {
    const contractsDir = path.join(__dirname, "../../frontend/contracts");
    if (!fs.existsSync(contractsDir)) {
      fs.mkdirSync(contractsDir, { recursive: true });
    }
    fs.writeFileSync(
      path.join(contractsDir, `${contractName}-address.json`),
      JSON.stringify({ address }, undefined, 2)
    );
    const artifact = hre.artifacts.readArtifactSync(contractName);
    fs.writeFileSync(
      path.join(contractsDir, `${contractName}.json`),
      JSON.stringify(artifact, null, 2)
    );
  }

  saveFrontendFiles("PropertyNFT", nftAddress);
  saveFrontendFiles("PropertyMarketplace", marketplaceAddress);

  // Save for backend
  const backendDir = path.join(__dirname, "../../backend/contracts");
  if (!fs.existsSync(backendDir)) fs.mkdirSync(backendDir, { recursive: true });
  fs.writeFileSync(path.join(backendDir, "nft_address.txt"), nftAddress);
  fs.writeFileSync(path.join(backendDir, "marketplace_address.txt"), marketplaceAddress);

  console.log("Artifacts successfully saved to frontend and backend!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
