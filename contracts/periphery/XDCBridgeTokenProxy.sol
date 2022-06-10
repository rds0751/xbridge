// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.7;

import "@openzeppelin/contracts/proxy/beacon/BeaconProxy.sol";

/// @dev This contract implements a proxy that gets the implementation address for each call
/// from XDCBridgeTokenDeployer. It's deployed by XDCBridgeTokenDeployer.
/// Implementation is XDCBridgeToken.
contract XDCBridgeTokenProxy is BeaconProxy {
    constructor(address beacon, bytes memory data) BeaconProxy(beacon, data) {

    }
}
