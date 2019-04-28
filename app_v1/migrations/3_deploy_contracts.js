// 3_deploy_contracts.js
var StudyGroup = artifacts.require("./StudyGroup.sol");

module.exports = function(deployer) {
  deployer.deploy(StudyGroup);
};
