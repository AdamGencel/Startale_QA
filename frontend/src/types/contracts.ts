import { ethers } from 'ethers';

export interface Proposal {
  name: string;
  voteCount: bigint;
  index: number;
}

export interface DeploymentInfo {
  address: string;
  owner: string;
  proposals: string[];
  network: string;
  chainId: number;
}

export const VOTING_ABI = [
  "constructor(string[] memory proposalNames)",
  "function vote(uint proposalIndex) public",
  "function getProposal(uint index) public view returns (string memory name, uint voteCount)",
  "function getProposalCount() public view returns (uint)",
  "function hasVoted(address) public view returns (bool)",
  "function owner() public view returns (address)",
  "function resetVotes() public"
];

export interface VotingContract extends ethers.Contract {
  vote(proposalIndex: number): Promise<ethers.ContractTransactionResponse>;
  getProposal(index: number): Promise<[string, bigint]>;
  getProposalCount(): Promise<bigint>;
  hasVoted(address: string): Promise<boolean>;
  owner(): Promise<string>;
  resetVotes(): Promise<ethers.ContractTransactionResponse>;
}

