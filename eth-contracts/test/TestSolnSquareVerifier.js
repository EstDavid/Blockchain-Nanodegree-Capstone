var verifierContract = artifacts.require("Verifier");
var solnSquareVerifierContract = artifacts.require("SolnSquareVerifier");
var SampleProof = require('../../zokrates/code/square/proof');

contract('TestSolnSquareVerifier', accounts => {
    const account_one = accounts[0];
    const account_two = accounts[1];
    const a = SampleProof.proof.a;
    const b = SampleProof.proof.b;
    const c = SampleProof.proof.c;
    const inputs = SampleProof.inputs;

    const tokenName = "Digital Property Token";
    const symbol = "DPT";
    const baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";
    
    beforeEach(async function () {
        this.verifierContract = await verifierContract.new(account_one);
        this.solnSquareVerifierContract = 
        await solnSquareVerifierContract.new(
                                                tokenName,
                                                symbol,
                                                baseTokenURI,
                                                this.verifierContract.address,
                                                {from: account_one}
                                                );
    });

    // Test if a new solution can be added for contract - SolnSquareVerifier
    it('should add a new solution', async function () {
        let tokenId = 1;

        let expectedEvent = "SolutionAdded";

        let key = web3.utils.soliditySha3(
                                            a[0],
                                            a[1],
                                            b[0][0],
                                            b[0][1],
                                            b[1][0],
                                            b[1][1],
                                            c[0],
                                            c[1],
                                            inputs[0],
                                            inputs[1],
                                            account_two);

        let eventTx = await this.solnSquareVerifierContract.addSolution(key, tokenId, account_two, {from: account_one});
        let result = await this.solnSquareVerifierContract.uniqueSolutions.call(key);

        let eventType = eventTx.logs[0].event;
        let eventKey = eventTx.logs[0].args.key;
        let eventOwner = eventTx.logs[0].args.owner;
        let tokenOwner = result.owner;
        let solutionCreated = result.isSolution;

        assert.equal(eventType, expectedEvent, "A 'SolutionAdded' event should have been emitted");
        assert.equal(eventKey, key, "Key of the solution emitted in the event should be correct");
        assert.equal(eventOwner, account_two, "Account owner of the solution emitted in the event should be correct");
        assert.equal(tokenOwner, account_two, "Account owner of the solution stored in the contract should be correct");
        assert.equal(solutionCreated, true, "The 'isSolution' variable of the solution should be set to true");
    });

    // Test if an ERC721 token can be minted for contract - SolnSquareVerifier
    it('should mint a new token', async function () {

        let expectedEvent = "SolutionAdded";

        let key = web3.utils.soliditySha3(
                                            a[0],
                                            a[1],
                                            b[0][0],
                                            b[0][1],
                                            b[1][0],
                                            b[1][1],
                                            c[0],
                                            c[1],
                                            inputs[0],
                                            inputs[1],
                                            account_two);

        let eventTx = await this.solnSquareVerifierContract.mintNFT(a, b[0], b[1], c, inputs, account_two, {from: account_one});
        let result = await this.solnSquareVerifierContract.uniqueSolutions.call(key);

        let eventType = eventTx.logs[1].event;
        let eventKey = eventTx.logs[1].args.key;
        let eventOwner = eventTx.logs[1].args.owner;
        let tokenOwner = result.owner;
        let solutionCreated = result.isSolution;

        assert.equal(eventType, expectedEvent, "A 'SolutionAdded' event should have been emitted");
        assert.equal(eventKey, key, "Key of the solution emitted in the event should be correct");
        assert.equal(eventOwner, account_two, "Account owner of the solution emitted in the event should be correct");
        assert.equal(tokenOwner, account_two, "Account owner of the solution stored in the contract should be correct");
        assert.equal(solutionCreated, true, "The 'isSolution' variable of the solution should be set to true");
    });
})