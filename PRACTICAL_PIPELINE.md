# Practical Guide: GitHub Actions Pipeline 101

สำหรับคนที่เคยใช้ Jenkins มาก่อน guide นี้จะอธิบาย GitHub Actions โดยเทียบกับ concept ที่คุ้นเคยใน Jenkins

---

## 1. Jenkins vs GitHub Actions - เทียบ concept

| Jenkins | GitHub Actions | คำอธิบาย |
|---------|---------------|----------|
| Jenkinsfile | `.github/workflows/*.yml` | ไฟล์กำหนด pipeline |
| Pipeline | Workflow | กระบวนการ CI/CD ทั้งหมด |
| Stage | Job | กลุ่มของงานที่ทำ |
| Step | Step | แต่ละคำสั่งที่รัน |
| Agent / Node | Runner (`runs-on`) | เครื่องที่ใช้รัน pipeline |
| Plugin | Action (`uses`) | ส่วนเสริมสำเร็จรูปที่เรียกใช้ได้ |
| Trigger (SCM polling, webhook) | Event (`on`) | เงื่อนไขที่ทำให้ pipeline ทำงาน |
| Archive Artifacts | `upload-artifact` | เก็บไฟล์ผลลัพธ์หลังรัน |

ข้อแตกต่างหลัก:
- Jenkins ต้อง setup server เอง, GitHub Actions ใช้ runner ของ GitHub ได้เลย (ฟรีสำหรับ public repo)
- Jenkins ใช้ Groovy, GitHub Actions ใช้ YAML
- GitHub Actions มี marketplace ของ Actions สำเร็จรูปให้ใช้ได้ทันที

---

## 2. ไฟล์ Workflow อยู่ตรงไหน

```
.github/
  workflows/
    playwright.yml    <-- ไฟล์ workflow
```

- ต้องอยู่ใน `.github/workflows/` เท่านั้น GitHub ถึงจะรู้จัก
- ชื่อไฟล์อะไรก็ได้ ขอให้เป็น `.yml` หรือ `.yaml`
- repo เดียวมีได้หลาย workflow files

---

## 3. อธิบายทีละบรรทัด

ด้านล่างคือไฟล์ `.github/workflows/playwright.yml` พร้อมคำอธิบายทุกบรรทัด:

```yaml
name: Playwright Tests
```

ชื่อ workflow ที่จะแสดงใน tab "Actions" บน GitHub (เหมือนชื่อ pipeline ใน Jenkins)

---

### 3.1 Trigger (on) - เมื่อไหร่จะรัน

```yaml
on:
  push:
    branches: [ main, master ]
  pull_request:
    branches: [ main, master ]
```

กำหนดว่า workflow จะทำงานเมื่อไหร่:
- `push` - เมื่อมีคน push code ขึ้น branch `main` หรือ `master`
- `pull_request` - เมื่อมีคนเปิด/อัปเดต PR ที่จะ merge เข้า `main` หรือ `master`

เทียบกับ Jenkins: เหมือน trigger แบบ webhook หรือ SCM polling แต่ config ง่ายกว่ามาก

trigger อื่นที่ใช้บ่อย:

```yaml
on:
  schedule:
    - cron: '0 0 * * *'       # รันทุกวันตอนเที่ยงคืน (เหมือน Jenkins cron)
  workflow_dispatch:            # รันมือผ่านหน้าเว็บ (เหมือนกด Build Now)
```

---

### 3.2 Jobs - กลุ่มงาน

```yaml
jobs:
  test:
    timeout-minutes: 60
    runs-on: ubuntu-latest
```

- `jobs:` - กำหนด job ทั้งหมด (ถ้ามีหลาย job จะรัน parallel โดย default)
- `test:` - ชื่อ job (ตั้งอะไรก็ได้)
- `timeout-minutes: 60` - ถ้ารันเกิน 60 นาทีจะ cancel อัตโนมัติ
- `runs-on: ubuntu-latest` - ใช้เครื่อง Ubuntu ล่าสุดของ GitHub เป็น runner

เทียบกับ Jenkins: `runs-on` เหมือน `agent { label 'ubuntu' }` ใน Jenkinsfile

runner ที่ใช้ได้:

| Runner | OS |
|--------|----|
| `ubuntu-latest` | Ubuntu Linux |
| `windows-latest` | Windows Server |
| `macos-latest` | macOS |

---

### 3.3 Steps - แต่ละขั้นตอน

```yaml
    steps:
    - uses: actions/checkout@v4
```

Step แรก: checkout code จาก repo มาลงเครื่อง runner

เทียบกับ Jenkins: เหมือน `checkout scm` ใน Jenkinsfile แต่ใน Jenkins มันทำให้อัตโนมัติ ส่วน GitHub Actions ต้องเขียนเอง

`uses:` คือการเรียกใช้ Action สำเร็จรูป (เหมือน Jenkins Plugin) โดย `actions/checkout@v4` เป็น official action ของ GitHub

---

```yaml
    - uses: actions/setup-node@v4
      with:
        node-version: lts/*
```

Step ที่ 2: ติดตั้ง Node.js

