import { defineWalletSetup } from '@synthetixio/synpress'
import { MetaMask, getExtensionId } from '@synthetixio/synpress/playwright'

// Constants defined outside the setup function don't affect the cache hash
const SEED_PHRASE = 'test test test test test test test test test test test junk'
const PASSWORD = 'Tester@1234'

export default defineWalletSetup(PASSWORD, async (context, walletPage) => {
  // This is a workaround for the fact that the MetaMask extension ID changes
  const extensionId = await getExtensionId(context, 'MetaMask')
  
  const metamask = new MetaMask(context, walletPage, PASSWORD, extensionId)
  
  await metamask.importWallet(SEED_PHRASE)
  
  await metamask.addNetwork({
    name: 'Hardhat Local',
    rpcUrl: 'http://127.0.0.1:8545',
    chainId: 1337,
    symbol: 'ETH',
  })
  
  await metamask.switchNetwork('Hardhat Local')
})

