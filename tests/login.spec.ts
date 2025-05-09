/* eslint-disable no-console */
import { test, expect } from "@playwright/test";

/**
 * End-to-end tests for the login functionality
 * These tests verify that a user can log in and see their dashboard
 */

test.afterEach(async ({ page }) => {
  await page.close();
});

test.describe("Login and Dashboard tests", () => {
  test("should log in and display dashboard content", async ({ page }) => {
    // Navigate to the application
    await page.goto(process.env.BASE_URL || "http://localhost:5174/");

    // Verify we're on the login page
    await expect(
      page.getByText("Welcome to the Un:Hurd promotion portal")
    ).toBeVisible();

    // Fill login form
    await page.getByLabel("Username").fill("Ian Conner");
    await page.getByLabel("Password").fill("password");

    // Click sign in button and wait for navigation
    await page.getByRole("button", { name: "Sign in" }).click();

    // Wait for dashboard to load
    await page.waitForSelector("text=Welcome, Ian Conner");

    // Verify we're logged in by checking for welcome message
    await expect(page.getByText("Welcome, Ian Conner")).toBeVisible();

    // Check dashboard main header
    await expect(
      page.getByRole("heading", {
        name: "Manage promotion tasks for your releases",
        exact: false,
      })
    ).toBeVisible();

    // Check releases section header
    await expect(
      page.getByRole("heading", { name: "Your Releases", exact: true })
    ).toBeVisible();

    // Check if there are any releases displayed
    const releaseCardSelector = "main section:nth-child(2) .grid > div";
    const releaseCardCount = await page.locator(releaseCardSelector).count();

    if (releaseCardCount > 0) {
      console.log(`Found ${releaseCardCount} release cards`);

      // Check the first release card
      const firstReleaseCard = page.locator(releaseCardSelector).first();

      // Check for release title (any heading inside the card)
      await expect(firstReleaseCard.locator("h3")).toBeVisible();

      // Click to expand tasks if they're not visible
      const expandButton = firstReleaseCard.locator(
        'button:has-text("Show Tasks")'
      );
      if (await expandButton.isVisible()) {
        await expandButton.click();
      }

      // Check for tasks section (might need to be expanded first)
      await expect(
        firstReleaseCard.locator('div:has-text("Tasks")').first()
      ).toBeVisible();

      // Take a screenshot for verification
      await page.screenshot({ path: "dashboard-view.png" });
    } else {
      console.log("No release cards found");

      // If no releases, check for empty state message
      await expect(page.locator('text="No releases found."')).toBeVisible();
    }

    // Test logout functionality
    await page.getByRole("button", { name: "Logout" }).click();

    // Verify we're back on login page
    await expect(
      page.getByText("Welcome to the Un:Hurd promotion portal")
    ).toBeVisible();
  });

  test("should show error message with invalid login", async ({ page }) => {
    // Navigate to the application
    await page.goto("/");

    // Fill login form with invalid credentials
    await page.getByLabel("Username").fill("Invalid User");
    await page.getByLabel("Password").fill("wrongpassword");

    // Click sign in button
    await page.getByRole("button", { name: "Sign in" }).click();

    // Check for error message
    await expect(page.locator('div[role="alert"]')).toBeVisible();
    await expect(page.locator('div[role="alert"]')).toContainText(
      "Invalid username or password"
    );

    // Verify we're still on login page
    await expect(
      page.getByText("Welcome to the Un:Hurd promotion portal")
    ).toBeVisible();
  });
});
