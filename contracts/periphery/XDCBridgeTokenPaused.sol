// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.7;

import "../periphery/XDCBridgeToken.sol";

/// @dev Variation of XDCBridgeToken contract with paused token transfers.
contract XDCBridgeTokenPaused is XDCBridgeToken {

    function _beforeTokenTransfer(
        address /* from */,
        address /* to */,
        uint256 /* amount */
    ) internal virtual override {
        revert("XDCBridgeToken paused");
    }
}
