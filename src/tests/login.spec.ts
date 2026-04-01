import { test, expect } from '@playwright/test';

test('Input fields should display as the data that was filled', async ({page}) => {
    await page.goto('https://www.saucedemo.com/')
});
