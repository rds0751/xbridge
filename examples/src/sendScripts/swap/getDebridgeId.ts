import {AddressZero} from "@ethersproject/constants";
import logger from "./logger";
import {XDCBridgeGate} from "../../../../typechain-types-web3/XDCBridgeGate";

export default async function getXbridgeId(
    xdcBridgeGateFrom: XDCBridgeGate,
    xdcBridgeGateTo: XDCBridgeGate,
    tokenNativeChainId: number,
    tokenAddressOnNativeChain: string
): Promise<string> {
    const isMainTokenRequested = tokenAddressOnNativeChain === AddressZero;
    const addressToUseForXbridgeId = isMainTokenRequested
        ? await xdcBridgeGateFrom.methods.weth().call()
        : tokenAddressOnNativeChain;

    logger.info(`Address to use for xbridge id`, addressToUseForXbridgeId);

    return xdcBridgeGateTo.methods.getXbridgeId(tokenNativeChainId, addressToUseForXbridgeId).call();
}
