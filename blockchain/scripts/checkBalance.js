const hre = require("hardhat");

async function main() {
    const targetAddress = "0x63E12831dAb770dE14592da03a19aD16f312dc27";
    const balance = await hre.ethers.provider.getBalance(targetAddress);
    console.log(`Balance of ${targetAddress}: ${hre.ethers.formatEther(balance)} ETH`);
}

main().catch(console.error);
