import { Page } from '@playwright/test';
const { removeSlashUrl } = require('../utils');

export class LoginPage {
    baseUrl = 'https://www.saucedemo.com';

    locatorUsername = '[data-test="username"]'
    locatorPassword = '#password'
    locatorButtonLogin = '//input[@data-test="login-button"]'
    locatorErrorMessage = '[data-test="error"]'

    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(this.baseUrl);
    }

    async fillUserPassword(username: string, password: string){
        await this.page.locator(this.locatorUsername).fill(username);
        await this.page.locator(this.locatorPassword).fill(password);
    }

    async clickLogin(){
        await this.page.locator(this.locatorButtonLogin).click();
    }

    async getUsername(){
        return await this.page.locator(this.locatorUsername).inputValue()
    }

    async getPassword(){
        return await this.page.locator(this.locatorPassword).inputValue()
    }

    async getErrorMessage(){
        try {
            return await this.page.locator(this.locatorErrorMessage).textContent() || "";
        } catch (error) {
            return ""
        }
    }

    isValidUrl(){
        const actual_url = removeSlashUrl(this.page.url());
        return actual_url === this.baseUrl;
    }
}
