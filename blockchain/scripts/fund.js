const hre = require("hardhat");

async function main() {
    const targetAddress = "0x63E12831dAb770dE14592da03a19aD16f312dc27";

    console.log("Setting balance for account:", targetAddress);

    // Set balance to 1,000,000 ETH
    await hre.network.provider.send("hardhat_setBalance", [
        targetAddress,
        "0xD3C21BCECCEDA1000000", // 1,000,000 ETH in hex
    ]);

    console.log("Successfully set 1,000,000 test ETH!");
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});
