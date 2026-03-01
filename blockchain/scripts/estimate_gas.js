const hre = require("hardhat");

async function main() {
    const PropertyNFT = await hre.ethers.getContractFactory("PropertyNFT");
    const nftDeployment = await PropertyNFT.getDeployTransaction();
    const nftGas = await hre.ethers.provider.estimateGas(nftDeployment);
    console.log("Estimated Gas for PropertyNFT:", nftGas.toString());

    const PropertyMarketplace = await hre.ethers.getContractFactory("PropertyMarketplace");
    const marketplaceDeployment = await PropertyMarketplace.getDeployTransaction();
    const marketplaceGas = await hre.ethers.provider.estimateGas(marketplaceDeployment);
    console.log("Estimated Gas for PropertyMarketplace:", marketplaceGas.toString());

    const feeData = await hre.ethers.provider.getFeeData();
    const gasPrice = feeData.gasPrice;
    console.log("Current Gas Price (Wei):", gasPrice.toString());

    const totalGas = nftGas + marketplaceGas;
    const totalCostWei = totalGas * gasPrice;
    const totalCostEth = hre.ethers.formatEther(totalCostWei);
    console.log("Total Estimated Cost (POL):", totalCostEth);
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
