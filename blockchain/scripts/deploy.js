const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const PropertyVerification = await hre.ethers.getContractFactory("PropertyVerification");
  const contract = await PropertyVerification.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("PropertyVerification deployed to:", address);

  // Save ABI + address for backend
  const fs = require("fs");
  const artifact = await hre.artifacts.readArtifact("PropertyVerification");

  fs.writeFileSync(
    "../backend/contract_abi.json",
    JSON.stringify(artifact.abi, null, 2)
  );
  fs.writeFileSync(
    "../backend/contract_address.txt",
    address
  );

  console.log("ABI saved to backend/contract_abi.json");
  console.log("Address saved to backend/contract_address.txt");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
