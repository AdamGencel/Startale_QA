/**
 * Page Object Model for Voting DApp
 * 
 * This class encapsulates all interactions with the Voting DApp UI,
 * including selectors, assertions, and common actions.
 */

import { Page, Locator, expect } from '@playwright/test'

export class VotingPage {
  readonly page: Page

  readonly selectors = {
    // Header
    title: 'h1',
    subtitle: 'p',
    headerContract: '.header p',
    
    // Wallet
    walletSection: '.wallet-section',
    connectButton: '[data-testid="connect-wallet-button"]',
    walletInfo: '[data-testid="wallet-info"]',
    walletAddress: '[data-testid="wallet-address"]',
    connectTitle: 'h2',
    connectInstructions: 'text=/Connect your MetaMask wallet/i',
    
    // Proposals
    proposalsSection: '.proposals-section',
    proposalList: '[data-testid="proposal-list"]',
    proposalName: (index: number) => `[data-testid="proposal-name-${index}"]`,
    voteCount: (index: number) => `[data-testid="vote-count-${index}"]`,
    voteButton: (index: number) => `[data-testid="vote-button-${index}"]`,
    voteButtonAll: '[data-testid^="vote-button-"]',
    votedBadge: '[data-testid="voted-badge"]',
    
    // Messages
    successMessage: '[data-testid="success-message"]',
    errorMessage: '[data-testid="error-message"]',
    votingErrorMessage: '[data-testid="voting-error"]',
    
    // Owner
    ownerBadge: '[data-testid="owner-badge"]',
    resetVotesButton: '[data-testid="reset-votes-button"]',
    resetConfirmModal: '[data-testid="reset-confirm-modal"]',
    resetConfirmButton: '[data-testid="reset-confirm-button"]',
  }

  constructor(page: Page) {
    this.page = page
  }

  // === Navigation ===
  async goto() {
    await this.page.goto('/')
  }

  // === Wallet Actions ===
  async clickConnectWallet() {
    await this.page.locator(this.selectors.connectButton).click()
  }

  async getDisplayedAddress(): Promise<string | null> {
    return await this.page.locator(this.selectors.walletAddress).textContent()
  }

  // === Proposal Actions ===
  getProposalName(index: number): Locator {
    return this.page.locator(this.selectors.proposalName(index))
  }

  getVoteCount(index: number): Locator {
    return this.page.locator(this.selectors.voteCount(index))
  }

  getVoteButton(index: number): Locator {
    return this.page.locator(this.selectors.voteButton(index))
  }

  getAllVoteButtons(): Locator {
    return this.page.locator(this.selectors.voteButtonAll)
  }

  getVotedBadge(): Locator {
    return this.page.locator(this.selectors.votedBadge)
  }

  getVotingErrorMessage(): Locator {
    return this.page.locator(this.selectors.votingErrorMessage)
  }

  async clickVote(proposalIndex: number) {
    await this.getVoteButton(proposalIndex).click()
  }

  async getVoteCountText(proposalIndex: number): Promise<string | null> {
    return await this.getVoteCount(proposalIndex).textContent()
  }

  // === Reset Votes Actions ===
  async clickResetVotes() {
    await this.page.locator(this.selectors.resetVotesButton).click()
  }

  async confirmResetVotes() {
    await this.page.locator(this.selectors.resetConfirmButton).click()
  }

  async isOwner(): Promise<boolean> {
    try {
      return await this.page.locator(this.selectors.ownerBadge).isVisible({ timeout: 2_000 })
    } catch {
      return false
    }
  }

  async hasVoted(): Promise<boolean> {
    try {
      // Check if any vote buttons are disabled
      const firstButton = this.getVoteButton(0)
      return await firstButton.isDisabled({ timeout: 2_000 })
    } catch {
      return false
    }
  }

  // === Wait Methods ===
  async waitForProposalsToLoad() {
    await this.page.waitForSelector(this.selectors.proposalList, { timeout: 10_000 })
  }

