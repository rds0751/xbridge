const { FLAGS, deployProxy, getLastDeployedProxy, waitTx } = require("../deploy-utils");
const xbridgeInitParams = require("../../assets/xbridgeInitParams");

module.exports = async function({getNamedAccounts, deployments, network}) {
  const { deployer } = await getNamedAccounts();

  const deployInitParams = xbridgeInitParams[network.name];
  if (!deployInitParams) return;

  if(deployInitParams.deploy.Claimer){
    console.log('*'.repeat(80));
    console.log(`\tStart deploy batch claimer`);
    console.log(`\tfrom DEPLOYER ${deployer}`);
    console.log('*'.repeat(80));

    //No deployed proxy found for "XDCBridgeGate"
    const xdcBridgeGate = await getLastDeployedProxy("XDCBridgeGate", deployer);
    await deployProxy("Claimer", deployer,
    //["0x68d936cb4723bdd38c488fd50514803f96789d2d"],
    [xdcBridgeGate.address],
    true);
  }
};

module.exports.tags = ["11_batchClaimer"];
module.exports.dependencies = [];