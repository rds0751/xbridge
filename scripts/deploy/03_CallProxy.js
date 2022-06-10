const xbridgeInitParams = require("../../assets/xbridgeInitParams");
const { deployProxy } = require("../deploy-utils");

module.exports = async function ({ getNamedAccounts, deployments, network }) {
  const { deployer } = await getNamedAccounts();
  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  await deployProxy("CallProxy", deployer, [], true);
};

module.exports.tags = ["03_CallProxy"]
