var ERC721MintableComplete = artifacts.require('DigitalPropertyToken');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_three = accounts[2];
    const account_four = accounts[3];
    const account_five = accounts[4];
    
    const numberTokens = 10;

    const tokenName = "Digital Property Token";
    const symbol = "DPT";
    const baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";

    describe('match erc721 spec', function () {        

        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new(tokenName, symbol, baseTokenURI, {from: account_one});

            // TODO: mint multiple tokens
            for(let i = 0; i < numberTokens; i++) {
                await this.contract.mint(account_two, i, {from: account_one});
            }            
        });

        it('should return total supply', async function () {
            let totalSupply = await this.contract.totalSupply();
            assert.equal(totalSupply.toString(), numberTokens.toString(), "Total supply is not correct");
        })

        it('should get token balance', async function () {
            let tokenBalance = await this.contract.balanceOf(account_two);
            assert.equal(tokenBalance.toString(), numberTokens.toString(), "Token balance is not correct");
        })

        // token uri should be complete i.e: https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/1
        it('should return token uri', async function () {
            let baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";
            let tokenId = 2;
            let tokenURI = await this.contract.tokenURI(tokenId);

            assert.equal(tokenURI, baseTokenURI + tokenId.toString(), "Token URI is not correct");            
        });

        it('should transfer token from one owner to another', async function () {
            let tokenId = 3;

            await this.contract.transferFrom(account_two, account_three, tokenId, {from: account_two});

            let newTokenOwner = await this.contract.ownerOf(tokenId);

            let tokenBalanceFrom = await this.contract.balanceOf(account_two);
            let tokenBalanceTo = await this.contract.balanceOf(account_three);

            assert.equal(newTokenOwner, account_three, "The new owner was not transferred the token");
            assert.equal(tokenBalanceFrom.toString(), (numberTokens - 1).toString(), "The balance of the 'From' owner was not updated");
            assert.equal(tokenBalanceTo.toString(), '1', "The balance of the 'To' owner was not updated");                        
        });

        it('should allow transfer from approved address', async function () {
            let tokenId = 4;

            await this.contract.approve(account_three, tokenId, {from: account_two});

            await this.contract.transferFrom(account_two, account_four, tokenId, {from: account_three});

            let newTokenOwner = await this.contract.ownerOf(tokenId);

            let tokenBalanceFrom = await this.contract.balanceOf(account_two);
            let tokenBalanceTo = await this.contract.balanceOf(account_four);

            assert.equal(newTokenOwner, account_four, "The new owner was not transferred the token");
            assert.equal(tokenBalanceFrom.toString(), (numberTokens - 1).toString(), "The balance of the 'From' owner was not updated");
            assert.equal(tokenBalanceTo.toString(), '1', "The balance of the 'To' owner was not updated");                        
        });

        it('should allow transfer from approvedForAll address', async function () {
            let tokenId = 5;

            await this.contract.setApprovalForAll(account_five, true, {from: account_two});

            await this.contract.transferFrom(account_two, account_four, tokenId, {from: account_five});

            let newTokenOwner = await this.contract.ownerOf(tokenId);

            let tokenBalanceFrom = await this.contract.balanceOf(account_two);
            let tokenBalanceTo = await this.contract.balanceOf(account_four);

            assert.equal(newTokenOwner, account_four, "The new owner was not transferred the token");
            assert.equal(tokenBalanceFrom.toString(), (numberTokens - 1).toString(), "The balance of the 'From' owner was not updated");
            assert.equal(tokenBalanceTo.toString(), '1', "The balance of the 'To' owner was not updated");                        
        });

    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new(tokenName, symbol, baseTokenURI, {from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {
            let tokenId = 4;

            let reason = "Caller should be the owner of the contract";

            try {
                await this.contract.mint(account_two, tokenId, {from: account_two});
                assert.fail("Minting should fail if not called by contract owner");
            }
            catch(e) {
                assert.equal(e.reason, reason, "The error message should match the expected reason");
            }
                        
        })

        it('should return contract owner', async function () { 
            let owner = await this.contract.getOwner();

            assert.equal(owner, account_one, "Owner of the contract should be account one");
            
        });
    });

    describe('is a pausable contract', function () {
        before(async function () { 
            this.contract = await ERC721MintableComplete.new(tokenName, symbol, baseTokenURI, {from: account_one});
            let tokenId = 1;
            await this.contract.mint(account_two, tokenId, {from: account_one});
        })

        it('should fail to be paused when caller address is not contract owner', async function () {
            let reason = "Caller should be the owner of the contract";

            let paused = true;

            try {
                await this.contract.setPause(paused, {from: account_two});
                assert.fail("Pausing should fail when not called by contract owner");
            }
            catch(e) {
                assert.equal(e.reason, reason, "The error message should match the expected reason");
            }                        
        });

        it('should be possible for the contract owner to pause it', async function () {
            let paused = true;
            let eventName = "Paused";

            let result = await this.contract.setPause(paused, {from: account_one});

            let eventType = result.logs[0].event;
            let eventResult = result.logs[0].args.fromAddress;

            assert.equal(eventType, eventName, "There should be a 'Paused' event being fired");
            assert.equal(eventResult, account_one, "The result of the event should be the contract owner address");
        });

        it('should fail to mint while being paused', async function () {
            let tokenId = 1;
            let reason = "This function can only be called when contract is not paused";

            try {
                await this.contract.mint(account_two, tokenId, {from: account_one});
                assert.fail("Minting should fail if contract is paused");
            }
            catch(e) {
                assert.equal(e.reason, reason, "The error message should match the expected reason");
            }
        });

        it('should fail to transfer while being paused', async function () {
            let tokenId = 1;
            let reason = "This function can only be called when contract is not paused";

            try {
                await this.contract.transferFrom(account_two, account_three, tokenId, {from: account_two});
                assert.fail("Transfer should fail if contract is paused");
            }
            catch(e) {
                assert.equal(e.reason, reason, "The error message should match the expected reason");
            }
        });

        it('should fail to set approval while being paused', async function () {
            let tokenId = 1;
            let reason = "This function can only be called when contract is not paused";

            try {
                await this.contract.approve(account_three, tokenId, {from: account_two});
                assert.fail("Approval should fail if contract is paused");
            }
            catch(e) {
                assert.equal(e.reason, reason, "The error message should match the expected reason");
            }
        });

        it('should fail to set approval for all while being paused', async function () {
            let reason = "This function can only be called when contract is not paused";

            try {
                await this.contract.setApprovalForAll(account_three, true, {from: account_two});
                assert.fail("Approval for all should fail if contract is paused");
            }
            catch(e) {
                assert.equal(e.reason, reason, "The error message should match the expected reason");
            }
        });

        it('should fail to be paused when already paused', async function () {
            let paused = true;
            let reason = "The contract was already set to the desired paused/unpaused state";

            try {
                await this.contract.setPause(paused, {from: account_one});
                assert.fail("Pausing should fail if contract is paused");
            }
            catch(e) {
                assert.equal(e.reason, reason, "The error message should match the expected reason");
            }
        });

        it('should be possible for the contract owner to unpause it', async function () {
            let paused = false;
            let eventName = "Unpaused";

            let result = await this.contract.setPause(paused, {from: account_one});

            let eventType = result.logs[0].event;
            let eventResult = result.logs[0].args.fromAddress;

            assert.equal(eventType, eventName, "There should be an 'Unpaused' event being fired");
            assert.equal(eventResult, account_one, "The result of the event should be the contract owner address");
        });
    });
})