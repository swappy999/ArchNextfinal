// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyNFT
 * @dev ERC721 NFT representing real estate property ownership.
 * Each token = one unique property. Ownership is transferable via MetaMask.
 * Only property metadata hash is stored on-chain — never raw data.
 */
contract PropertyNFT is ERC721, Ownable {

    uint256 public tokenCounter;

    // tokenId => SHA-256 hash of property data
    mapping(uint256 => string) public propertyHashes;

    // tokenId => MongoDB property ID (off-chain reference)
    mapping(uint256 => string) public propertyIds;

    // propertyHash => tokenId (for reverse lookup)
    mapping(string => uint256) public hashToToken;

    event PropertyMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string propertyHash,
        string propertyId
    );

    constructor() ERC721("SmartCityProperty", "SCP") Ownable(msg.sender) {}

    /**
     * @dev Mints a new property NFT.
     * @param owner Wallet address of the property owner
     * @param propertyHash SHA-256 hash of the property data
     * @param propertyId MongoDB document ID (off-chain reference)
     */
    function mintProperty(
        address owner,
        string memory propertyHash,
        string memory propertyId
    ) public onlyOwner returns (uint256) {
        require(bytes(propertyHash).length > 0, "Hash required");
        require(bytes(propertyHashes[hashToToken[propertyHash]]).length == 0, "Already minted");

        uint256 tokenId = tokenCounter;

        _safeMint(owner, tokenId);

        propertyHashes[tokenId] = propertyHash;
        propertyIds[tokenId] = propertyId;
        hashToToken[propertyHash] = tokenId;

        tokenCounter++;

        emit PropertyMinted(tokenId, owner, propertyHash, propertyId);

        return tokenId;
    }

    /**
     * @dev Returns full property token info.
     */
    function getPropertyToken(uint256 tokenId) public view returns (
        address owner,
        string memory propertyHash,
        string memory propertyId
    ) {
        return (
            ownerOf(tokenId),
            propertyHashes[tokenId],
            propertyIds[tokenId]
        );
    }

    /**
     * @dev Checks if a property hash has been minted as an NFT.
     */
    function isMinted(string memory propertyHash) public view returns (bool) {
        uint256 tokenId = hashToToken[propertyHash];
        return bytes(propertyHashes[tokenId]).length > 0;
    }
}
