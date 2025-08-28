# E2E Tests with Playwright

This directory contains end-to-end tests for the Surf Spots application using Playwright.

## Prerequisites

- Node.js 18+ installed
- Application dependencies installed (`npm install`)
- Application running on `http://localhost:5173` (`npm run dev`)

## Running Tests

### Install Playwright Browsers
```bash
npx playwright install
```

### Run All Tests
```bash
npm test
```

### Run Tests in UI Mode
```bash
npm run test:ui
```

### Run Tests in Headed Mode
```bash
npm run test:headed
```

### Run Tests in Debug Mode
```bash
npm run test:debug
```

### Run Specific Test File
```bash
npx playwright test landing-page.spec.ts
```

### Run Tests with Specific Browser
```bash
npx playwright test --project=chromium
```

## Test Structure

### Test Files
- `landing-page.spec.ts` - Landing page functionality
- `auth.spec.ts` - Authentication flows
- `surf-spots.spec.ts` - Surf spots browsing and navigation
- `navigation.spec.ts` - Navigation and routing
- `user-actions.spec.ts` - User interactions and forms
- `global.spec.ts` - Global functionality and error handling

### Test Utilities
- `utils/test-helpers.ts` - Common test helper functions

## Configuration

### Playwright Config (`playwright.config.ts`)
- **Base URL**: `http://localhost:5173`
- **Browsers**: Chromium, Firefox, WebKit, Mobile Chrome, Mobile Safari
- **Retries**: 2 on CI, 0 locally
- **Screenshots**: On failure only
- **Videos**: Retained on failure
- **Traces**: On first retry

### Global Setup/Teardown
- `global-setup.ts` - Verifies application is running
- `global-teardown.ts` - Cleans up test environment

## Test Patterns

### Page Navigation
```typescript
await page.goto('/surf-spots')
await expect(page).toHaveURL(/\/surf-spots/)
```

### Element Interaction
```typescript
await page.click('button:has-text("Add")')
await page.fill('input[name="email"]', 'test@example.com')
```

### Form Validation
```typescript
await page.click('button[type="submit"]')
await expect(page.locator('.error-message')).toBeVisible()
```

### Conditional Testing
```typescript
const element = page.locator('.optional-element')
if (await element.isVisible()) {
  await expect(element).toBeVisible()
}
```

## Utilities

### Test Helpers
```typescript
import { waitForPageLoad, isElementVisible, clickIfVisible } from './utils/test-helpers'

// Wait for page to load
await waitForPageLoad(page)

// Check if element is visible
const isVisible = await isElementVisible(page, '.my-element')

// Click if visible
await clickIfVisible(page, '.my-button')
```

## CI/CD Integration

### GitHub Actions
Two workflows are available:
- `e2e-tests.yml` - Full stack tests with Docker backend
- `e2e-tests-simple.yml` - Frontend-only tests

### Running in CI
```yaml
- name: Run E2E Tests
  run: |
    cd surf-spots
    npm run test
```

## Troubleshooting

### Common Issues

#### 1. Application Not Running
```
Error: Application is not running or not accessible
```
**Solution**: Start the development server
```bash
npm run dev
```

#### 2. Element Not Found
```
Error: locator.click: Target closed
```
**Solution**: Add proper waits and checks
```typescript
await page.waitForSelector('.my-element')
await page.click('.my-element')
```

#### 3. Test Timeouts
```
Error: Timeout 30000ms exceeded
```
**Solution**: Increase timeouts or add proper waits
```typescript
await page.waitForLoadState('networkidle')
await page.waitForTimeout(2000)
```

#### 4. Map Loading Issues
```
Error: Map container not found
```
**Solution**: Use map-specific helpers
```typescript
import { waitForMapLoad } from './utils/test-helpers'
await waitForMapLoad(page)
```

### Debug Mode
Run tests in debug mode to step through:
```bash
npm run test:debug
```

### Screenshots and Videos
Failed tests automatically generate:
- Screenshots: `test-results/`
- Videos: `test-results/`
- Traces: `test-results/`

### View Test Results
```bash
npx playwright show-report
```

## Best Practices

1. **Use Descriptive Test Names**: Clear test descriptions help with debugging
2. **Add Proper Waits**: Wait for elements to be ready before interacting
3. **Handle Conditional Elements**: Check if elements exist before testing
4. **Use Test Helpers**: Leverage utility functions for common operations
5. **Test Real User Flows**: Focus on end-to-end user journeys
6. **Keep Tests Independent**: Each test should be able to run in isolation

## Test Data

Tests use the existing application data. No test data setup is required.

## Performance

- Tests run in parallel by default
- CI runs with reduced parallelism to avoid resource conflicts
- Global timeouts prevent hanging tests

## Maintenance

- Update selectors when UI changes
- Add new tests for new features
- Remove tests for removed features
- Keep test helpers up to date
