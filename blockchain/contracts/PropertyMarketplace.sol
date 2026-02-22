// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PropertyMarketplace
 * @dev Trustless decentralized marketplace for PropertyNFT tokens.
 * - Sellers list their NFT with a price
 * - Buyers send MATIC/ETH → payment goes to seller, NFT transfers automatically
 * - No backend trust required — all logic is on-chain
 */
contract PropertyMarketplace is ReentrancyGuard {

    struct Listing {
        address seller;
        uint256 price;
        bool active;
    }

    // nftContract => tokenId => Listing
    mapping(address => mapping(uint256 => Listing)) public listings;

    // ─── Events ──────────────────────────────────────────────────────────────
    event PropertyListed(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price
    );

    event PropertySold(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed buyer,
        address seller,
        uint256 price
    );

    event ListingCancelled(
        address indexed nftContract,
        uint256 indexed tokenId,
        address indexed seller
    );

    // ─── List Property ───────────────────────────────────────────────────────
    /**
     * @dev Lists a property NFT for sale.
     * Seller must call nftContract.approve(marketplaceAddress, tokenId) first.
     * @param nftContract Address of the PropertyNFT contract
     * @param tokenId Token ID to list
     * @param price Sale price in wei (MATIC)
     */
    function listProperty(
        address nftContract,
        uint256 tokenId,
        uint256 price
    ) external {
        require(price > 0, "Price must be greater than zero");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You do not own this token"
        );
        require(
            IERC721(nftContract).getApproved(tokenId) == address(this) ||
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)),
            "Marketplace not approved to transfer this token"
        );

        listings[nftContract][tokenId] = Listing({
            seller: msg.sender,
            price: price,
            active: true
        });

        emit PropertyListed(nftContract, tokenId, msg.sender, price);
    }

    // ─── Buy Property ────────────────────────────────────────────────────────
    /**
     * @dev Buys a listed property NFT.
     * Buyer sends MATIC → payment goes to seller, NFT transfers to buyer.
     */
    function buyProperty(
        address nftContract,
        uint256 tokenId
    ) external payable nonReentrant {
        Listing memory item = listings[nftContract][tokenId];

        require(item.active, "Property is not listed for sale");
        require(msg.value >= item.price, "Insufficient payment");
        require(msg.sender != item.seller, "Seller cannot buy own listing");

        // Remove listing before transfer (reentrancy protection)
        delete listings[nftContract][tokenId];

        // Transfer payment to seller
        payable(item.seller).transfer(msg.value);

        // Transfer NFT to buyer
        IERC721(nftContract).transferFrom(item.seller, msg.sender, tokenId);

        emit PropertySold(nftContract, tokenId, msg.sender, item.seller, msg.value);
    }

    // ─── Cancel Listing ──────────────────────────────────────────────────────
    /**
     * @dev Cancels an active listing. Only the seller can cancel.
     */
    function cancelListing(address nftContract, uint256 tokenId) external {
        Listing memory item = listings[nftContract][tokenId];
        require(item.active, "No active listing");
        require(item.seller == msg.sender, "Only seller can cancel");

        delete listings[nftContract][tokenId];

        emit ListingCancelled(nftContract, tokenId, msg.sender);
    }

    // ─── View Functions ──────────────────────────────────────────────────────
    /**
     * @dev Returns listing details for a token.
     */
    function getListing(address nftContract, uint256 tokenId)
        external view returns (address seller, uint256 price, bool active)
    {
        Listing memory l = listings[nftContract][tokenId];
        return (l.seller, l.price, l.active);
    }
}
