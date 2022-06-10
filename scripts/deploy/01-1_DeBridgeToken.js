const xbridgeInitParams = require("../../assets/xbridgeInitParams");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const networkName = network.name;
  const deployInitParams = xbridgeInitParams[networkName];
  if (!deployInitParams) return;

  await deploy("XDCBridgeToken", {
    from: deployer,
    // deterministicDeployment: true,
    log: true,
    waitConfirmations: 1,
  });
};

module.exports.tags = ["01-1_XDCBridgeToken"]
