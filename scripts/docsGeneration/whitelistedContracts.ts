import assert from "assert";
import fs from "fs";

const contractsWhitelistedForDocs = [
    'transfers/XDCBridgeGate.sol',
    'interfaces/IXDCBridgeGate.sol',

    'transfers/XDCBridgeTokenDeployer.sol',
    'interfaces/IXDCBridgeTokenDeployer.sol',

    'transfers/SignatureVerifier.sol',
    'interfaces/ISignatureVerifier.sol',

    'periphery/CallProxy.sol',
    'interfaces/ICallProxy.sol',

    'libraries/Flags.sol',

    'transfers/OraclesManager.sol',
    'interfaces/IOraclesManager.sol',

    'transfers/WethGate.sol',
    'interfaces/IWethGate.sol',

    'periphery/XDCBridgeToken.sol',
    'interfaces/IXDCBridgeToken.sol',

    'periphery/XDCBridgeTokenProxy.sol',

    'periphery/SimpleFeeProxy.sol',
];

assert(
    (new Set(contractsWhitelistedForDocs)).size === contractsWhitelistedForDocs.length,
    'contractsWhitelistedForDocs has duplicates'
);

const notInterfaceOrLibrary = (path: string) => !path.startsWith('libraries/') && !path.startsWith('interfaces/');
const contractsWhitelistedForReadme = contractsWhitelistedForDocs.filter(notInterfaceOrLibrary);

const toContractPathFromProjectRoot = (path: string) => `contracts/${path}`;
const assertExists = (path: string) => assert(fs.existsSync(path), `${path} does not exist.`);

contractsWhitelistedForDocs
    .map(toContractPathFromProjectRoot)
    .forEach(assertExists)

export {contractsWhitelistedForDocs, contractsWhitelistedForReadme};
