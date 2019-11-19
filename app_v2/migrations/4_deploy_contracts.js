// 4_deploy_contracts.js
var TardinessTransfer = artifacts.require("./TardinessTransfer.sol");

module.exports = function(deployer) {
  deployer.deploy(TardinessTransfer);
};