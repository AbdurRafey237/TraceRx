// Deploys the migrations tracking contract to the blockchain.
const Migrations = artifacts.require("Migrations");

module.exports = function (deployer) {
  deployer.deploy(Migrations);
};
