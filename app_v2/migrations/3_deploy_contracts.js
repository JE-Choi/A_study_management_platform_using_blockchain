// 3_deploy_contracts.js
var MainAccountTransfer = artifacts.require("./MainAccountTransfer.sol");

module.exports = function(deployer) {
  deployer.deploy(MainAccountTransfer);
};