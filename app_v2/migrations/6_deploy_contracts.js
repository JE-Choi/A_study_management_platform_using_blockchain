// 6_deploy_contracts.js
var StudyEndTransfer = artifacts.require("./StudyEndTransfer.sol");

module.exports = function(deployer) {
  deployer.deploy(StudyEndTransfer);
};