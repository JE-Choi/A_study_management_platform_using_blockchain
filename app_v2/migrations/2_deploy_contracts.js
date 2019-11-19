// 2_deploy_contracts.js
var AboutStudyInfo = artifacts.require("./AboutStudyInfo.sol");

module.exports = function(deployer) {
  deployer.deploy(AboutStudyInfo);
};

