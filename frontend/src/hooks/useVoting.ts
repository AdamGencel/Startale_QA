import { useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import { Proposal, VotingContract, VOTING_ABI, DeploymentInfo } from '../types/contracts';

interface UseVotingProps {
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  account: string | null;
}

export function useVoting({ provider, signer, account }: UseVotingProps) {
  const [contract, setContract] = useState<VotingContract | null>(null);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [hasVoted, setHasVoted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deploymentInfo, setDeploymentInfo] = useState<DeploymentInfo | null>(null);

  // Load deployment info
  useEffect(() => {
    fetch('/deployment.json')
      .then(res => res.json())
      .then(data => setDeploymentInfo(data))
      .catch(err => {
        console.error('Failed to load deployment info:', err);
        setError('Contract not deployed. Please deploy the contract first.');
      });
  }, []);

  // Initialize contract
  useEffect(() => {
    if (!provider || !deploymentInfo) return;

    try {
      const votingContract = new ethers.Contract(
        deploymentInfo.address,
        VOTING_ABI,
        provider
      ) as VotingContract;

      setContract(votingContract);
    } catch (err) {
      console.error('Failed to initialize contract:', err);
      setError('Failed to initialize contract');
    }
  }, [provider, deploymentInfo]);

  // Load proposals
  const loadProposals = useCallback(async () => {
    if (!contract) return;

    try {
      setLoading(true);
      setError(null);

      const count = await contract.getProposalCount();
      const proposalPromises: Promise<Proposal>[] = [];

      for (let i = 0; i < Number(count); i++) {
        proposalPromises.push(
          contract.getProposal(i).then(([name, voteCount]) => ({
            name,
            voteCount,
            index: i,
          }))
        );
      }

      const loadedProposals = await Promise.all(proposalPromises);
      setProposals(loadedProposals);
    } catch (err) {
      console.error('Failed to load proposals:', err);
      setError('Failed to load proposals');
    } finally {
      setLoading(false);
    }
  }, [contract]);

  // Check if user has voted
  const checkHasVoted = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const voted = await contract.hasVoted(account);
      setHasVoted(voted);
    } catch (err) {
      console.error('Failed to check voting status:', err);
    }
  }, [contract, account]);

  // Check if user is owner
  const checkIsOwner = useCallback(async () => {
    if (!contract || !account) return;

    try {
      const owner = await contract.owner();
      setIsOwner(owner.toLowerCase() === account.toLowerCase());
    } catch (err) {
      console.error('Failed to check owner status:', err);
    }
  }, [contract, account]);

  // Refresh all contract data
  const refreshData = useCallback(async () => {
    await loadProposals();
    await checkHasVoted();
  }, [loadProposals, checkHasVoted]);

  // Vote for a proposal
  const vote = async (proposalIndex: number) => {
    if (!contract || !signer) {
      setError('Wallet not connected');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const contractWithSigner = contract.connect(signer) as VotingContract;
      const tx = await contractWithSigner.vote(proposalIndex);
      
      await tx.wait();
      await refreshData();

      return true;
    } catch (err: unknown) {
      console.error('Failed to vote:', err);
      if (err instanceof Error) {
        if (err.message.includes('already voted')) {
          setError('You have already voted');
        } else if (err.message.includes('user rejected')) {
          setError('Transaction was rejected');
        } else {
          setError('Failed to vote: ' + err.message);
        }
      } else {
        setError('Failed to vote');
      }
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Reset votes (owner only)
  const resetVotes = async () => {
    if (!contract || !signer || !isOwner) {
      setError('Only owner can reset votes');
      return false;
    }

    try {
      setLoading(true);
      setError(null);

      const contractWithSigner = contract.connect(signer) as VotingContract;
      const tx = await contractWithSigner.resetVotes();
      
      await tx.wait();
      await refreshData();

      return true;
    } catch (err: unknown) {
      console.error('Failed to reset votes:', err);
      setError(err instanceof Error ? err.message : 'Failed to reset votes');
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Load data when contract or account changes
  useEffect(() => {
    if (contract) {
      loadProposals();
    }
  }, [contract, loadProposals]);

  useEffect(() => {
    if (contract && account) {
      checkHasVoted();
      checkIsOwner();
    }
  }, [contract, account, checkHasVoted, checkIsOwner]);

  return {
    proposals,
    hasVoted,
    isOwner,
    loading,
    error,
    vote,
    resetVotes,
    refresh: loadProposals,
    contractAddress: deploymentInfo?.address,
  };
}

