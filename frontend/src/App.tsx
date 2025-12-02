import React from 'react';
import { WalletConnect } from './components/WalletConnect';
import { ProposalList } from './components/ProposalList';
import { useWallet } from './hooks/useWallet';
import { useVoting } from './hooks/useVoting';
import { formatAddress } from './utils/formatters';

function App() {
  const wallet = useWallet();
  const voting = useVoting({
    provider: wallet.provider,
    signer: wallet.signer,
    account: wallet.account,
  });

  return (
    <div className="app">
      <div className="header">
        <h1>🗳️ Voting DApp</h1>
        <p>Decentralized Voting Application on Ethereum</p>
        {voting.contractAddress && (
          <p className="contract-address">
            Contract: {formatAddress(voting.contractAddress, 10, 8)}
          </p>
        )}
      </div>

      <div className="card">
        <WalletConnect
          isConnected={wallet.isConnected}
          account={wallet.account}
          chainId={wallet.chainId}
          isConnecting={wallet.isConnecting}
          onConnect={wallet.connect}
          onDisconnect={wallet.disconnect}
        />

        {wallet.error && (
          <div className="error-message" data-testid="wallet-error">
            {wallet.error}
          </div>
        )}
      </div>

      {wallet.isConnected && (
        <div className="card">
          {voting.error && (
            <div className="error-message" data-testid="voting-error">
              {voting.error}
            </div>
          )}

          <ProposalList
            proposals={voting.proposals}
            hasVoted={voting.hasVoted}
            isOwner={voting.isOwner}
            loading={voting.loading}
            onVote={voting.vote}
            onReset={voting.resetVotes}
          />
        </div>
      )}
    </div>
  );
}

export default App;

