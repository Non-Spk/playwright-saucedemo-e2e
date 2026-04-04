# Practical Guide: Playwright + TypeScript Project

---

## 1. Project Setup

เริ่มต้นสร้างโปรเจค Playwright พร้อม TypeScript โดยใช้ CLI ของ Playwright โดยตรง

### 1.1 Initialize Playwright

ติดตั้ง Playwright ผ่าน npm โดยใช้คำสั่งด้านล่าง ([Reference](https://playwright.dev/docs/intro))

```sh
npm init playwright@latest
```

CLI จะถามคำถามเพื่อตั้งค่าโปรเจค ให้ตอบตามลำดับดังนี้:

### 1.2 เลือกภาษาเป็น TypeScript

```
? Do you want to use TypeScript or JavaScript?
> TypeScript
  JavaScript
```

### 1.3 กำหนด path สำหรับเก็บไฟล์ test

ระบุโฟลเดอร์ที่จะใช้เก็บ end-to-end tests (ค่าเริ่มต้นคือ `tests`)

```
? Where to put your end-to-end tests? >> tests
```

### 1.4 เพิ่ม GitHub Actions workflow

เลือก `Yes` เพื่อให้ Playwright สร้างไฟล์ workflow สำหรับรัน tests บน CI อัตโนมัติ

```
? Add a GitHub Actions workflow? (Y/n) >> Yes
```

### 1.5 ติดตั้ง Playwright browsers

เลือก `Yes` เพื่อดาวน์โหลด browser binaries (Chromium, Firefox, WebKit) ทันที หรือจะติดตั้งทีหลังด้วยคำสั่ง `npx playwright install` ก็ได้

```
? Install Playwright browsers (can be done manually via 'npx playwright install')? (Y/n) >> Yes
```

---

## 2. Project Structure Configuration

หลังจาก init เสร็จแล้ว ปรับโครงสร้างโปรเจคให้เหมาะกับการทำงานจริง

### 2.1 ย้าย test directory เข้า src

ย้ายโฟลเดอร์ tests เข้าไปอยู่ภายใต้ `src/` เพื่อจัดโครงสร้างให้เป็นระเบียบ และลบไฟล์ example ที่ไม่ใช้ออก

```
Before:                    After:
tests/                     src/
  example.spec.ts            tests/
                               login.spec.ts
```

### 2.2 อัปเดต playwright.config.ts

แก้ไข `testDir` ให้ชี้ไปยัง path ใหม่ และตั้งค่าที่จำเป็น

```ts
export default defineConfig({
  testDir: './src/tests',
  // ...
  use: {
    trace: 'on-first-retry',
    headless: false,       // เปิด browser ให้เห็นขณะรัน test
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // comment browser อื่นที่ยังไม่ใช้ออกได้
  ],
});
```

- `headless: false` - เปิด browser ให้เห็นขณะรัน เหมาะสำหรับช่วง develop
- เริ่มต้นใช้แค่ Chromium ก่อน เพิ่ม browser อื่นทีหลังได้

---

## 3. Writing Your First Test

เขียน test case แรกสำหรับทดสอบหน้า login

### 3.1 สร้างไฟล์ test

สร้างไฟล์ `src/tests/login.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('Input fields should display as the data that was filled', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
});
```

- `test()` - ฟังก์ชันหลักสำหรับสร้าง test case
- `page.goto()` - นำทางไปยัง URL ที่ต้องการทดสอบ

### 3.2 Built-in Fixtures

การเขียน `{ page }` ในพารามิเตอร์ของ test function คือการใช้ Built-in Fixtures ของ Playwright Test ([Fixtures | Playwright](https://playwright.dev/docs/test-fixtures))

Fixtures เป็นกลไกที่ Playwright ใช้เตรียม environment ให้แต่ละ test โดยอัตโนมัติ เมื่อระบุชื่อ fixture ใน argument ของ test function Playwright จะ setup ให้เองและ isolate ระหว่าง test แต่ละตัว

Built-in Fixtures ที่ใช้บ่อย:

| Fixture | Type | คำอธิบาย |
|---------|------|----------|
| `page` | `Page` | browser page ที่ถูก isolate สำหรับแต่ละ test |
| `context` | `BrowserContext` | browser context ที่ถูก isolate สำหรับแต่ละ test (page อยู่ภายใต้ context นี้) |
| `browser` | `Browser` | browser instance ที่ใช้ร่วมกันระหว่าง tests |
| `browserName` | `string` | ชื่อ browser ที่กำลังรัน (`chromium`, `firefox`, หรือ `webkit`) |
| `request` | `APIRequestContext` | สำหรับทำ API request โดยไม่ต้องเปิด browser |

ตัวอย่างการใช้งาน:

```ts
// ใช้แค่ page
test('basic test', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');
});

// ใช้หลาย fixtures พร้อมกัน
test('test with context', async ({ page, context, browserName }) => {
    console.log(`Running on ${browserName}`);
    await page.goto('https://www.saucedemo.com/');
});
```

Playwright จะ setup เฉพาะ fixtures ที่ test นั้นระบุไว้เท่านั้น ไม่ได้ setup ทุกตัวทุกครั้ง

### 3.3 รัน test

```sh
npx playwright test
```

หรือรันเฉพาะไฟล์:

```sh
npx playwright test src/tests/login.spec.ts
```

ดู report หลังรัน:

```sh
npx playwright show-report
```

---

## 4. Page Object Model (POM)

แยก logic การทำงานกับหน้าเว็บออกจาก test file เพื่อให้โค้ดอ่านง่าย ดูแลง่าย และ reuse ได้ ([Page Object Models | Playwright](https://playwright.dev/docs/pom))

### 4.1 สร้าง Page Object

สร้างโฟลเดอร์ `src/pages/` สำหรับเก็บ page objects แล้วสร้างไฟล์ `login.page.ts`:

```ts
import { Page } from '@playwright/test';

export class LoginPage {
    baseUrl = 'https://www.saucedemo.com/';

    locatorUsername = '[data-test="username"]';
    locatorPassword = '#password';
    locatorButtonLogin = '//input[@data-test="login-button"]';

    page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    async goto() {
        await this.page.goto(this.baseUrl);
    }

    async fillUserPassword(username: string, password: string) {
        await this.page.locator(this.locatorUsername).fill(username);
        await this.page.locator(this.locatorPassword).fill(password);
    }

    async clickLogin() {
        await this.page.locator(this.locatorButtonLogin).click();
    }

    async getUsername() {
        return await this.page.locator(this.locatorUsername).inputValue();
    }

    async getPassword() {
        return await this.page.locator(this.locatorPassword).inputValue();
    }
}
```

หลักการ:
- รับ `page: Page` ผ่าน constructor เพื่อใช้ Playwright API
- เก็บ locator selectors เป็น property ไว้ที่เดียว - ถ้า UI เปลี่ยนแก้แค่จุดเดียว
- แต่ละ method ทำหน้าที่เดียว (goto, fill, click, get value)

### 4.2 ใช้ Page Object ใน test

```ts
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';

test('Input fields should display as the data that was filled', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.fillUserPassword('testuser', 'password');
    expect(await loginPage.getUsername()).toBe('testuser');
    expect(await loginPage.getPassword()).toBe('password');
});
```

### 4.3 Custom Fixtures สำหรับ Page Object

แทนที่จะสร้าง `new LoginPage(page)` ในทุก test สามารถสร้าง custom fixture เพื่อ inject page object เข้า test โดยตรง

สร้างไฟล์ `src/pages/base.ts`:

```ts
import { test as base } from '@playwright/test';
import { LoginPage } from './login.page';

type baseFixtures = {
    loginPage: LoginPage;
};

export const test = base.extend<baseFixtures>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },
});
```

หลักการ:
- ใช้ `base.extend<T>()` เพื่อเพิ่ม fixture ใหม่เข้าไปใน `test`
- กำหนด type `baseFixtures` เพื่อให้ TypeScript รู้จัก fixture ที่เพิ่มเข้ามา
- ภายใน fixture ใช้ `use()` เพื่อส่ง instance ให้ test ใช้งาน
- เมื่อเพิ่ม page object ใหม่ (เช่น `InventoryPage`) ก็เพิ่มเข้ามาใน type และ extend ได้เลย

### 4.4 ใช้ Custom Fixture ใน test

```ts
import { expect } from '@playwright/test';
import { test } from '../pages/base';

test('Input fields should display as the data that was filled', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillUserPassword('testuser', 'password');
    expect(await loginPage.getUsername()).toBe('testuser');
    expect(await loginPage.getPassword()).toBe('password');
});
```

สังเกตว่า:
- import `test` จาก `../pages/base` แทน `@playwright/test`
- ใช้ `{ loginPage }` แทน `{ page }` - ไม่ต้องสร้าง instance เอง
- โค้ดสั้นลงและอ่านง่ายขึ้น

โครงสร้างโปรเจคตอนนี้:

```
src/
  pages/
    base.ts             # Custom Fixtures
    login.page.ts       # Page Object
  tests/
    login.spec.ts       # Test file
```

---

## 5. Assertions with expect

`expect` คือฟังก์ชันสำหรับตรวจสอบผลลัพธ์ใน test ว่าตรงตามที่คาดหวังหรือไม่ ([Assertions | Playwright](https://playwright.dev/docs/test-assertions))

### 5.1 Web-First Assertions (Auto-retrying)

Playwright มี assertions เฉพาะสำหรับ web ที่จะ retry อัตโนมัติจนกว่าเงื่อนไขจะเป็นจริง หรือจนกว่าจะ timeout (ค่าเริ่มต้น 5 วินาที) ต้องใช้ `await` เสมอ

assertions ที่ใช้บ่อย:

| Assertion | คำอธิบาย |
|-----------|----------|
| `await expect(locator).toBeVisible()` | element แสดงผลอยู่บนหน้า |
| `await expect(locator).toBeHidden()` | element ถูกซ่อนอยู่ |
| `await expect(locator).toBeEnabled()` | element สามารถใช้งานได้ |
| `await expect(locator).toBeDisabled()` | element ถูก disable |
| `await expect(locator).toHaveText('text')` | element มีข้อความตรงกับที่ระบุ |
| `await expect(locator).toContainText('text')` | element มีข้อความที่ระบุอยู่ภายใน |
| `await expect(locator).toHaveValue('value')` | input มีค่าตรงกับที่ระบุ |
| `await expect(locator).toHaveAttribute('attr', 'val')` | element มี attribute ตรงกับที่ระบุ |
| `await expect(page).toHaveURL('url')` | หน้าเว็บมี URL ตรงกับที่ระบุ |
| `await expect(page).toHaveTitle('title')` | หน้าเว็บมี title ตรงกับที่ระบุ |

### 5.2 Generic Assertions (Non-retrying)

assertions ทั่วไปที่ไม่มี auto-retry ใช้สำหรับตรวจสอบค่าที่ได้มาแล้ว ไม่ต้องใช้ `await`

| Assertion | คำอธิบาย |
|-----------|----------|
| `expect(value).toBe(expected)` | ค่าเท่ากันแบบ strict (===) |
| `expect(value).toEqual(expected)` | ค่าเท่ากันแบบ deep equality |
| `expect(value).toBeTruthy()` | ค่าเป็น truthy |
| `expect(value).toContain(item)` | string มี substring หรือ array มี element |
| `expect(value).toHaveLength(n)` | array หรือ string มีความยาวตามที่ระบุ |

### 5.3 ตัวอย่างการใช้งานจริง

จากไฟล์ `src/tests/login.spec.ts` ที่ใช้ Custom Fixture + Page Object Model:

```ts
import { expect } from '@playwright/test';
import { test } from '../pages/base';

test('Input fields should display as the data that was filled', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillUserPassword('testuser', 'password');
    // non-retrying assertion - ใช้ getter ดึงค่ามาแล้วเทียบด้วย toBe()
    expect(await loginPage.getUsername()).toBe('testuser');
    expect(await loginPage.getPassword()).toBe('password');
});
```

วิธีข้างบนใช้ `getUsername()` / `getPassword()` (ซึ่งภายในเรียก `inputValue()`) แล้วเทียบด้วย `toBe()` ซึ่งเป็น non-retrying assertion

แนะนำให้ใช้ web-first assertion `toHaveValue()` แทน เพราะจะ retry อัตโนมัติ ลด flaky test:

```ts
test('Input fields - recommended approach', async ({ loginPage }) => {
    await loginPage.goto();
    await loginPage.fillUserPassword('testuser', 'password');
    // web-first assertion - retry อัตโนมัติจนกว่า input จะมีค่าตรง
    await expect(loginPage.page.locator('[data-test="username"]')).toHaveValue('testuser');
    await expect(loginPage.page.locator('#password')).toHaveValue('password');
});
```

### 5.4 Negating Assertions

ใช้ `.not` เพื่อตรวจสอบว่าเงื่อนไขไม่เป็นจริง:

```ts
await expect(page.locator('.error')).not.toBeVisible();
expect(value).not.toBe(0);
```

### 5.5 Soft Assertions

ปกติถ้า assertion fail จะหยุด test ทันที แต่ `expect.soft()` จะให้ test ทำงานต่อได้ แล้วค่อยรายงานผลรวมทีเดียว:

```ts
await expect.soft(page.locator('#status')).toHaveText('Success');
await expect.soft(page.locator('#message')).toHaveText('Done');
// test จะทำงานต่อแม้ assertion ด้านบน fail
```

---

## 6. Test Data Management

แยก test data ออกจาก test file เพื่อให้จัดการง่ายและ reuse ได้

### 6.1 สร้างไฟล์ test data

สร้างโฟลเดอร์ `src/test-data/` แล้วสร้างไฟล์ `users.ts`:

```ts
const validUsers = [
    { username: 'standard_user', password: 'secret_sauce' },
    { username: 'performance_glitch_user', password: 'secret_sauce' },
    { username: 'visual_user', password: 'secret_sauce' },
];

const lockedUsers = [
    { username: 'locked_out_user', password: 'secret_sauce' },
];

const invalidUsers = [
    { username: 'standard_user', password: 'password' },
];

export { validUsers, lockedUsers, invalidUsers };
```

หลักการ:
- แยก data ออกจาก test logic - เปลี่ยน data ได้โดยไม่ต้องแก้ test
- จัดกลุ่ม data ตาม scenario (valid, invalid, locked)
- ใช้ `export` เพื่อให้ test file อื่นเรียกใช้ได้

---

## 7. Utility Functions

สร้าง helper functions ที่ใช้ร่วมกันทั้งโปรเจค

### 7.1 สร้างไฟล์ utility

สร้างโฟลเดอร์ `src/utils/` แล้วสร้างไฟล์ `index.ts`:

```ts
function removeSlashUrl(url: string = '') {
    let newUrl = url;
    if (url[url.length - 1] === '/') {
        newUrl = url.substring(0, url.length - 1);
    }
    return newUrl;
}

module.exports = { removeSlashUrl };
```

### 7.2 ใช้ utility ใน Page Object

```ts
const { removeSlashUrl } = require('../utils');

export class LoginPage {
    // ...

    isValidUrl() {
        const actual_url = removeSlashUrl(this.page.url());
        return actual_url === this.baseUrl;
    }
}
```

ใช้ `isValidUrl()` เพื่อตรวจสอบว่ายังอยู่หน้า login หรือถูก redirect ไปหน้าอื่นแล้ว (login สำเร็จ)

---

## 8. Test Hooks and Data-Driven Testing

### 8.1 beforeEach - setup ก่อนทุก test

ใช้ `test.beforeEach()` เพื่อรันโค้ดซ้ำก่อนทุก test case ลดการเขียนซ้ำ:

```ts
test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
});
```

ทุก test ใน file นี้จะเปิดหน้า login ก่อนอัตโนมัติ ไม่ต้องเขียน `goto()` ในแต่ละ test

### 8.2 Data-Driven Testing ด้วย forEach

ใช้ `forEach` loop กับ test data เพื่อสร้าง test case หลายตัวจาก data set เดียว:

```ts
import { validUsers, invalidUsers, lockedUsers } from '../test-data/users';

validUsers.forEach(({ username, password }) => {
    test(`Should logged in successfully with valid credentials: ${username}`, async ({ loginPage }) => {
        await loginPage.fillUserPassword(username, password);
        await loginPage.clickLogin();
        expect(loginPage.isValidUrl()).toBe(false); // redirect ออกจากหน้า login = สำเร็จ
    });
});

invalidUsers.forEach(({ username, password }) => {
    test(`Should show error with invalid credentials: ${username}`, async ({ loginPage }) => {
        await loginPage.fillUserPassword(username, password);
        await loginPage.clickLogin();
        const message = await loginPage.getErrorMessage();
        expect(message).toBe('Epic sadface: Username and password do not match any user in this service');
        expect(loginPage.isValidUrl()).toBe(true); // ยังอยู่หน้า login = ล็อกอินไม่สำเร็จ
    });
});
```

หลักการ:
- ใช้ template literal ใน test name เพื่อให้ report แสดงชื่อ user ที่ทดสอบ
- แต่ละ item ใน array จะสร้าง test case แยกกัน - fail ตัวหนึ่งไม่กระทบตัวอื่น
- เพิ่ม test data ใหม่ได้โดยไม่ต้องเขียน test เพิ่ม

### 8.3 Error Message Validation

เพิ่ม method `getErrorMessage()` ใน Page Object เพื่อดึงข้อความ error:

```ts
async getErrorMessage() {
    try {
        return await this.page.locator(this.locatorErrorMessage).textContent() || '';
    } catch (error) {
        return '';
    }
}
```

ใช้ `try/catch` เพื่อ handle กรณีที่ error element ไม่แสดง (เช่น login สำเร็จ)

ตัวอย่าง test ที่ตรวจสอบ error message:

```ts
test('Should show error if log in without username', async ({ loginPage }) => {
    await loginPage.fillUserPassword('', 'password');
    await loginPage.clickLogin();
    const message = await loginPage.getErrorMessage();
    expect(message).toBe('Epic sadface: Username is required');
    expect(loginPage.isValidUrl()).toBe(true);
});
```

โครงสร้างโปรเจคตอนนี้:

```
src/
  pages/
    base.ts             # Custom Fixtures
    login.page.ts       # Page Object
  test-data/
    users.ts            # Test Data
  tests/
    login.spec.ts       # Test file
  utils/
    index.ts            # Utility Functions
```