  async waitForSuccessMessage() {
    await expect(this.page.locator(this.selectors.successMessage)).toBeVisible({ timeout: 30_000 })
  }

  async waitForSuccessMessageToDisappear() {
    await expect(this.page.locator(this.selectors.successMessage)).toBeHidden({ timeout: 10_000 })
  }

  async waitForVotingErrorMessage(expectedText?: string) {
    const errorMessage = this.getVotingErrorMessage()
    await expect(errorMessage).toBeVisible({ timeout: 5_000 })
    if (expectedText) {
      await expect(errorMessage).toContainText(expectedText)
    }
  }

  async waitForVoteCountToChange(proposalIndex: number, previousCount: string) {
    await expect(this.getVoteCount(proposalIndex))
      .not.toHaveText(previousCount, { timeout: 10_000 })
  }

  async waitForVoteButtonDisabled(proposalIndex: number) {
    await expect(this.getVoteButton(proposalIndex)).toBeDisabled({ timeout: 5_000 })
  }

  async waitForAllVoteButtonsDisabled() {
    const buttons = this.getAllVoteButtons()
    const count = await buttons.count()
    
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeDisabled({ timeout: 5_000 })
    }
  }

  async waitForVotedBadge() {
    await expect(this.getVotedBadge().first()).toBeVisible({ timeout: 5_000 })
  }

  async waitForModalToAppear() {
    await expect(this.page.locator(this.selectors.resetConfirmModal)).toBeVisible({ timeout: 5_000 })
  }

  async waitForModalToDisappear() {
    await expect(this.page.locator(this.selectors.resetConfirmModal)).toBeHidden({ timeout: 5_000 })
  }

  async assertInitialUIState() {

    await expect(this.page.locator(this.selectors.title)).toContainText('Voting DApp')
    await expect(this.page.locator(this.selectors.subtitle).first()).toContainText('Decentralized Voting Application')
    await expect(this.page.locator(this.selectors.headerContract).last()).toContainText('Contract:')

    await expect(this.page.locator(this.selectors.walletSection)).toBeVisible()
    await expect(this.page.locator(this.selectors.connectButton)).toBeVisible()
    await expect(this.page.locator(this.selectors.connectButton)).toHaveText(/Connect MetaMask/i)
    await expect(this.page.locator(this.selectors.connectButton)).toBeEnabled()

    await expect(this.page.locator(this.selectors.connectTitle)).toContainText('Connect Your Wallet')
    await expect(this.page.getByText(/Connect your MetaMask wallet/i)).toBeVisible()

    await expect(this.page.locator(this.selectors.proposalsSection)).not.toBeVisible()
    await expect(this.page.locator(this.selectors.proposalList)).not.toBeVisible()
  }

  // === Assertions - Connected State ===


  async assertWalletConnected(expectedAddressPrefix?: string) {
    await expect(this.page.locator(this.selectors.walletInfo)).toBeVisible()
    
    if (expectedAddressPrefix) {
      const address = await this.getDisplayedAddress()
      expect(address?.toLowerCase()).toContain(expectedAddressPrefix.toLowerCase())
    }
  }

  async assertChainId(chainId: string) {
    await expect(this.page.locator(this.selectors.walletInfo)).toContainText(chainId)
  }

  async assertProposalCount(count: number) {
    await expect(this.getAllVoteButtons()).toHaveCount(count)
  }

  async assertProposalName(index: number, name: string) {
    await expect(this.getProposalName(index)).toContainText(name)
  }

  async assertVoteButtonDisabled(index: number) {
    await expect(this.getVoteButton(index)).toBeDisabled()
  }

  async assertAllVoteButtonsDisabled() {
    const buttons = this.getAllVoteButtons()
    const count = await buttons.count()
    
    for (let i = 0; i < count; i++) {
      await expect(buttons.nth(i)).toBeDisabled()
    }
  }

  async assertVotedBadgeVisible() {
    await expect(this.getVotedBadge().first()).toBeVisible()
  }
}

