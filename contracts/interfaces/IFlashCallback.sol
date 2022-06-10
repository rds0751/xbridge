// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

/// @title Callback for IXDCBridgeGate#flash
/// @notice Any contract that calls IXDCBridgeGate#flash must implement this interface
interface IFlashCallback {
    /// @param fee The fee amount in token due to the pool by the end of the flash
    /// @param data Any data passed through by the caller via the IXDCBridgeGate#flash call
    function flashCallback(uint256 fee, bytes calldata data) external;
}
