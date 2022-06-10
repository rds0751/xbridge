// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import "../interfaces/IXDCBridgeGate.sol";

contract MockExternalContract {

    function readIsSubmissionUsed(
        IXDCBridgeGate _gate,
        bytes32 _xbridgeId
    ) external returns (bool) {
        return _gate.isSubmissionUsed(_xbridgeId);
    }
}
