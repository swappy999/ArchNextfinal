// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PropertyBiddingToken
 * @dev ERC-20 token for bidding in the ArchNext Auction Marketplace.
 * This is used for escrow and decentralized payment in the auction flow.
 */
contract PropertyBiddingToken is ERC20, Ownable {
    constructor() ERC20("ArchNext Bidding Token", "ARCH") Ownable(msg.sender) {
        // Mint 1 billion tokens to the owner for distribution/testing
        _mint(msg.sender, 1000000000 * 10 ** decimals());
    }

    /**
     * @dev Function to mint more tokens if needed (only by owner).
     */
    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
