// migrating the appropriate contracts
//var SquareVerifier = require("../../zokrates/code/square/verifier.sol");
//import "../../zokrates/code/square/verifier.sol";
var SquareVerifier = artifacts.require("Verifier");
//var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");


module.exports = function(deployer) {
deployer.deploy(SquareVerifier);
  //deployer.deploy(SolnSquareVerifier);
};
