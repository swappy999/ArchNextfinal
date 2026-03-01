// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PropertyAuction
 * @dev AI-Valued, Blockchain-Secured Urban Property Auction Engine
 * - Sellers create timed auctions for PropertyNFT tokens
 * - Bidders send ERC-20 tokens (escrowed in contract)
 * - Anti-sniping: auto-extends by 5 min if bid in last 5 min
 * - Losing bidders can withdraw escrowed tokens
 * - Only seller can finalize after deadline
 */
contract PropertyAuction is ReentrancyGuard {

    address public biddingToken;
    uint256 public auctionCounter;
    uint256 constant ANTI_SNIPE_WINDOW = 5 minutes;
    uint256 constant ANTI_SNIPE_EXTENSION = 5 minutes;

    enum AuctionStatus { Active, Ended, Finalized, Cancelled }

    struct Auction {
        address nftContract;
        uint256 tokenId;
        address seller;
        uint256 reservePrice;
        uint256 highestBid;
        address highestBidder;
        uint256 startTime;
        uint256 endTime;
        AuctionStatus status;
        uint256 bidCount;
        uint256 minBidIncrement;
    }

    // auctionId => Auction
    mapping(uint256 => Auction) public auctions;
    // auctionId => bidder => escrowed amount
    mapping(uint256 => mapping(address => uint256)) public escrowedBids;

    constructor(address _biddingToken) {
        require(_biddingToken != address(0), "Invalid token address");
        biddingToken = _biddingToken;
    }

    // ─── Events ──────────────────────────────────────────────────────────────

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed nftContract,
        uint256 indexed tokenId,
        address seller,
        uint256 reservePrice,
        uint256 endTime
    );

    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount,
        uint256 newEndTime
    );

    event AuctionFinalized(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 winningBid
    );

    event AuctionCancelled(uint256 indexed auctionId);

    event BidWithdrawn(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );

    // ─── Create Auction ──────────────────────────────────────────────────────

    /**
     * @dev Creates a new auction for an NFT.
     * Seller must approve this contract to transfer the NFT first.
     * @param nftContract Address of the PropertyNFT contract
     * @param tokenId Token ID to auction
     * @param reservePrice Minimum acceptable bid in tokens
     * @param duration Auction duration in seconds
     * @param minBidIncrement Minimum increment over previous bid
     */
    function createAuction(
        address nftContract,
        uint256 tokenId,
        uint256 reservePrice,
        uint256 duration,
        uint256 minBidIncrement
    ) external {
        require(reservePrice > 0, "Reserve price must be > 0");
        require(duration >= 1 hours && duration <= 30 days, "Duration: 1h to 30d");
        require(
            IERC721(nftContract).ownerOf(tokenId) == msg.sender,
            "You do not own this token"
        );
        require(
            IERC721(nftContract).getApproved(tokenId) == address(this) ||
            IERC721(nftContract).isApprovedForAll(msg.sender, address(this)),
            "Auction contract not approved"
        );

        // Transfer NFT to this contract for escrow
        IERC721(nftContract).transferFrom(msg.sender, address(this), tokenId);

        uint256 auctionId = auctionCounter;
        auctionCounter++;

        auctions[auctionId] = Auction({
            nftContract: nftContract,
            tokenId: tokenId,
            seller: msg.sender,
            reservePrice: reservePrice,
            highestBid: 0,
            highestBidder: address(0),
            startTime: block.timestamp,
            endTime: block.timestamp + duration,
            status: AuctionStatus.Active,
            bidCount: 0,
            minBidIncrement: minBidIncrement > 0 ? minBidIncrement : reservePrice / 20
        });

        emit AuctionCreated(
            auctionId, nftContract, tokenId, msg.sender,
            reservePrice, block.timestamp + duration
        );
    }

    // ─── Place Bid ───────────────────────────────────────────────────────────

    /**
     * @dev Places a bid on an active auction using ERC-20 tokens.
     * User must approve the auction contract to spend tokens first.
     */
    function placeBid(uint256 auctionId, uint256 amount) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Auction not active");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(msg.sender != auction.seller, "Seller cannot bid");

        // The 'amount' is the EXTRA tokens being added to the existing escrow for this bidder
        uint256 totalBid = escrowedBids[auctionId][msg.sender] + amount;

        if (auction.highestBid == 0) {
            require(totalBid >= auction.reservePrice, "Bid below reserve price");
        } else {
            require(
                totalBid >= auction.highestBid + auction.minBidIncrement,
                "Bid too low (must exceed highest + increment)"
            );
        }

        // Pull tokens from bidder
        IERC20(biddingToken).transferFrom(msg.sender, address(this), amount);

        // Update escrow
        escrowedBids[auctionId][msg.sender] = totalBid;

        auction.highestBid = totalBid;
        auction.highestBidder = msg.sender;
        auction.bidCount++;

        // Anti-sniping: extend if bid placed in last 5 minutes
        if (auction.endTime - block.timestamp < ANTI_SNIPE_WINDOW) {
            auction.endTime += ANTI_SNIPE_EXTENSION;
        }

        emit BidPlaced(auctionId, msg.sender, totalBid, auction.endTime);
    }

    // ─── Finalize Auction ────────────────────────────────────────────────────

    /**
     * @dev Finalizes a completed auction.
     */
    function finalizeAuction(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Not active");
        require(block.timestamp >= auction.endTime, "Auction still running");
        require(msg.sender == auction.seller, "Only seller can finalize");

        auction.status = AuctionStatus.Finalized;

        if (auction.highestBidder != address(0)) {
            // Winner exists: transfer NFT to winner, payment to seller
            uint256 winningAmount = escrowedBids[auctionId][auction.highestBidder];
            escrowedBids[auctionId][auction.highestBidder] = 0;

            // Transfer token payment to seller
            IERC20(biddingToken).transfer(auction.seller, winningAmount);

            // Transfer NFT to winner
            IERC721(auction.nftContract).transferFrom(
                address(this), auction.highestBidder, auction.tokenId
            );

            emit AuctionFinalized(auctionId, auction.highestBidder, winningAmount);
        } else {
            // No bids: return NFT to seller
            IERC721(auction.nftContract).transferFrom(
                address(this), auction.seller, auction.tokenId
            );
            auction.status = AuctionStatus.Cancelled;
            emit AuctionCancelled(auctionId);
        }
    }

    // ─── Cancel Auction ──────────────────────────────────────────────────────

    function cancelAuction(uint256 auctionId) external {
        Auction storage auction = auctions[auctionId];
        require(auction.status == AuctionStatus.Active, "Not active");
        require(msg.sender == auction.seller, "Only seller");
        require(auction.bidCount == 0, "Cannot cancel with bids");

        auction.status = AuctionStatus.Cancelled;

        IERC721(auction.nftContract).transferFrom(
            address(this), auction.seller, auction.tokenId
        );

        emit AuctionCancelled(auctionId);
    }

    // ─── Withdraw Bid ────────────────────────────────────────────────────────

    function withdrawBid(uint256 auctionId) external nonReentrant {
        Auction storage auction = auctions[auctionId];

        if (auction.status == AuctionStatus.Active) {
            require(
                msg.sender != auction.highestBidder,
                "Highest bidder cannot withdraw during active auction"
            );
        }

        uint256 amount = escrowedBids[auctionId][msg.sender];
        require(amount > 0, "No funds to withdraw");

        escrowedBids[auctionId][msg.sender] = 0;
        IERC20(biddingToken).transfer(msg.sender, amount);

        emit BidWithdrawn(auctionId, msg.sender, amount);
    }

    // ─── View Functions ──────────────────────────────────────────────────────

    function getAuction(uint256 auctionId) external view returns (
        address nftContract, uint256 tokenId, address seller,
        uint256 reservePrice, uint256 highestBid, address highestBidder,
        uint256 startTime, uint256 endTime, AuctionStatus status,
        uint256 bidCount, uint256 minBidIncrement
    ) {
        Auction memory a = auctions[auctionId];
        return (
            a.nftContract, a.tokenId, a.seller,
            a.reservePrice, a.highestBid, a.highestBidder,
            a.startTime, a.endTime, a.status,
            a.bidCount, a.minBidIncrement
        );
    }

    function getEscrowedBid(uint256 auctionId, address bidder) external view returns (uint256) {
        return escrowedBids[auctionId][bidder];
    }

    function isAuctionActive(uint256 auctionId) external view returns (bool) {
        Auction memory a = auctions[auctionId];
        return a.status == AuctionStatus.Active && block.timestamp < a.endTime;
    }

    function getTimeRemaining(uint256 auctionId) external view returns (uint256) {
        Auction memory a = auctions[auctionId];
        if (block.timestamp >= a.endTime) return 0;
        return a.endTime - block.timestamp;
    }
}
