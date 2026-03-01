require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config({ path: "../backend/.env" });

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
    solidity: "0.8.20",
    networks: {
        mui: {
            url: process.env.POLYGON_RPC || "https://polygon-amoy-bor-rpc.publicnode.com",
            accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
        },
        hardhat: {
            chainId: 1337
        },
        localhost: {
            url: "http://127.0.0.1:8545",
            chainId: 1337,
        },
    },
};
