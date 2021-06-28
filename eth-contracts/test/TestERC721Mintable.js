var ERC721MintableComplete = artifacts.require('InmoToken');

contract('TestERC721Mintable', accounts => {

    const account_one = accounts[0];
    const account_two = accounts[1];
    const account_three = accounts[2];
    
    const numberTokens = 5;

    const baseTokenURI = "https://s3-us-west-2.amazonaws.com/udacity-blockchain/capstone/";

    describe('match erc721 spec', function () {        

        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new("Casita", "INM", baseTokenURI, {from: account_one});

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
    });

    describe('have ownership properties', function () {
        beforeEach(async function () { 
            this.contract = await ERC721MintableComplete.new("Casita", "INM", baseTokenURI, {from: account_one});
        })

        it('should fail when minting when address is not contract owner', async function () {
            let tokenId = 1;

            let reason = "Caller should be the owner of the contract";

            try {
                await this.contract.mint(account_two, tokenId, {from: account_two});
                assert.fail("Function should fail");
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
})