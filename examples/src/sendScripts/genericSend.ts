import {Logger} from "log4js";
import Web3 from "web3";
import {XDCBridgeGate} from "../../../typechain-types-web3/XDCBridgeGate";

export type GateSendArguments = {
    tokenAddress: string, //address _tokenAddress,
    amount: string, // uint256 _amount,
    chainIdTo: number, //uint256 _chainIdTo,
    receiver: string, // bytes memory _receiver,
    permit?: string, //bytes memory _permit,
    useAssetFee?: boolean, //bool _useAssetFee,
    referralCode?: number, //uint32 _referralCode,
    autoParams?: string,// bytes calldata _autoParams
}

export type TsSendArguments = {
    logger: Logger,
    web3: Web3,
    senderPrivateKey: string,
    xbridgeGateInstance: XDCBridgeGate,
    xbridgeGateAddress: string,
    value: string,
    gateSendArguments: GateSendArguments,
};

const gateSendDefaultNotRequiredValue = {
    permit: '0x',
    useAssetFee: false,
    referralCode: 0,
    autoParams: '0x',
}

export default async function send({
    logger,
    web3,
    senderPrivateKey,
    value,
    xbridgeGateInstance,
    xbridgeGateAddress,
    gateSendArguments
}: TsSendArguments) {
    logger.info("Sending");
    logger.info(gateSendArguments);

    const senderAddress = web3.eth.accounts.privateKeyToAccount(senderPrivateKey).address;
    const nonce = await web3.eth.getTransactionCount(senderAddress);
    logger.info("Nonce current", nonce);

    const gasPrice = await web3.eth.getGasPrice();
    logger.info("gasPrice", gasPrice.toString());

    const gateSendArgumentsWithDefaults = {...gateSendDefaultNotRequiredValue, ...gateSendArguments};
    const gateSendArgValues = getSortedSendValues(gateSendArgumentsWithDefaults);
    const sendMethod = xbridgeGateInstance.methods.send(...gateSendArgValues);

    logger.info("Send method arguments", gateSendArgumentsWithDefaults);
    logger.info("Send method encodedABI", sendMethod.encodeABI());

    const estimatedGas = await sendMethod.estimateGas({from: senderAddress, value});
    logger.info("Estimated gas", estimatedGas.toString());

    const tx = {
            from: senderAddress,
            to: xbridgeGateAddress,
            gas: estimatedGas,
            value,
            gasPrice: gasPrice,
            nonce,
            data: sendMethod.encodeABI(),
    };

    logger.info("Tx", tx);
    const signedTx = await web3.eth.accounts.signTransaction(tx, senderPrivateKey);
    logger.info("Signed tx", signedTx);

    let result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction as string);
    logger.info("Result", result);

    const logs = result.logs.find(l=>l.address===xbridgeGateAddress);
    const submissionId = logs?.data.substring(0, 66);
    logger.info(`SUBMISSION ID ${submissionId}`);
    logger.info(`Url: https://testnet.xbridge.finance/transaction?tx=${result.transactionHash}&chainId=${await web3.eth.getChainId()}`);
    logger.info("Success");
}

function getSortedSendValues({
    tokenAddress, amount, chainIdTo, receiver, permit, useAssetFee, referralCode, autoParams,
}: Required<GateSendArguments>): Parameters<XDCBridgeGate["methods"]["send"]> {
    return [
        tokenAddress,
        amount,
        chainIdTo,
        receiver,
        permit,
        useAssetFee,
        referralCode,
        autoParams
    ];
}
