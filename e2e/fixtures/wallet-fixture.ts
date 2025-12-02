/**
 * Wallet Test Fixture
 * 
 * Provides a reusable fixture that includes VotingPage and MetaMaskHelper
 * for all wallet-based tests.
 */

import { testWithSynpress } from '@synthetixio/synpress'
import { MetaMask, metaMaskFixtures } from '@synthetixio/synpress/playwright'
import basicSetup from '../basic.setup'
import { VotingPage } from '../pages/VotingPage'
import { MetaMaskHelper } from '../pages/MetaMaskHelper'

// Create test instance with Synpress and MetaMask fixtures
const test = testWithSynpress(metaMaskFixtures(basicSetup))
const { expect } = test

// Extend the test fixture with our custom page objects
export const walletTest = test.extend<{
  votingPage: VotingPage
  metamaskHelper: MetaMaskHelper
}>({
  votingPage: async ({ page }, use) => {
    const votingPage = new VotingPage(page)
    await use(votingPage)
  },

  metamaskHelper: async ({ context, metamaskPage, extensionId }, use) => {
    const metamask = new MetaMask(
      context,
      metamaskPage,
      basicSetup.walletPassword,
      extensionId
    )
    const helper = new MetaMaskHelper(metamask)
    await use(helper)
  },
})

export { expect }

