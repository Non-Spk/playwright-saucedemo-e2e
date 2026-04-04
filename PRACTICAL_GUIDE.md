# Practical Guide: Playwright + TypeScript Project

---

## 1. Project Setup

เริ่มต้นสร้างโปรเจค Playwright พร้อม TypeScript โดยใช้ CLI ของ Playwright โดยตรง

### Prerequisites

ก่อนเริ่ม ต้องมีสิ่งเหล่านี้ติดตั้งในเครื่องก่อน:

- [Node.js](https://nodejs.org/) (แนะนำ v18 ขึ้นไป) - ตรวจสอบด้วย `node -v`
- npm (มาพร้อมกับ Node.js) - ตรวจสอบด้วย `npm -v`
- Code editor เช่น [VS Code](https://code.visualstudio.com/)

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

เลือก `Yes` เพื่อดาวน์โหลด browser binaries (Chromium, Firefox, WebKit) ทันที
หรือจะติดตั้งทีหลังด้วยคำสั่ง `npx playwright install` ก็ได้

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

เขียน test case แรกเพื่อทดสอบว่า Playwright ทำงานได้ถูกต้อง ขั้นตอนนี้เน้นให้เห็นภาพการทำงานก่อน ยังไม่ต้องตรวจสอบอะไรซับซ้อน

### 3.1 สร้างไฟล์ test

สร้างไฟล์ `src/tests/login.spec.ts`

```ts
import { test, expect } from '@playwright/test';

test('Should open login page successfully', async ({ page }) => {
    await page.goto('https://www.saucedemo.com/');

    // ตรวจสอบว่าเปิดหน้าเว็บได้จริง โดยดูจาก title ของหน้า
    await expect(page).toHaveTitle('Swag Labs');
});
```

- `test()` - ฟังก์ชันหลักสำหรับสร้าง test case
- `page.goto()` - นำทางไปยัง URL ที่ต้องการทดสอบ
- `expect(page).toHaveTitle()` - ตรวจสอบว่า title ของหน้าเว็บตรงกับที่คาดหวัง

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
// ใช้แค่ page (ใช้บ่อยที่สุด)
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

ผลลัพธ์ที่ควรเห็นเมื่อ test ผ่าน:

```
Running 1 test using 1 worker

  ✓  src/tests/login.spec.ts:3:5 › Should open login page successfully (2s)

  1 passed (3s)
```

ถ้า test fail จะแสดง error message บอกว่าอะไรไม่ตรงกับที่คาดหวัง พร้อม diff ให้เปรียบเทียบ

ดู report หลังรัน:

```sh
npx playwright show-report
```

---

## 4. Assertions with expect

ก่อนจะเขียน test ที่ซับซ้อนขึ้น ต้องเข้าใจ `expect` ก่อน - มันคือฟังก์ชันสำหรับตรวจสอบผลลัพธ์ว่าตรงตามที่คาดหวังหรือไม่ ([Assertions | Playwright](https://playwright.dev/docs/test-assertions))

### 4.1 Web-First Assertions (Auto-retrying)

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

> **สำคัญ:** แนะนำให้ใช้ Web-First Assertions เป็นหลัก เพราะ auto-retry ช่วยลด flaky test ได้มาก

### 4.2 Generic Assertions (Non-retrying)

assertions ทั่วไปที่ไม่มี auto-retry ใช้สำหรับตรวจสอบค่าที่ได้มาแล้ว ไม่ต้องใช้ `await`

| Assertion | คำอธิบาย |
|-----------|----------|
| `expect(value).toBe(expected)` | ค่าเท่ากันแบบ strict (===) |
| `expect(value).toEqual(expected)` | ค่าเท่ากันแบบ deep equality |
| `expect(value).toBeTruthy()` | ค่าเป็น truthy |
| `expect(value).toContain(item)` | string มี substring หรือ array มี element |
| `expect(value).toHaveLength(n)` | array หรือ string มีความยาวตามที่ระบุ |

### 4.3 ตัวอย่างเปรียบเทียบ

```ts
// Non-retrying: ดึงค่ามาก่อน แล้วค่อยเทียบ (ไม่แนะนำถ้าเลี่ยงได้)
const value = await page.locator('#username').inputValue();
expect(value).toBe('testuser');

// Web-first: retry อัตโนมัติจนกว่า input จะมีค่าตรง (แนะนำ)
await expect(page.locator('#username')).toHaveValue('testuser');
```

### 4.4 Negating Assertions

ใช้ `.not` เพื่อตรวจสอบว่าเงื่อนไขไม่เป็นจริง:

```ts
await expect(page.locator('.error')).not.toBeVisible();
expect(value).not.toBe(0);
```

### 4.5 Soft Assertions

ปกติถ้า assertion fail จะหยุด test ทันที แต่ `expect.soft()` จะให้ test ทำงานต่อได้ แล้วค่อยรายงานผลรวมทีเดียว:

```ts
await expect.soft(page.locator('#status')).toHaveText('Success');
await expect.soft(page.locator('#message')).toHaveText('Done');
// test จะทำงานต่อแม้ assertion ด้านบน fail
```

---

## 5. Page Object Model (POM)

เมื่อเข้าใจ assertions แล้ว ขั้นตอนต่อไปคือจัดโครงสร้างโค้ดให้ดูแลง่าย โดยแยก logic การทำงานกับหน้าเว็บออกจาก test file เพื่อให้โค้ดอ่านง่าย ดูแลง่าย และ reuse ได้ ([Page Object Models | Playwright](https://playwright.dev/docs/pom))

ลองนึกภาพว่าถ้ามี 20 test cases ที่ต้องกรอก username/password แล้ววันหนึ่ง locator เปลี่ยน - ถ้าไม่ใช้ POM ต้องแก้ทั้ง 20 ไฟล์ แต่ถ้าใช้ POM แก้แค่จุดเดียว

### 5.1 สร้าง Page Object

สร้างโฟลเดอร์ `src/pages/` สำหรับเก็บ page objects แล้วสร้างไฟล์ `login.page.ts`:

```ts
import { Page } from '@playwright/test';

export class LoginPage {
    baseUrl = 'https://www.saucedemo.com/';

    locatorUsername = '[data-test="username"]';
    locatorPassword = '#password';
    locatorButtonLogin = '//input[@data-test="login-button"]';
    locatorErrorMessage = '[data-test="error"]';

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

    async getErrorMessage() {
        try {
            return await this.page.locator(this.locatorErrorMessage).textContent() || '';
        } catch (error) {
            return '';
        }
    }

    isValidUrl(): boolean {
        const currentUrl = this.page.url().replace(/\/$/, '');
        const expectedUrl = this.baseUrl.replace(/\/$/, '');
        return currentUrl === expectedUrl;
    }
}
```

หลักการ:
- รับ `page: Page` ผ่าน constructor เพื่อใช้ Playwright API
- เก็บ locator selectors เป็น property ไว้ที่เดียว - ถ้า UI เปลี่ยนแก้แค่จุดเดียว
- แต่ละ method ทำหน้าที่เดียว (goto, fill, click, get value)
- `getErrorMessage()` ใช้ `try/catch` เพื่อ handle กรณีที่ error element ไม่แสดง
- `isValidUrl()` ตรวจสอบว่ายังอยู่หน้า login หรือถูก redirect ไปหน้าอื่นแล้ว (login สำเร็จ = URL เปลี่ยน)

### 5.2 ใช้ Page Object ใน test

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

### 5.3 Custom Fixtures สำหรับ Page Object

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

### 5.4 ใช้ Custom Fixture ใน test

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

## 6. Test Organization with describe

เมื่อเริ่มมี test หลายตัว ควรจัดกลุ่มให้เป็นระเบียบตั้งแต่เนิ่นๆ ไม่งั้นพอ test เยอะขึ้นจะหาอะไรลำบาก

### 6.1 จัดกลุ่ม test ด้วย test.describe

ใช้ `test.describe()` เพื่อจัดกลุ่ม test cases ที่เกี่ยวข้องกันไว้ด้วยกัน ทำให้ report อ่านง่ายและจัดการ scope ของ hooks ได้:

```ts
import { expect } from '@playwright/test';
import { test } from '../pages/base';

test.describe('LOGIN FUNCTION', () => {
    test('TC-001: Input fields should display as the data that was filled', async ({ loginPage }) => {
        await loginPage.goto();
        await loginPage.fillUserPassword('testuser', 'password');
        expect(await loginPage.getUsername()).toBe('testuser');
        expect(await loginPage.getPassword()).toBe('password');
    });

    test('TC-002: Should show error if log in without a username', async ({ loginPage }) => {
        await loginPage.goto();
        await loginPage.fillUserPassword('', 'password');
        await loginPage.clickLogin();
        // ...
    });
});
```

หลักการ:
- `test.describe()` ครอบ test cases ที่ทดสอบ feature เดียวกัน
- ใส่ TC number (TC-001, TC-002, ...) ใน test name เพื่อให้ trace กลับไปหา test case ได้ง่าย
- report จะแสดงเป็นโครงสร้าง tree ตาม describe group

### 6.2 Nested describe

สามารถซ้อน describe ได้หลายชั้นเพื่อจัดกลุ่มย่อย:

```ts
test.describe('LOGIN FUNCTION', () => {
    test.describe('Valid credentials', () => {
        test('TC-005: Should login with standard_user', async ({ loginPage }) => {
            // ...
        });
    });

    test.describe('Invalid credentials', () => {
        test('TC-006: Should show error with wrong password', async ({ loginPage }) => {
            // ...
        });
    });
});
```

---

## 7. Test Hooks and Data-Driven Testing

### 7.1 beforeEach - setup ก่อนทุก test

สังเกตว่าทุก test ต้องเรียก `loginPage.goto()` ซ้ำทุกครั้ง ใช้ `test.beforeEach()` เพื่อรันโค้ดซ้ำก่อนทุก test case ลดการเขียนซ้ำ:

```ts
test.describe('LOGIN FUNCTION', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    // ทุก test ด้านล่างนี้จะเปิดหน้า login ก่อนอัตโนมัติ ไม่ต้องเขียน goto() เอง

    test('TC-001: Input fields should display as the data that was filled', async ({ loginPage }) => {
        await loginPage.fillUserPassword('testuser', 'password');
        expect(await loginPage.getUsername()).toBe('testuser');
        expect(await loginPage.getPassword()).toBe('password');
    });

    test('TC-002: Should show error without username', async ({ loginPage }) => {
        await loginPage.fillUserPassword('', 'password');
        await loginPage.clickLogin();
        // ...
    });
});
```

`beforeEach` ภายใน describe จะทำงานเฉพาะ test ในกลุ่มนั้น

### 7.2 Data-Driven Testing ด้วย forEach

ถ้ามี test case ที่ logic เหมือนกันแต่ใช้ data ต่างกัน ไม่ต้อง copy-paste test ซ้ำหลายรอบ ใช้ `forEach` loop สร้าง test case จาก data set ได้:

```ts
const validUsers = [
    { username: 'standard_user', password: 'secret_sauce' },
    { username: 'performance_glitch_user', password: 'secret_sauce' },
];

validUsers.forEach(({ username, password }) => {
    test(`TC-005: Should logged in successfully: ${username}`, async ({ loginPage }) => {
        await loginPage.fillUserPassword(username, password);
        await loginPage.clickLogin();
        expect(loginPage.isValidUrl()).toBe(false); // redirect ออกจากหน้า login = สำเร็จ (ดู isValidUrl() ใน step 5.1)
    });
});
```

หลักการ:
- ใช้ template literal ใน test name เพื่อให้ report แสดงชื่อ user ที่ทดสอบ
- แต่ละ item ใน array จะสร้าง test case แยกกัน - fail ตัวหนึ่งไม่กระทบตัวอื่น
- เพิ่ม test data ใหม่ได้โดยไม่ต้องเขียน test เพิ่ม

### 7.3 Error Message Validation

ใน step 5.1 เราได้เพิ่ม method `getErrorMessage()` และ `isValidUrl()` ไว้ใน Page Object แล้ว ตอนนี้เอามาใช้จริงได้เลย:

```ts
test('TC-002: Should show error if log in without username', async ({ loginPage }) => {
    await loginPage.fillUserPassword('', 'password');
    await loginPage.clickLogin();
    const message = await loginPage.getErrorMessage();
    expect(message).toBe('Epic sadface: Username is required');
    expect(loginPage.isValidUrl()).toBe(true); // ยังอยู่หน้า login = ล็อกอินไม่สำเร็จ
});
```

---

## 8. Test Data Management

จาก step 7 เราเขียน data ไว้ใน test file โดยตรง แต่พอ data เยอะขึ้นจะรกมาก ควรแยก test data ออกมาเป็นไฟล์ต่างหากเพื่อให้จัดการง่ายและ reuse ได้

### 8.1 สร้างไฟล์ test data

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

### 8.2 ใช้ test data ใน test file

```ts
import { expect } from '@playwright/test';
import { test } from '../pages/base';
import { invalidUsers, lockedUsers, validUsers } from '../test-data/users';

test.describe('LOGIN FUNCTION', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('TC-001: Input fields should display as the data that was filled', async ({ loginPage }) => {
        await loginPage.fillUserPassword('testuser', 'password');
        expect(await loginPage.getUsername()).toBe('testuser');
        expect(await loginPage.getPassword()).toBe('password');
    });

    validUsers.forEach(({ username, password }) => {
        test(`TC-005: Should logged in successfully: ${username}`, async ({ loginPage }) => {
            await loginPage.fillUserPassword(username, password);
            await loginPage.clickLogin();
            expect(loginPage.isValidUrl()).toBe(false);
        });
    });

    invalidUsers.forEach(({ username, password }) => {
        test(`TC-006: Should show error with invalid credentials: ${username}`, async ({ loginPage }) => {
            await loginPage.fillUserPassword(username, password);
            await loginPage.clickLogin();
            const message = await loginPage.getErrorMessage();
            expect(message).toBe('Epic sadface: Username and password do not match any user in this service');
            expect(loginPage.isValidUrl()).toBe(true);
        });
    });

    lockedUsers.forEach(({ username, password }) => {
        test(`TC-007: Should show locked out error: ${username}`, async ({ loginPage }) => {
            await loginPage.fillUserPassword(username, password);
            await loginPage.clickLogin();
            const message = await loginPage.getErrorMessage();
            expect(message).toBe('Epic sadface: Sorry, this user has been locked out.');
            expect(loginPage.isValidUrl()).toBe(true);
        });
    });
});
```

> **Tip:** สังเกตว่า error message strings ยังถูก hardcode ไว้ในแต่ละ test ถ้าอยากจัดการให้ดีขึ้น ดู step 11 เรื่อง Translation Management ที่จะแยก messages ออกเป็น JSON ไฟล์กลาง

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
```

---

## 9. Utility Functions

เมื่อโปรเจคเริ่มโตขึ้น จะมี logic บางอย่างที่ใช้ซ้ำหลายที่ ควรแยกออกมาเป็น utility functions เพื่อให้ดูแลง่ายและ reuse ได้

### 9.1 สร้างไฟล์ utility

สร้างโฟลเดอร์ `src/utils/` แล้วสร้างไฟล์ `index.ts`:

```ts
export function removeTrailingSlash(url: string = ''): string {
    return url.replace(/\/$/, '');
}
```

### 9.2 Refactor Page Object ให้ใช้ utility

ใน step 5.1 เราเขียน `isValidUrl()` ด้วย inline regex ซึ่งใช้งานได้ แต่ถ้ามี Page Object หลายตัวที่ต้องเทียบ URL เหมือนกัน ควร refactor ให้ใช้ utility แทน:

```ts
import { Page } from '@playwright/test';
import { removeTrailingSlash } from '../utils';

export class LoginPage {
    // ...

    isValidUrl(): boolean {
        const actualUrl = removeTrailingSlash(this.page.url());
        const expectedUrl = removeTrailingSlash(this.baseUrl);
        return actualUrl === expectedUrl;
    }
}
```

หลักการ:
- แยก logic ที่ใช้ซ้ำออกมาเป็น function กลาง
- ใช้ ES module (`export`) ให้ consistent กับทั้งโปรเจค
- ตั้งชื่อ function ให้สื่อความหมาย (`removeTrailingSlash` ชัดกว่า `removeSlashUrl`)

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

---

## 10. Reporter, Trace, and Screenshot Configuration

### 10.1 ตั้งค่า reporter

ใน `playwright.config.ts` ปรับ reporter ให้สร้าง HTML report โดยไม่เปิด browser อัตโนมัติ:

```ts
reporter: [['html', { open: 'never' }]],
```

ค่า `open` ที่ใช้ได้:
- `'always'` - เปิด report ทุกครั้งหลังรัน test
- `'never'` - ไม่เปิดอัตโนมัติ ดูเองด้วย `npx playwright show-report`
- `'on-failure'` - เปิดเฉพาะเมื่อมี test fail

### 10.2 เปิด Trace และ Screenshot

```ts
use: {
    trace: 'on',        // บันทึก trace ทุกครั้ง
    screenshot: 'on',   // ถ่าย screenshot ทุกครั้ง
    headless: false,     // เปิด browser ให้เห็น
},
```

ค่า trace ที่ใช้ได้:
- `'on'` - บันทึกทุก test
- `'off'` - ไม่บันทึก
- `'on-first-retry'` - บันทึกเฉพาะตอน retry (แนะนำสำหรับ CI)
- `'retain-on-failure'` - เก็บเฉพาะ test ที่ fail

ค่า screenshot ที่ใช้ได้:
- `'on'` - ถ่ายทุก test
- `'off'` - ไม่ถ่าย
- `'only-on-failure'` - ถ่ายเฉพาะ test ที่ fail

### 10.3 ดู Trace และ Report

ดู HTML report:

```sh
npx playwright show-report
```

ดู trace ของ test ที่ต้องการ:

```sh
npx playwright show-trace test-results/<test-folder>/trace.zip
```

Trace viewer จะแสดง:
- timeline ของทุก action ที่ทำ
- screenshot ของแต่ละ step
- network requests
- console logs
- DOM snapshot ณ แต่ละจุด

---

## 11. Translation Management for Expected Messages (Advanced)

> **หมายเหตุ:** ส่วนนี้เป็น advanced topic - ถ้ายังเริ่มต้นอยู่สามารถข้ามไปก่อนได้ กลับมาอ่านทีหลังเมื่อโปรเจคเริ่มซับซ้อนขึ้น

แยก expected messages ออกจาก test file เป็น JSON เพื่อจัดการง่าย รองรับหลายภาษา และไม่ต้อง hardcode string ซ้ำในหลาย test

### 11.1 สร้างไฟล์ translation

สร้างโฟลเดอร์ `src/translations/` แล้วสร้างไฟล์ `en.json`:

```json
{
  "login": {
    "error": {
      "usernameRequired": "Epic sadface: Username is required",
      "passwordRequired": "Epic sadface: Password is required",
      "invalidCredentials": "Epic sadface: Username and password do not match any user in this service",
      "lockedOut": "Epic sadface: Sorry, this user has been locked out."
    }
  }
}
```

### 11.2 สร้าง translation loader

สร้างไฟล์ `src/translations/index.ts`:

```ts
import en from './en.json';

const translations: Record<string, typeof en> = { en };

const locale = process.env.LOCALE || 'en';

export default translations[locale] ?? translations['en'];
```

หลักการ:
- ใช้ `process.env.LOCALE` เพื่อเลือกภาษา - ค่าเริ่มต้นเป็น `en`
- fallback กลับไป `en` ถ้าไม่พบ locale ที่ระบุ
- เพิ่มภาษาใหม่ได้โดยสร้างไฟล์ JSON เพิ่ม (เช่น `th.json`) แล้ว import เข้ามา

### 11.3 ตั้งค่า tsconfig.json

เพิ่ม `tsconfig.json` ที่ root เพื่อให้ TypeScript import JSON ได้:

```json
{
  "compilerOptions": {
    "resolveJsonModule": true,
    "esModuleInterop": true
  }
}
```

- `resolveJsonModule` - อนุญาตให้ import ไฟล์ `.json` ได้
- `esModuleInterop` - ให้ใช้ `import x from 'module'` กับ CommonJS modules ได้

### 11.4 ใช้ translations ใน test

```ts
import { expect } from '@playwright/test';
import { test } from '../pages/base';
import translations from '../translations';

test.describe('LOGIN FUNCTION', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('TC-002: Should show error without username', async ({ loginPage }) => {
        await loginPage.fillUserPassword('', 'password');
        await loginPage.clickLogin();
        const message = await loginPage.getErrorMessage();
        expect(message).toBe(translations.login.error.usernameRequired);
        expect(loginPage.isValidUrl()).toBe(true);
    });

    test('TC-003: Should show error without password', async ({ loginPage }) => {
        await loginPage.fillUserPassword('testuser', '');
        await loginPage.clickLogin();
        const message = await loginPage.getErrorMessage();
        expect(message).toBe(translations.login.error.passwordRequired);
        expect(loginPage.isValidUrl()).toBe(true);
    });
});
```

ข้อดี:
- ถ้า message เปลี่ยน แก้แค่ใน JSON ไฟล์เดียว ไม่ต้องแก้ทุก test
- TypeScript จะ autocomplete key ให้ เช่น `translations.login.error.` จะแสดงตัวเลือก
- รองรับ multi-locale testing ผ่าน env var: `LOCALE=th npx playwright test`

### 11.5 รันด้วย locale ที่ต้องการ

```sh
# ใช้ภาษาเริ่มต้น (en)
npx playwright test

# ระบุ locale
LOCALE=th npx playwright test
```

โครงสร้างโปรเจคสุดท้าย:

```
src/
  pages/
    base.ts             # Custom Fixtures
    login.page.ts       # Page Object
  test-data/
    users.ts            # Test Data
  tests/
    login.spec.ts       # Test file
  translations/
    en.json             # English messages
    index.ts            # Translation loader
  utils/
    index.ts            # Utility Functions
tsconfig.json           # TypeScript config
```