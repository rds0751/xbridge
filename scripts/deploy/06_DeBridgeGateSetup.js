const xbridgeInitParams = require("../../assets/xbridgeInitParams");
const { getLastDeployedProxy, waitTx } = require("../deploy-utils");

module.exports = async function({getNamedAccounts, deployments, network}) {
  function sleep(ms) {
    return new Promise((resolve) => {
      setTimeout(resolve, ms);
    });
  }
  const { deployer } = await getNamedAccounts();
  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  console.log("Start 06_XDCBridgeGateSetup");

  const wethAddress = deployInitParams.external.WETH || (await deployments.get("MockWeth")).address;

  const xdcBridgeGateInstance = await getLastDeployedProxy("XDCBridgeGate", deployer, [
    deployInitParams.excessConfirmations,
    wethAddress,
  ]);

  let tx;


  // --------------------------------
  //    setup SignatureVerifier
  // --------------------------------

  console.log("sleeping");
  // await sleep(1000*30);

  let signatureVerifier = await getLastDeployedProxy("SignatureVerifier", deployer);

  console.log(`xdcBridge setSignatureVerifier ${signatureVerifier.address}`);
  tx = await xdcBridgeGateInstance.setSignatureVerifier(signatureVerifier.address);
  await waitTx(tx);
  console.log("sleeping");
  // await sleep(1000*30);

  // was added in constructor
  // console.log(`signatureVerifier setXbridgeAddress ${xdcBridgeGateInstance.address}`);
  // tx = await signatureVerifier.setXbridgeAddress(xdcBridgeGateInstance.address);
  // await waitTx(tx);


  // --------------------------------
  //    setup CallProxy
  // --------------------------------

  const callProxy = await getLastDeployedProxy("CallProxy", deployer, []);
  console.log(`xdcBridge setCallProxy ${callProxy.address}`);
  tx = await xdcBridgeGateInstance.setCallProxy(callProxy.address);
  await waitTx(tx);
  console.log("sleeping");
  // await sleep(1000*30);

  console.log(`callProxy ${callProxy.address} get xdcBridge_GATE_ROLE`);
  const xdcBridge_GATE_ROLE = await callProxy.xdcBridge_GATE_ROLE();
  console.log(`callProxy grantRole xdcBridge_GATE_ROLE "${xdcBridge_GATE_ROLE}" for xdcBridgeGate "${xdcBridgeGateInstance.address}"`);
  tx = await callProxy.grantRole(xdcBridge_GATE_ROLE, xdcBridgeGateInstance.address);
  await waitTx(tx);
  console.log("sleeping");
  // await sleep(1000*30);


  // --------------------------------
  //    setup FeeProxy
  // --------------------------------

  const feeProxy = await getLastDeployedProxy("SimpleFeeProxy", deployer);
  console.log(`xdcBridge setFeeProxy ${feeProxy.address}`);
  tx = await xdcBridgeGateInstance.setFeeProxy(feeProxy.address);
  await waitTx(tx);
  console.log("sleeping");
  // await sleep(1000*30);

  // added in constructor
  // console.log(`feeProxy setXbridgeGate ${xdcBridgeGateInstance.address}`);
  // console.log(`old xbridgeGate ${ await feeProxy.xbridgeGate()}`);
  // tx = await feeProxy.setXbridgeGate(xdcBridgeGateInstance.address);
  // await waitTx(tx);

  // console.log(`feeProxy setTreasury ${deployInitParams.treasuryAddress}`);
  // console.log(`old treasury ${ await feeProxy.treasury()}`);
  // tx = await feeProxy.setTreasury(deployInitParams.treasuryAddress);
  // await waitTx(tx);

  // --------------------------------
  //    setup DefiController
  // --------------------------------

  // if (deployInitParams.deploy.DefiController) {
  //   let defiController = await getLastDeployedProxy("DefiController", deployer);
  //   console.log(`xdcBridge setDefiController ${defiController.address}`);
  //   tx = await xdcBridgeGateInstance.setDefiController(defiController.address);
  //   await waitTx(tx);
  // }


  // --------------------------------
  //    setup WethGate
  // --------------------------------

  if (deployInitParams.deploy.wethGate) {
    let wethGate = (await deployments.get("WethGate")).address;
    console.log(`xdcBridge setWethGate ${wethGate}`);
    tx = await xdcBridgeGateInstance.setWethGate(wethGate);
    await waitTx(tx);
  }
  console.log("sleeping");
  // await sleep(1000*30);


  // --------------------------------
  //    setup XDCBridgeTokenDeployer
  // --------------------------------

  const xdcBridgeTokenDeployer = await getLastDeployedProxy("XDCBridgeTokenDeployer", deployer);

  console.log(`xdcBridge setXDCBridgeTokenDeployer ${xdcBridgeTokenDeployer.address}`);
  tx = await xdcBridgeGateInstance.setXDCBridgeTokenDeployer(xdcBridgeTokenDeployer.address);
  await waitTx(tx);
  console.log("sleeping");
  // await sleep(1000*30);

  // already added in constructor
  // console.log(`xdcBridgeTokenDeployer setXbridgeAddress ${xdcBridgeGateInstance.address}`);
  // tx = await xdcBridgeTokenDeployer.setXbridgeAddress(xdcBridgeGateInstance.address);
  // await waitTx(tx);


  // --------------------------------
  //    calling updateChainSupport
  // --------------------------------

  console.log("updateChainSupport");
  console.log(deployInitParams.supportedChains);
  console.log(deployInitParams.chainSupportInfo);
  tx = await xdcBridgeGateInstance.updateChainSupport(
    deployInitParams.supportedChains,
    deployInitParams.chainSupportInfo,
    false
    //  [bscChainId, hecoChainId],
    //  [
    //      {
    //          transferFeeBps,
    //          fixedNativeFee: fixedNativeFeeBNB,
    //          isSupported,
    //      },
    //      {
    //          transferFeeBps,
    //          fixedNativeFee: fixedNativeFeeHT,
    //          isSupported,
    //      },
    //  ]
  );
  await waitTx(tx);
  console.log("sleeping");
  // await sleep(1000*30);

  tx = await xdcBridgeGateInstance.updateChainSupport(
    deployInitParams.supportedChains,
    deployInitParams.chainSupportInfo,
    true //_isChainFrom is true for editing getChainFromConfig.
  );
  await waitTx(tx);
  console.log("sleeping");
  // await sleep(1000*30);

  console.log("deployInitParams.supportedChains: ", deployInitParams.supportedChains);
  console.log("deployInitParams.fixedNativeFee: ", deployInitParams.fixedNativeFee);


  // --------------------------------
  //    calling updateGlobalFee
  // --------------------------------

  // function updateGlobalFee(
  //     uint256 _globalFixedNativeFee,
  //     uint16 _globalTransferFeeBps
  // )
  console.log("xdcBridgeGate updateGlobalFee");
  tx = await xdcBridgeGateInstance.updateGlobalFee(
    deployInitParams.globalFixedNativeFee,
    deployInitParams.globalTransferFeeBps
  );
  await waitTx(tx);
};

module.exports.tags = ["06_XDCBridgeGateSetup"]
module.exports.dependencies = [
  '01-0_XDCBridgeGate',
  '01-2_XDCBridgeTokenDeployer',
  '02_SignatureVerifier',
  '03_CallProxy',
  '04_FeeProxy',
  '05_wethGate',
];
