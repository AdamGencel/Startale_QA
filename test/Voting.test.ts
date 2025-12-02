import { expect } from "chai";
import { ethers } from "hardhat";
import { Voting } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Voting Contract", function () {
  let voting: Voting;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;

  const proposals = ["Proposal A", "Proposal B", "Proposal C"];

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();
    
    const VotingFactory = await ethers.getContractFactory("Voting");
    voting = await VotingFactory.deploy(proposals);
    await voting.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await voting.owner()).to.equal(owner.address);
    });

    it("Should initialize proposals correctly", async function () {
      for (let i = 0; i < proposals.length; i++) {
        const proposal = await voting.getProposal(i);
        expect(proposal.name).to.equal(proposals[i]);
        expect(proposal.voteCount).to.equal(0);
      }
    });
  });

  describe("Voting", function () {
    it("Should allow a user to vote", async function () {
      await voting.connect(addr1).vote(0);
      const proposal = await voting.getProposal(0);
      expect(proposal.voteCount).to.equal(1);
      expect(await voting.hasVoted(addr1.address)).to.be.true;
    });

    it("Should not allow voting twice", async function () {
      await voting.connect(addr1).vote(0);
      await expect(voting.connect(addr1).vote(1)).to.be.revertedWith(
        "You have already voted."
      );
    });

    it("Should revert on invalid proposal index", async function () {
      await expect(voting.connect(addr1).vote(99)).to.be.revertedWith(
        "Invalid proposal."
      );
    });
  });

  describe("Reset Votes", function () {
    it("Should allow owner to reset votes", async function () {
      await voting.connect(addr1).vote(0);
      await voting.connect(addr2).vote(1);
      
      await voting.resetVotes();
      
      const proposal0 = await voting.getProposal(0);
      const proposal1 = await voting.getProposal(1);
      expect(proposal0.voteCount).to.equal(0);
      expect(proposal1.voteCount).to.equal(0);
    });

    it("Should allow users to vote again after reset", async function () {
      // First round of voting
      await voting.connect(addr1).vote(0);
      expect(await voting.hasVoted(addr1.address)).to.be.true;
      
      // Reset
      await voting.resetVotes();
      
      // Should be able to vote again
      await voting.connect(addr1).vote(1);
      const proposal = await voting.getProposal(1);
      expect(proposal.voteCount).to.equal(1);
      expect(await voting.hasVoted(addr1.address)).to.be.true;
    });

    it("Should not allow non-owner to reset votes", async function () {
      await expect(voting.connect(addr1).resetVotes()).to.be.revertedWith(
        "Only the owner can reset votes."
      );
    });

    it("Should handle reset with no votes cast", async function () {
      // Reset without any votes
      await voting.resetVotes();
      
      // Verify all proposals still have 0 votes
      for (let i = 0; i < proposals.length; i++) {
        const proposal = await voting.getProposal(i);
        expect(proposal.voteCount).to.equal(0);
      }
    });
  });

  describe("Edge Cases and Validation", function () {
    it("Should handle voting for the last proposal", async function () {
      const lastIndex = proposals.length - 1;
      await voting.connect(addr1).vote(lastIndex);
      
      const proposal = await voting.getProposal(lastIndex);
      expect(proposal.voteCount).to.equal(1);
    });

    it("Should return correct proposal count", async function () {
      const count = await voting.getProposalCount();
      expect(count).to.equal(proposals.length);
    });

    it("Should handle multiple users voting for the same proposal", async function () {
      const [, user1, user2, user3] = await ethers.getSigners();
      
      await voting.connect(user1).vote(0);
      await voting.connect(user2).vote(0);
      await voting.connect(user3).vote(0);
      
      const proposal = await voting.getProposal(0);
      expect(proposal.voteCount).to.equal(3);
    });

    it("Should maintain vote counts across different proposals", async function () {
      const [, user1, user2, user3, user4] = await ethers.getSigners();
      
      await voting.connect(user1).vote(0);
      await voting.connect(user2).vote(0);
      await voting.connect(user3).vote(1);
      await voting.connect(user4).vote(2);
      
      const proposal0 = await voting.getProposal(0);
      const proposal1 = await voting.getProposal(1);
      const proposal2 = await voting.getProposal(2);
      
      expect(proposal0.voteCount).to.equal(2);
      expect(proposal1.voteCount).to.equal(1);
      expect(proposal2.voteCount).to.equal(1);
    });
  });

  describe("Gas and Performance Considerations", function () {
    it("Should handle reset with multiple voters efficiently", async function () {
      // Get multiple signers for voting
      const signers = await ethers.getSigners();
      const voters = signers.slice(1, 11); // Use 10 voters
      
      // Have all voters vote
      for (let i = 0; i < voters.length; i++) {
        await voting.connect(voters[i]).vote(i % proposals.length);
      }
      
      // Verify votes were cast
      const proposal0 = await voting.getProposal(0);
      expect(proposal0.voteCount).to.be.greaterThan(0);
      
      // Reset votes
      const tx = await voting.resetVotes();
      const receipt = await tx.wait();
      
      // Verify reset was successful
      const proposalAfterReset = await voting.getProposal(0);
      expect(proposalAfterReset.voteCount).to.equal(0);
      
      // Log gas used for documentation
      console.log(`      Gas used for resetting 10 voters: ${receipt?.gasUsed.toString()}`);
    });
  });
});

