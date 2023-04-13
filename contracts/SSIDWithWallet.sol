// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract SSIDWithWallet {
    struct Identity {
        uint256 id;
        string name;
        string email;
        uint256 dob;
        address wallet;
        uint256[] certificationIDs;
    }

    struct Certification {
        uint256 id;
        string name;
        uint256 issueDate;
        bool verified;
    }

    mapping(address => Identity) private identities;
    mapping(uint256 => Certification) private certifications;

    event IdentityCreated(address indexed owner, uint256 id);
    event CertificationIssued(uint256 indexed certificationID, uint256 indexed identityID);

    function createIdentity(string memory name, string memory email, uint256 dob) public {
        
        Identity storage newIdentity = identities[msg.sender];
        newIdentity.id = block.timestamp;
        newIdentity.name = name;
        newIdentity.email = email;
        newIdentity.dob = dob;
        newIdentity.wallet = address(new Wallet(msg.sender));

        emit IdentityCreated(msg.sender, newIdentity.id);
    }

    function issueCertification(
        uint256 identityID,
        string memory name,
        uint256 issueDate,
        bool verified
    ) public {
        Identity storage identity = identities[msg.sender];
        require(identity.id == identityID, "Invalid Identity");

        uint256 certificationID = block.timestamp;
        Certification storage certification = certifications[certificationID];
        certification.id = certificationID;
        certification.name = name;
        certification.issueDate = issueDate;
        certification.verified = verified;

        identity.certificationIDs.push(certificationID);

        emit CertificationIssued(certificationID, identityID);
    }

    function verifyCertification(uint256 certificationID) public view returns (bool) {
        Certification memory certification = certifications[certificationID];
        return certification.verified;
    }

    function getIdentity(uint256 providedId) public view returns (Identity memory) {
        Identity memory storedIdentity = identities[msg.sender];
        require(storedIdentity.id == providedId, "Provided SSID does not match the stored SSID");
        return storedIdentity;
    }
}

contract Wallet {
    using SafeERC20 for IERC20;

    address private owner;

    constructor(address _owner) {
        owner = _owner;
    }

    function transfer(address to, uint256 amount, IERC20 token) external {
        require(msg.sender == owner, "Only owner can transfer");
        token.safeTransfer(to, amount);
    }

    function getOwner() external view returns (address) {
        return owner;
    }
}