- `actions/setup-node@v4` - Action สำหรับติดตั้ง Node.js
- `with:` - ส่ง parameter ให้ action (เหมือน plugin config ใน Jenkins)
- `node-version: lts/*` - ใช้ Node.js เวอร์ชัน LTS ล่าสุด

เทียบกับ Jenkins: เหมือน `tools { nodejs 'NodeJS-LTS' }` หรือ NodeJS Plugin

---

```yaml
    - name: Install dependencies
      run: npm ci
```

Step ที่ 3: ติดตั้ง dependencies

- `name:` - ชื่อ step ที่จะแสดงใน log (ไม่บังคับ แต่ช่วยอ่าน log ง่าย)
- `run:` - รัน shell command โดยตรง (เหมือน `sh 'npm ci'` ใน Jenkinsfile)
- `npm ci` ใช้แทน `npm install` เพราะติดตั้งตาม `package-lock.json` แบบ exact ไม่อัปเดต version เหมาะกับ CI

---

```yaml
    - name: Install Playwright Browsers
      run: npx playwright install --with-deps
```

Step ที่ 4: ดาวน์โหลด browser binaries ที่ Playwright ต้องใช้

- `--with-deps` ติดตั้ง OS-level dependencies ด้วย (เช่น libraries ที่ Chromium ต้องการบน Linux)

---

```yaml
    - name: Run Playwright tests
      run: npx playwright test
```

Step ที่ 5: รัน test จริง

---

```yaml
    - uses: actions/upload-artifact@v4
      if: ${{ !cancelled() }}
      with:
        name: playwright-report
        path: playwright-report/
        retention-days: 30
```

Step ที่ 6: อัปโหลด test report

- `actions/upload-artifact@v4` - Action สำหรับเก็บไฟล์ผลลัพธ์ (เหมือน "Archive Artifacts" ใน Jenkins)
- `if: ${{ !cancelled() }}` - รัน step นี้เสมอ ยกเว้นถูก cancel (แม้ test fail ก็ยังเก็บ report)
- `name: playwright-report` - ชื่อ artifact ที่จะแสดงบน GitHub
- `path: playwright-report/` - โฟลเดอร์ที่จะอัปโหลด
- `retention-days: 30` - เก็บไว้ 30 วันแล้วลบอัตโนมัติ

ดาวน์โหลด report ได้จาก tab Actions > เลือก workflow run > Artifacts section ด้านล่าง

---

## 4. if conditions ที่ใช้บ่อย

| Condition | ความหมาย |
|-----------|----------|
| `if: success()` | รันเมื่อ step ก่อนหน้าสำเร็จ (default) |
| `if: failure()` | รันเมื่อ step ก่อนหน้า fail |
| `if: always()` | รันเสมอไม่ว่าจะ pass หรือ fail |
| `if: ${{ !cancelled() }}` | รันเสมอ ยกเว้นถูก cancel |
| `if: github.event_name == 'push'` | รันเฉพาะเมื่อ trigger เป็น push |

---

## 5. Environment Variables

GitHub Actions set ตัวแปร `CI=true` ให้อัตโนมัติ ซึ่ง `playwright.config.ts` ใช้ตรวจสอบ:

```ts
// ใน playwright.config.ts
forbidOnly: !!process.env.CI,        // ห้ามใช้ test.only บน CI
retries: process.env.CI ? 2 : 0,     // retry 2 ครั้งบน CI
workers: process.env.CI ? 1 : undefined, // รัน 1 worker บน CI
headless: !!process.env.CI,           // headless บน CI, เปิด browser บน local
```

เพิ่ม env variable เองได้:

```yaml
    - name: Run Playwright tests
      run: npx playwright test
      env:
        LOCALE: en
        BASE_URL: https://www.saucedemo.com
```

---

## 6. ดู Pipeline Results

1. ไปที่ repo บน GitHub
2. คลิก tab "Actions"
3. เลือก workflow run ที่ต้องการดู
4. จะเห็น:
   - สถานะแต่ละ step (pass/fail)
   - log ของแต่ละ step (คลิกเพื่อขยาย)
   - Artifacts section ด้านล่าง (ดาวน์โหลด report ได้)

---

## 7. สรุปโครงสร้าง Workflow

```
name: ชื่อ workflow
  |
  on: เมื่อไหร่จะรัน (push, PR, schedule, manual)
  |
  jobs:
    job-name:
      runs-on: เครื่องที่ใช้รัน
      steps:
        - uses: เรียก Action สำเร็จรูป (เหมือน Jenkins Plugin)
        - run: รัน shell command (เหมือน sh ใน Jenkinsfile)
```

เทียบกับ Jenkinsfile:

```
// Jenkinsfile                    // GitHub Actions
pipeline {                        name: ...
  agent { label 'ubuntu' }       runs-on: ubuntu-latest
  triggers { ... }               on: { push, pull_request }
  stages {                        jobs:
    stage('Test') {                 test:
      steps {                         steps:
        sh 'npm ci'                     - run: npm ci
      }
    }
  }
  post {                            - if: ${{ !cancelled() }}
    always {                          uses: upload-artifact
      archiveArtifacts ...
    }
  }
}
```

---

## 8. Reference

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Workflow Syntax](https://docs.github.com/en/actions/writing-workflows/workflow-syntax-for-github-actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci-intro)
