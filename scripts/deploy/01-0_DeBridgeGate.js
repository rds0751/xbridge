const xbridgeInitParams = require("../../assets/xbridgeInitParams");
const { deployProxy } = require("../deploy-utils");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();
  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  const wethAddress = deployInitParams.external.WETH || (await deployments.get("MockWeth")).address;

  await deployProxy("XDCBridgeGate", deployer,
    [
      deployInitParams.excessConfirmations,
      wethAddress,
    ],
    true);
};

module.exports.tags = ['01-0_XDCBridgeGate'];
module.exports.dependencies = ['00_external'];
