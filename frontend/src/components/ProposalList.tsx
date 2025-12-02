import React, { useState } from 'react';
import { Proposal } from '../types/contracts';

interface ProposalListProps {
  proposals: Proposal[];
  hasVoted: boolean;
  isOwner: boolean;
  loading: boolean;
  onVote: (index: number) => Promise<boolean>;
  onReset: () => Promise<boolean>;
}

const SUCCESS_MESSAGE_DURATION = 5000; // 5 seconds

export const ProposalList: React.FC<ProposalListProps> = ({
  proposals,
  hasVoted,
  isOwner,
  loading,
  onVote,
  onReset,
}) => {
  const [votingFor, setVotingFor] = useState<number | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), SUCCESS_MESSAGE_DURATION);
  };

  const handleVote = async (index: number) => {
    setVotingFor(index);
    setSuccessMessage(null);
    
    const success = await onVote(index);
    
    if (success) {
      showSuccessMessage('Vote successfully recorded!');
    }
    
    setVotingFor(null);
  };

  const handleResetClick = () => {
    setShowResetConfirm(true);
  };

  const handleResetConfirm = async () => {
    setIsResetting(true);
    setShowResetConfirm(false);
    const success = await onReset();
    if (success) {
      showSuccessMessage('All votes have been reset!');
    }
    setIsResetting(false);
  };

  const handleResetCancel = () => {
    setShowResetConfirm(false);
  };

  if (proposals.length === 0) {
    return (
      <div className="loading">
        <div className="spinner"></div>
        <p>Loading proposals...</p>
      </div>
    );
  }

  return (
    <div className="proposals-section">
      <h2>Active Proposals</h2>

      {successMessage && (
        <div className="success-message" data-testid="success-message">
          {successMessage}
        </div>
      )}

      <div className="proposal-list" data-testid="proposal-list">
        {proposals.map((proposal) => (
          <div key={proposal.index} className="proposal-item" data-testid={`proposal-${proposal.index}`}>
            <div className="proposal-header">
              <div className="proposal-name" data-testid={`proposal-name-${proposal.index}`}>
                {proposal.name}
              </div>
              <div className="vote-count" data-testid={`vote-count-${proposal.index}`}>
                <span>🗳️</span>
                <span>{proposal.voteCount.toString()} votes</span>
              </div>
            </div>

            <div className="proposal-actions">
              <button
                className="btn btn-primary"
                onClick={() => handleVote(proposal.index)}
                disabled={hasVoted || loading || votingFor !== null}
                data-testid={`vote-button-${proposal.index}`}
              >
                {votingFor === proposal.index ? 'Voting...' : 'Vote'}
              </button>

              {hasVoted && (
                <span className="status-badge voted" data-testid="voted-badge">
                  ✓ Already Voted
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {isOwner && (
        <div className="owner-section">
          <div className="owner-badge" data-testid="owner-badge">
            👑 Owner Controls
          </div>
          <button
            className="btn btn-secondary"
            onClick={handleResetClick}
            disabled={loading || isResetting}
            data-testid="reset-votes-button"
          >
            {isResetting ? 'Resetting...' : 'Reset All Votes'}
          </button>
        </div>
      )}

      {showResetConfirm && (
        <div className="modal-overlay" data-testid="reset-confirm-modal">
          <div className="modal-content">
            <h3>⚠️ Confirm Reset</h3>
            <p>Are you sure you want to reset all votes?</p>
            <p className="warning-text">This action cannot be undone.</p>
            <div className="modal-actions">
              <button
                className="btn btn-secondary"
                onClick={handleResetCancel}
                data-testid="reset-cancel-button"
              >
                Cancel
              </button>
              <button
                className="btn btn-danger"
                onClick={handleResetConfirm}
                data-testid="reset-confirm-button"
              >
                Yes, Reset All Votes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

