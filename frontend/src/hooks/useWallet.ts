import { useState, useEffect, useRef } from 'react';
import { ethers } from 'ethers';

export interface WalletState {
  account: string | null;
  provider: ethers.BrowserProvider | null;
  signer: ethers.Signer | null;
  chainId: number | null;
  isConnecting: boolean;
  error: string | null;
}

const INITIAL_WALLET_STATE: WalletState = {
  account: null,
  provider: null,
  signer: null,
  chainId: null,
  isConnecting: false,
  error: null,
};

export function useWallet() {
  const [walletState, setWalletState] = useState<WalletState>(INITIAL_WALLET_STATE);
  const accountRef = useRef<string | null>(null);

  const connect = async () => {
    if (!window.ethereum) {
      setWalletState(prev => ({
        ...prev,
        error: 'MetaMask is not installed. Please install MetaMask to use this dApp.',
      }));
      return;
    }

    try {
      setWalletState(prev => ({ ...prev, isConnecting: true, error: null }));

      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send('eth_requestAccounts', []);
      const signer = await provider.getSigner();
      const network = await provider.getNetwork();

      const newAccount = accounts[0];
      accountRef.current = newAccount;

      setWalletState({
        account: newAccount,
        provider,
        signer,
        chainId: Number(network.chainId),
        isConnecting: false,
        error: null,
      });
    } catch (error: unknown) {
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({
        ...prev,
        isConnecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
    }
  };

  const disconnect = () => {
    accountRef.current = null;
    setWalletState(INITIAL_WALLET_STATE);
  };

  useEffect(() => {
    if (!window.ethereum) return;

    const handleAccountsChanged = (accounts: unknown) => {
      const accountsArray = accounts as string[];
      if (accountsArray.length === 0) {
        disconnect();
      } else if (accountsArray[0] !== accountRef.current) {
        accountRef.current = accountsArray[0];
        setWalletState(prev => ({ ...prev, account: accountsArray[0] }));
      }
    };

    const handleChainChanged = () => {
      window.location.reload();
    };

    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', handleChainChanged);

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []); // Empty dependencies - event handlers use ref

  return {
    ...walletState,
    connect,
    disconnect,
    isConnected: walletState.account !== null,
  };
}

