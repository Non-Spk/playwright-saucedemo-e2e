# playwright-saucedemo-e2e

End-to-end automated testing for [SauceDemo](https://www.saucedemo.com/) web application using Playwright + TypeScript.

## Tech Stack

- [Playwright](https://playwright.dev/) - E2E testing framework
- TypeScript
- GitHub Actions (CI)

## Project Structure

```
src/
  pages/
    base.ts             # Custom Fixtures (inject page objects into tests)
    login.page.ts       # Login Page Object
  test-data/
    users.ts            # Test data (valid, invalid, locked users)
  tests/
    login.spec.ts       # Login test cases
  translations/
    en.json             # Expected messages (English)
    index.ts            # Locale-aware translation loader
  utils/
    index.ts            # Utility functions
playwright.config.ts    # Playwright configuration
tsconfig.json           # TypeScript configuration
```

## Prerequisites

- Node.js (LTS)
- npm

## Getting Started

```sh
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install --with-deps
```

## Running Tests

```sh
# Run all tests
npx playwright test

# Run specific test file
npx playwright test src/tests/login.spec.ts

# Run with UI mode
npx playwright test --ui
```

## Viewing Reports

```sh
npx playwright show-report
```

## CI/CD

Tests run automatically on push/PR to `main` via GitHub Actions. See `.github/workflows/playwright.yml`.

## Documentation

- [PRACTICAL_GUIDE.md](PRACTICAL_GUIDE.md) - Step-by-step guide for building this project with Playwright + TypeScript
- [PRACTICAL_PIPELINE.md](PRACTICAL_PIPELINE.md) - GitHub Actions pipeline 101 (with Jenkins comparison)

## License

MIT
