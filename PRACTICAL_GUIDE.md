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
- `page` - Playwright จะสร้าง browser page ให้อัตโนมัติผ่าน fixture
- `page.goto()` - นำทางไปยัง URL ที่ต้องการทดสอบ

### 3.2 รัน test

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
