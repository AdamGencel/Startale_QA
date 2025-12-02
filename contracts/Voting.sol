// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Proposal {
        string name;
        uint voteCount;
    }

    address public owner;
    Proposal[] public proposals;
    mapping(address => bool) public hasVoted;

    constructor(string[] memory proposalNames) {
        owner = msg.sender;
        for (uint i = 0; i < proposalNames.length; i++) {
            proposals.push(Proposal({ name: proposalNames[i], voteCount: 0 }));
        }
    }

    function vote(uint proposalIndex) public {
        require(!hasVoted[msg.sender], "You have already voted.");
        require(proposalIndex < proposals.length, "Invalid proposal.");
        
        proposals[proposalIndex].voteCount += 1;
        hasVoted[msg.sender] = true;
        voters.push(msg.sender);
    }

    function getProposal(uint index) public view returns (string memory name, uint voteCount) {
        require(index < proposals.length, "Invalid proposal.");
        Proposal storage proposal = proposals[index];
        return (proposal.name, proposal.voteCount);
    }

    function getProposalCount() public view returns (uint) {
        return proposals.length;
    }

    // Array to track voters for reset functionality
    address[] private voters;
    
    function resetVotes() public {
        require(msg.sender == owner, "Only the owner can reset votes.");
        
        // Reset vote counts
        for (uint i = 0; i < proposals.length; i++) {
            proposals[i].voteCount = 0;
        }
        
        // Reset all voters
        for (uint i = 0; i < voters.length; i++) {
            hasVoted[voters[i]] = false;
        }
        delete voters;
    }
}

