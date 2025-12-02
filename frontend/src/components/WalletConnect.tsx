import React from 'react';
import { formatAddress } from '../utils/formatters';

interface WalletConnectProps {
  isConnected: boolean;
  account: string | null;
  chainId: number | null;
  isConnecting: boolean;
  onConnect: () => void;
  onDisconnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  isConnected,
  account,
  chainId,
  isConnecting,
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="wallet-section">
      {!isConnected ? (
        <>
          <h2>Connect Your Wallet</h2>
          <p className="wallet-instruction">
            Connect your MetaMask wallet to participate in voting
          </p>
          <button
            className="btn btn-primary"
            onClick={onConnect}
            disabled={isConnecting}
            data-testid="connect-wallet-button"
          >
            {isConnecting ? 'Connecting...' : 'Connect MetaMask'}
          </button>
        </>
      ) : (
        <div className="wallet-info" data-testid="wallet-info">
          <p>
            <strong>Connected Account:</strong>
          </p>
          <p className="address" data-testid="wallet-address">
            {account ? formatAddress(account) : 'No account'}
          </p>
          {chainId && (
            <p className="chain-info">
              <strong>Chain ID:</strong> {chainId}
            </p>
          )}
          <button
            className="btn btn-secondary"
            onClick={onDisconnect}
            style={{ marginTop: '15px' }}
            data-testid="disconnect-wallet-button"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};

