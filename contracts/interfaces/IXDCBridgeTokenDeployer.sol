// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

interface IXDCBridgeTokenDeployer {

    /// @dev Deploy a deToken(XDCBridgeTokenProxy) for an asset
    /// @param _xbridgeId Asset id, see XDCBridgeGate.getXbridgeId
    /// @param _name The asset's name
    /// @param _symbol The asset's symbol
    /// @param _decimals The asset's decimals
    function deployAsset(
        bytes32 _xbridgeId,
        string memory _name,
        string memory _symbol,
        uint8 _decimals
    ) external returns (address deTokenAddress);

    /// @dev Emitted when a deToken(XDCBridgeTokenProxy) is deployed using this contract
    event XDCBridgeTokenDeployed(
        address asset,
        string name,
        string symbol,
        uint8 decimals
    );
}
