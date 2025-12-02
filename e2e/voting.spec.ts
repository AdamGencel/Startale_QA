
import { walletTest, expect } from './fixtures/wallet-fixture'
import { PROPOSALS, BLOCKCHAIN } from './fixtures/test-data'

// ===========================================================================
// WALLET INTEGRATION TESTS
// ===========================================================================

walletTest.describe('Wallet Connection and Display Tests', () => {
  walletTest('connects wallet and displays complete dApp state', async ({
    votingPage,
    metamaskHelper,
  }) => {
    // Navigate to the dApp
    await votingPage.goto()

    // Connect wallet using helper
    await metamaskHelper.connectWallet(votingPage)

    // ===== Wallet Connection Verification =====
    await votingPage.assertWalletConnected(BLOCKCHAIN.DEFAULT_ADDRESS_PREFIX)
    await votingPage.assertChainId(BLOCKCHAIN.CHAIN_ID)

    // ===== Proposal Display Verification =====
    await votingPage.waitForProposalsToLoad()

    // Verify proposal count and names
    await votingPage.assertProposalCount(PROPOSALS.COUNT)
    await votingPage.assertProposalName(PROPOSALS.INDICES.FIRST, PROPOSALS.NAMES[0])
    await votingPage.assertProposalName(PROPOSALS.INDICES.SECOND, PROPOSALS.NAMES[1])
    await votingPage.assertProposalName(PROPOSALS.INDICES.THIRD, PROPOSALS.NAMES[2])
  })
})

walletTest.describe('Voting Functionality Tests', () => {
  // Setup: Ensure clean state before each test
  walletTest.beforeEach(async ({ votingPage, metamaskHelper }) => {
    await votingPage.goto()
    await metamaskHelper.connectWallet(votingPage)
    await votingPage.waitForProposalsToLoad()
    
    // Reset votes if already voted (ensures clean blockchain state) Owner only functionality
    await metamaskHelper.resetVotesIfNeeded(votingPage)
  })

  walletTest('allows user to vote for a proposal', async ({
    votingPage,
    metamaskHelper,
  }) => {
    // Get initial vote count
    const initialVoteCount = await votingPage.getVoteCountText(PROPOSALS.INDICES.FIRST)

    // Vote for first proposal
    await metamaskHelper.voteForProposal(votingPage, PROPOSALS.INDICES.FIRST)

    // Wait for vote count to change (indicates blockchain state updated)
    await votingPage.waitForVoteCountToChange(PROPOSALS.INDICES.FIRST, initialVoteCount!)

    // Verify "Already Voted" badge appears
    await votingPage.waitForVotedBadge()

    // Verify vote button is disabled
    await votingPage.waitForVoteButtonDisabled(PROPOSALS.INDICES.FIRST)
  })

  walletTest('prevents double voting for the same user', async ({
    votingPage,
    metamaskHelper,
  }) => {
    // Vote for first proposal
    await metamaskHelper.voteForProposal(votingPage, PROPOSALS.INDICES.FIRST)

    // Wait for "Already Voted" badge to appear (indicates voting state updated)
    await votingPage.waitForVotedBadge()

    // Verify all vote buttons are disabled
    await votingPage.waitForAllVoteButtonsDisabled()
  })
})

// ===========================================================================
// ERROR HANDLING AND NEGATIVE PATH TESTS
// ===========================================================================

walletTest.describe('Error Handling', () => {
  walletTest.beforeEach(async ({ votingPage, metamaskHelper }) => {
    await votingPage.goto()
    await metamaskHelper.connectWallet(votingPage)
    await votingPage.waitForProposalsToLoad()
    await metamaskHelper.resetVotesIfNeeded(votingPage)
  })

  walletTest('handles transaction rejection gracefully', async ({
    votingPage,
    metamaskHelper,
  }) => {
    // Click vote button
    await votingPage.clickVote(PROPOSALS.INDICES.FIRST)

    // Reject the transaction in MetaMask
    await metamaskHelper.metamask.rejectTransaction()

    // Verify error message is displayed
    await votingPage.waitForVotingErrorMessage('Transaction was rejected')

    // Verify vote count is still 0 (transaction was rejected)
    const voteCount = await votingPage.getVoteCountText(PROPOSALS.INDICES.FIRST)
    expect(voteCount).toContain('0')

    // Verify user can still vote (no state change occurred)
    const voteButton = votingPage.getVoteButton(PROPOSALS.INDICES.FIRST)
    await expect(voteButton).toBeEnabled()
  })
})
