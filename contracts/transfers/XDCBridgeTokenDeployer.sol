// SPDX-License-Identifier: BUSL-1.1
pragma solidity 0.8.7;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts-upgradeable/access/AccessControlUpgradeable.sol";

import "../interfaces/IXDCBridgeTokenDeployer.sol";
import "../periphery/XDCBridgeToken.sol";
import "../periphery/XDCBridgeTokenProxy.sol";

/// @dev Deploys a deToken(XDCBridgeTokenProxy) for an asset.
contract XDCBridgeTokenDeployer is
    Initializable,
    AccessControlUpgradeable,
    IXDCBridgeTokenDeployer
{

    /* ========== STATE VARIABLES ========== */

    /// @dev Address of xdcBridgeToken implementation
    address public tokenImplementation;
    /// @dev An addres to set as admin for any deployed xdcBridgeToken
    address public xdcBridgeTokenAdmin;
    /// @dev Xbridge gate address
    address public xbridgeAddress;
    /// @dev Maps xbridge id to xdcBridgeToken address
    mapping(bytes32 => address) public getDeployedAssetAddress;
    /// @dev Maps xbridge id to overridden token info (name, symbol). Used when autogenerated
    /// values for a token are not ideal.
    mapping(bytes32 => OverridedTokenInfo) public overridedTokens;

    /* ========== STRUCTS ========== */

    struct OverridedTokenInfo {
        bool accept;
        string name;
        string symbol;
    }

    /* ========== ERRORS ========== */

    error WrongArgument();
    error DeployedAlready();

    error AdminBadRole();
    error XDCBridgeGateBadRole();


    /* ========== MODIFIERS ========== */

    modifier onlyAdmin() {
        if (!hasRole(DEFAULT_ADMIN_ROLE, msg.sender)) revert AdminBadRole();
        _;
    }

    modifier onlyXDCBridgeGate() {
        if (msg.sender != xbridgeAddress) revert XDCBridgeGateBadRole();
        _;
    }


    /* ========== CONSTRUCTOR  ========== */

    /// @dev Constructor that initializes the most important configurations.
    /// @param _tokenImplementation Address of xdcBridgeToken implementation
    /// @param _xdcBridgeTokenAdmin Address to set as admin for any deployed xdcBridgeToken
    /// @param _xbridgeAddress XDCBridge gate address
    function initialize(
        address _tokenImplementation,
        address _xdcBridgeTokenAdmin,
        address _xbridgeAddress
    ) public initializer {
        tokenImplementation = _tokenImplementation;
        xdcBridgeTokenAdmin = _xdcBridgeTokenAdmin;
        xbridgeAddress = _xbridgeAddress;

        _setupRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }

    /// @dev Deploy a deToken for an asset
    /// @param _xbridgeId Asset identifier
    /// @param _name Asset name
    /// @param _symbol Asset symbol
    /// @param _decimals Asset decimals
    function deployAsset(
        bytes32 _xbridgeId,
        string memory _name,
        string memory _symbol,
        uint8 _decimals)
        external
        override
        onlyXDCBridgeGate
        returns (address xdcBridgeTokenAddress)
    {
        if (getDeployedAssetAddress[_xbridgeId] != address(0)) revert DeployedAlready();

        OverridedTokenInfo memory overridedToken = overridedTokens[_xbridgeId];
        if (overridedToken.accept) {
            _name = overridedToken.name;
            _symbol = overridedToken.symbol;
        }

        address[] memory minters = new address[](1);
        minters[0] = xbridgeAddress;

        // Initialize args
        bytes memory initialisationArgs = abi.encodeWithSelector(
            XDCBridgeToken.initialize.selector,
            _name,
            _symbol,
            _decimals,
            xdcBridgeTokenAdmin,
            minters
        );

        // initialize Proxy
        bytes memory constructorArgs = abi.encode(address(this), initialisationArgs);

        // deployment code
        bytes memory bytecode = abi.encodePacked(type(XDCBridgeTokenProxy).creationCode, constructorArgs);

        assembly {
            // xbridgeId is a salt
            xdcBridgeTokenAddress := create2(0, add(bytecode, 0x20), mload(bytecode), _xbridgeId)

            if iszero(extcodesize(xdcBridgeTokenAddress)) {
                revert(0, 0)
            }
        }

        getDeployedAssetAddress[_xbridgeId] = xdcBridgeTokenAddress;
        emit XDCBridgeTokenDeployed(
            xdcBridgeTokenAddress,
            _name,
            _symbol,
            _decimals
        );
    }

    /// @dev Beacon getter for the xdcBridgeToken contracts
    function implementation() public view returns (address) {
        return tokenImplementation;
    }


    /* ========== ADMIN ========== */

    /// @dev Set xdcBridgeToken implementation contract address
    /// @param _impl Wrapped asset implementation contract address.
    function setTokenImplementation(address _impl) external onlyAdmin {
        if (_impl == address(0)) revert WrongArgument();
        tokenImplementation = _impl;
    }

    /// @dev Set admin for any deployed xdcBridgeToken.
    /// @param _xdcBridgeTokenAdmin Admin address.
    function setXDCBridgeTokenAdmin(address _xdcBridgeTokenAdmin) external onlyAdmin {
        if (_xdcBridgeTokenAdmin == address(0)) revert WrongArgument();
        xdcBridgeTokenAdmin = _xdcBridgeTokenAdmin;
    }

    /// @dev Sets core xbridge contract address.
    /// @param _xbridgeAddress Xbridge address.
    function setXbridgeAddress(address _xbridgeAddress) external onlyAdmin {
        if (_xbridgeAddress == address(0)) revert WrongArgument();
        xbridgeAddress = _xbridgeAddress;
    }

    /// @dev Override specific tokens name/symbol
    /// @param _xbridgeIds Array of xbridgeIds for tokens
    /// @param _tokens Array of new name/symbols for tokens
    function setOverridedTokenInfo (
        bytes32[] memory _xbridgeIds,
        OverridedTokenInfo[] memory _tokens
    ) external onlyAdmin {
        if (_xbridgeIds.length != _tokens.length) revert WrongArgument();
        for (uint256 i = 0; i < _xbridgeIds.length; i++) {
            overridedTokens[_xbridgeIds[i]] = _tokens[i];
        }
    }

    // ============ Version Control ============
    /// @dev Get this contract's version
    function version() external pure returns (uint256) {
        return 110; // 1.1.0
    }
}
