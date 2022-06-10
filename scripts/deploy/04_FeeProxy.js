const xbridgeInitParams = require("../../assets/xbridgeInitParams");
const { deployProxy, getLastDeployedProxy } = require("../deploy-utils");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();
  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  // const weth = deployInitParams.external.WETH || (await deployments.get("MockWeth")).address;
  // const uniswapFactory = deployInitParams.external.UniswapFactory || (await deployments.get("UniswapV2Factory")).address;

  // await deployProxy("FeeProxy", deployer, [uniswapFactory, weth], true);

  const wethAddress = deployInitParams.external.WETH || (await deployments.get("MockWeth")).address;
  const xdcBridgeGateInstance = await getLastDeployedProxy("XDCBridgeGate", deployer, [
    deployInitParams.excessConfirmations,
    wethAddress,
  ]);

  await deployProxy("SimpleFeeProxy", deployer, [xdcBridgeGateInstance.address, deployInitParams.treasuryAddress], true);


  //next TODO needs only for FeeProxy. we will deploy SimpleFeeProxy
  //We deployed simple proxy with function only to withdraw fee
  //TODO: FeeProxy setTreasury for each chains
  //TODO: FeeProxy setDeEthToken
  //TODO: FeeProxy setFeeProxyAddress for each chains
  //TODO: FeeProxy setFeeProxyAddress for each chains
  //TODO: FeeProxy add workers
};

module.exports.tags = ["04_FeeProxy"]
