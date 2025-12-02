
// === URLs ===
export const URLS = {
  DAPP: 'http://localhost:3000',
  DAPP_ROOT: '/',
} as const



// === Blockchain Configuration ===
export const BLOCKCHAIN = {
  CHAIN_ID: '1337',
  NETWORK_NAME: 'Hardhat Local',
  RPC_URL: 'http://127.0.0.1:8545',
  SYMBOL: 'ETH',
  DEFAULT_ADDRESS_PREFIX: '0xf39f', // First Hardhat test account
} as const

// === Proposals ===
export const PROPOSALS = {
  NAMES: ['Proposal A', 'Proposal B', 'Proposal C'],
  COUNT: 3,
  INDICES: {
    FIRST: 0,
    SECOND: 1,
    THIRD: 2,
  },
} as const


