// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../transfers/XDCBridgeGate.sol";

contract MockXDCBridgeGateForDefiController is XDCBridgeGate {
    function init() external {
        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    function sendETH() external payable {}

    function addXbridge(
        address tokenAddress,
        uint256 chainId,
        uint256 maxAmount,
        uint256 collectedFees,
        uint256 balance,
        uint256 lockedInStrategies,
        uint16 minReservesBps,
        uint256 chainFee,
        bool exist
    ) public {
        bytes32 xbridgeId = getXbridgeId(chainId, tokenAddress);
        XbridgeInfo storage xbridge = getXbridge[xbridgeId];
        xbridge.tokenAddress = tokenAddress;
        xbridge.maxAmount = maxAmount;
        getXbridgeFeeInfo[xbridgeId].collectedFees = collectedFees;
        xbridge.balance = balance;
        xbridge.lockedInStrategies = lockedInStrategies;
        xbridge.minReservesBps = minReservesBps;
        getXbridgeFeeInfo[xbridgeId].getChainFee[chainId] = chainFee;
        xbridge.exist = exist;
    }

    // override chain id
    function getChainId() public pure override returns (uint256 cid) {
        return 1;
    }
}
