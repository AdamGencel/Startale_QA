// Import necessary Playwright and Synpress modules
import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright configuration for E2E tests
 * Uses tsconfig.e2e.json with bundler resolution for Synpress compatibility
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false, // Important for wallet tests
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: 1, // Run wallet tests sequentially
  reporter: 'html',
  
  use: {
    // Set base URL for tests
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  // Synpress works with standard Playwright config
});
