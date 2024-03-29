const path = require("path");

module.exports = {
  contracts_build_directory: path.join(__dirname, "client/src/contracts"),
  networks: {
    ganache: {
         host: "localhost",
         port: 8545,
         network_id: "*" // Match any network id
    }
  } 
};
