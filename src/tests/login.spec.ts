import { test, expect } from '@playwright/test';

test('Input fields should display as the data that was filled', async ({page}) => {
    await page.goto('https://www.saucedemo.com/')

    await page.locator('[data-test="username"]').fill('testuser');
    expect (await page.locator('[data-test="username"]').inputValue()).toBe('testuser');

    await page.locator('#password').fill('password');
    expect (await page.locator('#password').inputValue()).toBe('password');
});
