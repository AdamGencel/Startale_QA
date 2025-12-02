/**
 * MetaMask Helper
 * 
 * Wraps MetaMask interactions and provides high-level methods
 * for common wallet operations in tests.
 */

import { MetaMask } from '@synthetixio/synpress/playwright'
import { VotingPage } from './VotingPage'

export class MetaMaskHelper {
  constructor(public readonly metamask: MetaMask) {}

  /**
   * Connect MetaMask to the dApp
   */
  async connectToDapp() {
    await this.metamask.connectToDapp()
  }

  /**
   * Confirm a transaction in MetaMask
   */
  async confirmTransaction() {
    await this.metamask.confirmTransaction()
  }

  /**
   * Complete wallet connection flow for the voting dApp
   */
  async connectWallet(votingPage: VotingPage) {
    await votingPage.clickConnectWallet()
    await this.connectToDapp()
  }

  /**
   * Vote for a proposal and confirm the transaction
   * @param votingPage - The voting page object
   * @param proposalIndex - Index of the proposal to vote for
   */
  async voteForProposal(votingPage: VotingPage, proposalIndex: number) {
    await votingPage.clickVote(proposalIndex)
    await this.confirmTransaction()
    await votingPage.waitForSuccessMessage()
  }

  /**
   * Reset votes (owner only) and confirm the transaction
   * @param votingPage - The voting page object
   */
  async resetVotes(votingPage: VotingPage) {
    // Check if user is owner
    const isOwner = await votingPage.isOwner()
    if (!isOwner) {
      throw new Error('Only the contract owner can reset votes')
    }

    // Wait for any pending transactions to settle
    await votingPage.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {})

    // Click reset button
    await votingPage.clickResetVotes()

    // Wait for confirmation modal to appear
    await votingPage.waitForModalToAppear()

    // Confirm reset
    await votingPage.confirmResetVotes()

    // Small delay for MetaMask popup to appear
    // Note: Hardcoded timeout is necessary here as MetaMask extension
    // popup timing is not deterministic and doesn't trigger load events
    await votingPage.page.waitForTimeout(1000)

    // Confirm transaction in MetaMask
    await this.confirmTransaction()

    // Wait for success message
    await votingPage.waitForSuccessMessage()

    // Wait for success message to disappear (indicates state update complete)
    await votingPage.waitForSuccessMessageToDisappear()
  }

  /**
   * Reset votes if the user has already voted
   * This ensures a clean state for tests that require fresh voting
   * @param votingPage - The voting page object
   * @param timeout - Maximum time to wait for reset (default: 15000ms)
   */
  async resetVotesIfNeeded(votingPage: VotingPage, timeout: number = 15000) {
    const startTime = Date.now()
    
    try {
      // Check if user is owner first (owner badge should be visible)
      const isOwner = await votingPage.isOwner()

      if (!isOwner) {
        // If not owner, can't reset - skip
        return
      }

      // Check if anyone has voted
      const hasVoted = await votingPage.hasVoted()

      if (!hasVoted) {
        // No votes to reset
        return
      }

      // Ensure we don't exceed timeout
      const elapsed = Date.now() - startTime
      if (elapsed > timeout) {
        throw new Error('Reset timeout exceeded')
      }

      // Reset votes to ensure clean state
      await this.resetVotes(votingPage)
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`Failed to reset votes: ${errorMessage}`)
    }
  }
}

