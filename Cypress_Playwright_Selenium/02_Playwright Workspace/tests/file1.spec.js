const { test } = require('@playwright/test');
const paths = require('../fixtures/paths.json');
const users = require('../fixtures/user_data.json');

test.describe('Task 1: UI AUTOMATION TASK', () => {
  test('Logs in for Multiple Users', async ({ page }) => {
    for (const name of users.names) {
      await page.goto(paths.url);
      await eachCandidate(page, name, paths, users.password);
    }
  });
});

async function eachCandidate(page, name, paths, password) {
  await page.locator(paths.username).fill(name);
  await page.waitForTimeout(1000);
  
  await page.locator(paths.password).fill(password);
  await page.waitForTimeout(1000);
  
  await page.locator(paths.login).click();
  await page.waitForTimeout(1000);
}