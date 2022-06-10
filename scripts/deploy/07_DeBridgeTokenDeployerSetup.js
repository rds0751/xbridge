const xbridgeInitParams = require("../../assets/xbridgeInitParams");
const { getLastDeployedProxy, waitTx } = require("../deploy-utils");

module.exports = async function({getNamedAccounts, deployments, network}) {
  const { deployer } = await getNamedAccounts();
  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  console.log("Start 07_XDCBridgeTokenDeployerSetup");

  // --------------------------------
  //    setup XDCBridgeTokenDeployer
  // --------------------------------

  const wethAddress = deployInitParams.external.WETH || (await deployments.get("MockWeth")).address;
  const xdcBridgeGateInstance = await getLastDeployedProxy("XDCBridgeGate", deployer, [
    deployInitParams.excessConfirmations,
    wethAddress,
  ]);
  console.log("xdcBridgeGateInstance ", xdcBridgeGateInstance.address);
  const xdcBridgeTokenDeployer = await getLastDeployedProxy("XDCBridgeTokenDeployer", deployer);

  const overridedTokens = xbridgeInitParams.overridedTokens;
  const overridedTokensInfo = xbridgeInitParams.overridedTokensInfo;

  console.log("overridedTokens ",  overridedTokens);
  console.log("overridedTokensInfo ",  overridedTokensInfo);
  console.log("Calculating xbridgeId");
  let xbridgeIds = [];

  for (let item of overridedTokens){
    //getXbridgeId(uint256 _chainId, address _tokenAddress)
    const xbridgeId = await xdcBridgeGateInstance.getXbridgeId(item.chainId, item.address);
    console.log(`chainId: ${item.chainId} tokenAddress: ${item.address} debrigeId: ${xbridgeId}`);
    xbridgeIds.push(xbridgeId);
  }

  tx = await xdcBridgeTokenDeployer.setOverridedTokenInfo(
    xbridgeIds,
    overridedTokensInfo
  );

  await waitTx(tx);

  console.log("Checks");
  for (let xbridgeId of xbridgeIds){
    //getXbridgeId(uint256 _chainId, address _tokenAddress)
    const item = await xdcBridgeTokenDeployer.overridedTokens(xbridgeId);
    console.log(`xbridgeId: ${xbridgeId} `, item);
  }
}; 

module.exports.tags = ["07_XDCBridgeTokenDeployerSetup"]
module.exports.dependencies = [
  '01-0_XDCBridgeGate',
  '01-2_XDCBridgeTokenDeployer',
];
