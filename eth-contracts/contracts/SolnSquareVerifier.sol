pragma solidity >=0.4.21 <0.6.0;

import "./ERC721Mintable.sol";
import 'openzeppelin-solidity/contracts/drafts/Counters.sol';

contract SolnSquareVerifier is DigitalPropertyToken {

    using Counters for Counters.Counter;

// TODO define a contract call to the zokrates generated solidity contract <Verifier> or <renamedVerifier>
    /*** Referencing the Verifier contract ***/
    // Adding state variable referencing Verifier contract
    Verifier private verifier;

// TODO define another contract named SolnSquareVerifier that inherits from your ERC721Mintable class
    constructor (
                    string memory name,
                    string memory symbol,
                    string memory baseTokenURI,
                    address verifierContract
                ) 
                DigitalPropertyToken(name, symbol, baseTokenURI)
                public {
                    verifier = Verifier(verifierContract);
                }

// TODO define a solutions struct that can hold an index & an address
    struct solutions {
        uint256 index; 
        address owner;
        bool isSolution;
    }

// TODO define an array of the above struct
    //solutions[] solutionsList;

// TODO define a mapping to store unique solutions submitted
    mapping(bytes32 => solutions) public uniqueSolutions;

// TODO Create an event to emit when a solution is added
    event SolutionAdded(bytes32 key, address owner);

// TODO Create a function to add the solutions to the array and emit the event
    function addSolution(bytes32 key, uint256 tokenId, address solutionOwner) public {
        uniqueSolutions[key] = solutions (tokenId, solutionOwner, true);
        emit SolutionAdded(key, solutionOwner);
    }

// TODO Create a function to mint new NFT only after the solution has been verified
//  - make sure the solution is unique (has not been used before)
//  - make sure you handle metadata as well as tokenSupply
    function mintNFT(
                    uint[2] memory a,
                    uint[2][2] memory b,
                    uint[2] memory c,
                    uint[2] memory inputs,
                    address solutionOwner
                    ) 
                    public {
        bool verified = verifier.verifyTx(a, b, c, inputs);
        require(verified, "Solution is not valid");
        bytes32 key = keccak256(abi.encodePacked(a, b, c, inputs, solutionOwner));
        require(uniqueSolutions[key].isSolution == false, "Solution already exists");
        uint256 newTokenId = totalSupply() + 1;
        mint(solutionOwner, newTokenId);
        addSolution(key, newTokenId, solutionOwner);        
    }

}

contract Verifier {

    function verifyTx(
        uint[2] calldata a,
        uint[2][2] calldata b,
        uint[2] calldata c,
        uint[2] calldata input
    ) 
    external
    view
    returns(bool);
}