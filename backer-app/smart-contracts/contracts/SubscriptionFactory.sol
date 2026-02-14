// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/proxy/Clones.sol";
import "./SubscriptionContract.sol";

contract SubscriptionFactory {
    using Clones for address;

    address public immutable implementation;
    mapping(address => address[]) public creatorContracts;
    address public platformTreasury;
    address public dex; // Address of the Stablecoin DEX

    event ProfileCreated(address indexed creator, address profileAddress);

    constructor(address _implementation, address _platformTreasury, address _dex) {
        implementation = _implementation;
        platformTreasury = _platformTreasury;
        dex = _dex;
    }

    function createProfile(address _paymentToken) external returns (address) {
        address clone = implementation.clone();
        SubscriptionContract(clone).initialize(msg.sender, _paymentToken, platformTreasury, dex);
        
        creatorContracts[msg.sender].push(clone);
        emit ProfileCreated(msg.sender, clone);
        
        return clone;
    }

    function getCreatorProfiles(address _creator) external view returns (address[] memory) {
        return creatorContracts[_creator];
    }

    function getProfile(address _creator) external view returns (address) {
        if (creatorContracts[_creator].length > 0) {
            return creatorContracts[_creator][0];
        }
        return address(0);
    }
}
