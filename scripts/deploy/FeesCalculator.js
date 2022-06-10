const { deployProxy, getLastDeployedProxy } = require("../deploy-utils");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();

  const xdcBridgeGate = await getLastDeployedProxy("XDCBridgeGate", deployer);
  await deployProxy(
    "FeesCalculator",
    deployer,
    [xdcBridgeGate.address],
    true,
  );
};

module.exports.tags = ["FeesCalculator"]
module.exports.dependencies = ['01-0_XDCBridgeGate'];
