// 5_deploy_contracts.js
var QuizTransfer = artifacts.require("./QuizTransfer.sol");

module.exports = function(deployer) {
  deployer.deploy(QuizTransfer);
};