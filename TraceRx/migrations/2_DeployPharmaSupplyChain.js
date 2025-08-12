// Deploys the (main) PharmaSupplyChain smart contract to the blockchain.
const PharmaSupplyChain = artifacts.require("PharmaSupplyChain");

module.exports = function (deployer) {
    deployer.deploy(PharmaSupplyChain);
};
