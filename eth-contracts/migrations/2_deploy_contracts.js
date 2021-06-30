// migrating the appropriate contracts
var SquareVerifier = artifacts.require("Verifier");
var SolnSquareVerifier = artifacts.require("./SolnSquareVerifier.sol");


module.exports = function(deployer) {
  const tokenName = "Digital Property Token";
  const symbol = "DPT";
  const baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";

  deployer.deploy(SquareVerifier)
    .then(() => {
      return deployer.deploy(SolnSquareVerifier, tokenName, symbol, baseTokenURI, SquareVerifier.address);
    });
};
