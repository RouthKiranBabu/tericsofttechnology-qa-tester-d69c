const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');
const paths = require('../fixtures/paths.json');
const users = require('../fixtures/user_data.json');

test.describe('Task 1: UI AUTOMATION TASK', () => {
  test('First Candidate as Performer...', async ({ page }) => {
    //test.setTimeout(60000); // Increases timeout to 60 seconds for this test
    await eachCandidate(page, users, paths);
  });
});

async function eachCandidate(page, users, paths) {
  const delayGap = 1000;
  // 1. Login
  await page.goto(paths.url);
  await page.locator(paths.username).fill(users.names[0]);
  await page.locator(paths.password).fill(users.password);
  await page.locator(paths.login).click();
  await page.waitForTimeout(delayGap);

  // 2. Sort & Add first two items to cart
  await page.locator(paths.filter).selectOption({ label: 'Price (low to high)' });
  await page.locator(`(${paths.add_to_cart}//button)[1]`).click();
  await page.locator(`(${paths.add_to_cart}//button)[2]`).click();
  await page.waitForTimeout(delayGap);

  // 3. Collect item details & save to cart_items.json
  const collectedItems = {};
  
  collectedItems.first_title = (await page.locator(`(${paths.add_to_cart})[1]//a`).innerText()).trim();
  collectedItems.second_title = (await page.locator(`(${paths.add_to_cart})[2]//a`).innerText()).trim();
  collectedItems.first_item_description = (await page.locator(`(${paths.add_to_cart})[1]//div[@class='inventory_item_desc']`).innerText()).trim();
  collectedItems.second_item_description = (await page.locator(`(${paths.add_to_cart})[2]//div[@class='inventory_item_desc']`).innerText()).trim();

  const cartItemsPath = path.join(__dirname, '../fixtures/cart_items.json');
  fs.writeFileSync(cartItemsPath, JSON.stringify([collectedItems], null, 2));
  await page.waitForTimeout(delayGap);

  // 4. Open Cart & Verify items against saved JSON
  await page.locator(paths.cart).click();
  const items = JSON.parse(fs.readFileSync(cartItemsPath, 'utf-8'));

  expect(items[0].second_item_description).toContain('3 lighting modes, 1 AAA battery');

  await expect(page.locator(`(${paths.cart_items})[1]/a`)).toContainText(items[0].first_title);
  await expect(page.locator(`(${paths.cart_items})[1]/div[1]`)).toContainText(items[0].first_item_description);
  await expect(page.locator(`(${paths.cart_items})[2]/a`)).toContainText(items[0].second_title);
  await expect(page.locator(`(${paths.cart_items})[2]/div[1]`)).toContainText(items[0].second_item_description);
  await page.waitForTimeout(delayGap);

  // 5. Save second cart item to removed_items.json & remove it
  const removedItem = {};
  removedItem.title = (await page.locator(`(${paths.cart_items})[2]/a`).innerText()).trim();
  removedItem.description = (await page.locator(`(${paths.cart_items})[2]/div[1]`).innerText()).trim();

  const removedItemsPath = path.join(__dirname, '../fixtures/removed_items.json');
  fs.writeFileSync(removedItemsPath, JSON.stringify([removedItem], null, 2));

  await page.locator(`(${paths.cart_items})[2]//button`).click();
  await page.waitForTimeout(delayGap);

  // 6. Continue shopping & re-add the removed item
  await page.locator(paths.continue_shoping).click();

  const removedItemsData = JSON.parse(fs.readFileSync(removedItemsPath, 'utf-8'));
  const inventoryCards = page.locator(paths.add_to_cart);
  const count = await inventoryCards.count();

  for (let i = 0; i < count; i++) {
    const card = inventoryCards.nth(i);
    const title = (await card.locator("[id*='title_link']").innerText()).trim();
    const description = (await card.locator('.inventory_item_desc').innerText()).trim();

    if (
      title.includes(removedItemsData[0].title) &&
      description.includes(removedItemsData[0].description)
    ) {
      await card.locator('xpath=.//button').click();
    }
  }
  await page.waitForTimeout(delayGap);

  // 7. Checkout Flow
  await page.locator(paths.cart).click();
  await page.locator(paths.checkout).click();

  const firstname = `first_name_${Math.random() * 100}`;
  const lastname = `last_name_${Math.random() * 100}`;
  const zipcode = `${Math.floor(Math.random() * 100)}`;

  await page.locator(paths.checkout_firstname).fill(firstname);
  await page.locator(paths.checkout_lastname).fill(lastname);
  await page.locator(paths.checkout_postalcode).fill(zipcode);
  await page.locator(paths.checkout_continue).click();
  await page.waitForTimeout(delayGap);

  // 8. Calculate & Verify Subtotal
  const priceLocators = page.locator(paths.price);
  const priceCount = await priceLocators.count();
  let sum = 0;

  for (let i = 0; i < priceCount; i++) {
    const priceText = await priceLocators.nth(i).innerText();
    sum += parseFloat(priceText.substring(1));
  }

  const totalText = await page.locator(paths.total).innerText();
  const total = parseFloat(totalText.substring(totalText.indexOf('$') + 1));
  expect(sum).toBe(total);
  await page.waitForTimeout(delayGap);

  // 9. Finish Order & Logout
  await page.locator(paths.finish).click();

  await expect(page.locator(paths.success_message_header)).toContainText('Thank you for your order!');
  await expect(page.locator(paths.success_message_text)).toContainText(
    'Your order has been dispatched, and will arrive just as fast as the pony can get there!'
  );
  await page.waitForTimeout(delayGap);

  await page.locator(paths.back_to_home).click();
  await page.locator(paths.menu).click();
  await page.locator(paths.logout).click();
  await page.waitForTimeout(delayGap);
}