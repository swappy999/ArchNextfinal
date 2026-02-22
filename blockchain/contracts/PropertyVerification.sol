// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title PropertyVerification
 * @dev Immutable on-chain property verification registry.
 * Only stores a hash — never raw property data.
 */
contract PropertyVerification {

    struct VerifiedProperty {
        string propertyHash;
        address verifiedBy;
        uint256 timestamp;
    }

    // propertyHash => VerifiedProperty
    mapping(string => VerifiedProperty) public properties;

    event PropertyVerified(string indexed propertyHash, address verifiedBy, uint256 timestamp);

    /**
     * @dev Verifies a property by storing its hash on-chain.
     * @param _hash SHA-256 hash of the property data
     */
    function verifyProperty(string memory _hash) public {
        require(bytes(_hash).length > 0, "Hash cannot be empty");
        require(bytes(properties[_hash].propertyHash).length == 0, "Property already verified");

        properties[_hash] = VerifiedProperty({
            propertyHash: _hash,
            verifiedBy: msg.sender,
            timestamp: block.timestamp
        });

        emit PropertyVerified(_hash, msg.sender, block.timestamp);
    }

    /**
     * @dev Checks if a property hash is verified on-chain.
     */
    function isVerified(string memory _hash) public view returns (bool) {
        return bytes(properties[_hash].propertyHash).length > 0;
    }

    /**
     * @dev Returns verification details for a property hash.
     */
    function getVerification(string memory _hash) public view returns (
        string memory propertyHash,
        address verifiedBy,
        uint256 timestamp
    ) {
        VerifiedProperty memory p = properties[_hash];
        return (p.propertyHash, p.verifiedBy, p.timestamp);
    }
}
