const xbridgeInitParams = require("../../assets/xbridgeInitParams");
const { deployProxy, getLastDeployedProxy } = require("../deploy-utils");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();
  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  const deToken = (await deployments.get("XDCBridgeToken")).address;

  const wethAddress = deployInitParams.external.WETH || (await deployments.get("MockWeth")).address;
  const xdcBridgeGateInstance = await getLastDeployedProxy("XDCBridgeGate", deployer, [
    deployInitParams.excessConfirmations,
    wethAddress,
  ]);

  await deployProxy("XDCBridgeTokenDeployer", deployer,
    [
      deToken,
      deployInitParams.xdcBridgeTokenAdmin,
      xdcBridgeGateInstance.address,
    ],
    true);
};

module.exports.tags = ["01-2_XDCBridgeTokenDeployer"]
module.exports.dependencies = ['01-1_XDCBridgeToken'];
