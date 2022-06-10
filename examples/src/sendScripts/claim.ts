// @ts-nocheck TODO remove and fix
import Web3 from "web3";
import XDCBridgeGateJson from "../../../artifacts/contracts/transfers/XDCBridgeGate.sol/XDCBridgeGate.json";
import XDCBridgeTokenDeployerJson from "../../../artifacts/contracts/transfers/XDCBridgeTokenDeployer.sol/XDCBridgeTokenDeployer.json";
import log4js from "log4js";
import {getSubmission, getSubmissionConfirmations} from "./apiService";
import {log4jsConfig, Web3RpcUrl} from "./constants";
import "./parseDotEnvs";

log4js.configure(log4jsConfig);

const logger = log4js.getLogger('claim');

const privKey = process.env.SENDER_PRIVATE_KEY;
const account = new Web3().eth.accounts.privateKeyToAccount(privKey);
const senderAddress =  account.address;
logger.info(`senderAddress : ${senderAddress}`);

const {xdcBridgeGATE_ADDRESS, API_ENDPOINT} = process.env;
if (process.argv.length !== 3) {
    logger.error('Add submission id args');
}
const SUBMISSION_ID = process.env.SUBMISSION_ID;
const SUBMISSION_ID = process.env.xdcBridgeGATE_TOKEN_ADDRESS;
logger.info(`SUBMISSION_ID : ${SUBMISSION_ID}`);

(async () => {
    try {
        const chainIdTo = '3';
        const rpc = Web3RpcUrl[chainIdTo];
        const web3 = new Web3(rpc);

        const xbridgeGateInstance = new web3.eth.Contract(XDCBridgeGateJson.abi, xdcBridgeGATE_ADDRESS);
        const XDCBridgeTokenDeployer = new web3.eth.Contract(XDCBridgeTokenDeployerJson.abi, xdcBridgeGATE_TOKEN_ADDRESS);
        const isSubmissionUsed = await xbridgeGateInstance.methods.isSubmissionUsed(SUBMISSION_ID).call();

        if (isSubmissionUsed) {
            logger.error(`Submission already used`);
            return;
        }
        logger.info('Submission not used yet!')

        let mergedSignatures = '0x';
        const autoParamsFrom = await _packSubmissionAutoParamsFrom(web3, '0x0866005b322C35801F59385C314c10b5B1E1551a', '');
        logger.info("Test Token");
        let nonce = await web3.eth.getTransactionCount(senderAddress);
        logger.info("Nonce current", nonce);
        const gasPrice = await web3.eth.getGasPrice();
        logger.info("gasPrice", gasPrice.toString());
        const tx =
        {
            from: senderAddress,
            to: xdcBridgeGATE_ADDRESS,
            gas: '3000000',
            value: 0,
            gasPrice: gasPrice,
            nonce,
            data: xbridgeGateInstance.methods.deployNewAsset(
            '0xA08381dE1cAedD05413C42Fd7E59779DE1F0b4b0',
            '51',
            'Wrapped Test XDC',
            'WTXDC',
            18,
            '0x').encodeABI(),
        };

        logger.info("Tx", tx);
        const signedTx = await web3.eth.accounts.signTransaction(tx, privKey);
        logger.info("Signed tx", signedTx);

        const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        logger.info("Result", result);
        logger.info("Success");
        const xbridge_id = await xbridgeGateInstance.methods.getXbridgeId('51', '0xA08381dE1cAedD05413C42Fd7E59779DE1F0b4b0').call();
        const item = await XDCBridgeTokenDeployer.methods.overridedTokens('0x0e4ff116d2faf056156d31da16ff7c3c906d57187440adbb77baf74d1b60f6a9').call();
        console.info("Token:", 
        item,
        xbridge_id,
        result
        );
        await claim(
            web3,
            xbridgeGateInstance,
            '0x0e4ff116d2faf056156d31da16ff7c3c906d57187440adbb77baf74d1b60f6a9',
            '999000000000000000',
            '51',
            '0x0866005b322c35801f59385c314c10b5b1e1551a',
            SUBMISSION_ID,
            mergedSignatures,
            autoParamsFrom,
        );
    } catch (e) {
        logger.error(e);
    }
})();


