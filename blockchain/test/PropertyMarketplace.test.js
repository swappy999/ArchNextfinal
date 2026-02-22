const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("PropertyMarketplace", function () {
    let marketplace, nft, owner, seller, buyer;

    beforeEach(async function () {
        [owner, seller, buyer] = await ethers.getSigners();

        // Deploy NFT
        const PropertyNFT = await ethers.getContractFactory("PropertyNFT");
        nft = await PropertyNFT.deploy();

        // Deploy Marketplace
        const PropertyMarketplace = await ethers.getContractFactory("PropertyMarketplace");
        marketplace = await PropertyMarketplace.deploy();
    });

    it("Should list and buy property", async function () {
        // 1. Mint NFT to seller (minted by contract owner)
        await nft.connect(owner).mintProperty(seller.address, "hash_123", "prop_123");
        const tokenId = 0;

        // 2. Approve marketplace
        await nft.connect(seller).setApprovalForAll(await marketplace.getAddress(), true);

        // 3. List property
        const price = ethers.parseEther("1");
        await marketplace.connect(seller).listProperty(await nft.getAddress(), tokenId, price);

        // 4. Buy property
        await marketplace.connect(buyer).buyProperty(await nft.getAddress(), tokenId, { value: price });

        // 5. Verify ownership transfer
        expect(await nft.ownerOf(tokenId)).to.equal(buyer.address);
    });
});
