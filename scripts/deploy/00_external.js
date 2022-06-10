const xbridgeInitParams = require("../../assets/xbridgeInitParams");

module.exports = async function({getNamedAccounts, deployments, network}) {
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  // deploy external dependencies only if they aren't specified in xbridgeInitParams.json

  if (!deployInitParams.external.WETH) {
    await deploy("MockWeth", {
      from: deployer,
      args: [deployInitParams.external.WETHName, deployInitParams.external.WETHSymbol],
      // deterministicDeployment: true,
      log: true,
      waitConfirmations: 1,
    });
  }

  if (!deployInitParams.external.UniswapFactory) {
    await deploy("UniswapV2Factory", {
      from: deployer,
      args: [ethers.constants.AddressZero],
      // deterministicDeployment: true,
      log: true,
      waitConfirmations: 1,
    });
  }
};

module.exports.tags = ["00_external"]