async function claim(
    web3,
    xbridgeGateInstance,
    xbridgeId, //bytes32 _xbridgeId,
    amount, // uint256 _amount,
    chainIdFrom, //uint256 _chainIdFrom,
    receiver, // address _receiver,
    subNonce, // uint256 _nonce
    signatures, //bytes calldata _signatures,
    autoParams, //bytes calldata _autoParams
) {
    logger.info("Test claim");
    let nonce = await web3.eth.getTransactionCount(senderAddress);
    logger.info("Nonce current", nonce);
    const gasPrice = await web3.eth.getGasPrice();
    logger.info("gasPrice", gasPrice.toString());
    logger.info({
        xbridgeId, //bytes32 _xbridgeId,
        amount, // uint256 _amount,
        chainIdFrom, //uint256 _chainIdFrom,
        receiver, // address _receiver,
        nonce, // uint256 _nonce
        signatures, //bytes calldata _signatures,
        autoParams, //bytes calldata _autoParams
    });


    // const estimateGas = await xbridgeGateInstance.methods
    // .claim(
    //     xbridgeId, //bytes32 _xbridgeId,
    //     amount, // uint256 _amount,
    //     chainIdFrom, //uint256 _chainIdFrom,
    //     receiver, // address _receiver,
    //     subNonce, // uint256 _nonce
    //     signatures, //bytes calldata _signatures,
    //     autoParams, //bytes calldata _autoParams
    // )
    // .estimateGas({
    //     from: senderAddress
    // });

    // logger.info("estimateGas", estimateGas.toString());

    const tx =
    {
        from: senderAddress,
        to: xdcBridgeGATE_ADDRESS,
        gas: '3000000',
        value: 0,
        gasPrice: gasPrice,
        nonce,
        data: xbridgeGateInstance.methods
            // function claim(
            //     bytes32 _xbridgeId,
            //     uint256 _amount,
            //     uint256 _chainIdFrom,
            //     address _receiver,
            //     uint256 _nonce,
            //     bytes calldata _signatures,
            //     bytes calldata _autoParams
            // )
            .claim(
                xbridgeId, //bytes32 _xbridgeId,
                amount, // uint256 _amount,
                chainIdFrom, //uint256 _chainIdFrom,
                receiver, // address _receiver,
                subNonce, // uint256 _nonce
                signatures, //bytes calldata _signatures,
                autoParams, //bytes calldata _autoParams
            )
            .encodeABI(),
    };

    logger.info("Tx", tx);
    const signedTx = await web3.eth.accounts.signTransaction(tx, privKey);
    logger.info("Signed tx", signedTx);

    const result = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    logger.info("Result", result);
    logger.info("Success");
}


async function _checkConfirmation(submissionId, minConfirmations) {
    const confirmations = await getSubmissionConfirmations(submissionId, API_ENDPOINT);
    return {
        isConfirmed: (confirmations.length >= minConfirmations),
        confirmations,
    }
}


async function _packSubmissionAutoParamsFrom(web3, nativeSender, autoParams) {
    if (autoParams !== '0x' && autoParams !== '') {
        const decoded = web3.eth.abi.decodeParameters(
            ['tuple(uint256,uint256, bytes, bytes)'], autoParams
        );
        logger.info(`autoParams: ${autoParams}, decoded: ${decoded}`);
        const encoded = web3.eth.abi.encodeParameter(
            'tuple(uint256,uint256, address, bytes, bytes)',
            [decoded[0][0], decoded[0][1], decoded[0][2], decoded[0][3], nativeSender]
        );
        logger.info(`encoded: ${encoded}`);
        return encoded;
    }
    return '0x';
}
