# Testing Patterns

**Analysis Date:** 2026-01-22

## Test Framework

**Runner:**
- Jest with jest-expo preset
- Version: ^29.7.0
- Config: `/mobile/jest.config.js`

**Assertion Library:**
- Testing-library/jest-native for React Native components
- Testing-library/react-native for component rendering
- Built-in Jest matchers

**Run Commands:**
```bash
npm test                    # Run all tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

## Test File Organization

**Location:**
- No test files found in `src/` directory
- Only vendor tests exist in `node_modules/`
- Test coverage collection configured but no actual tests

**Naming:**
- Standard Jest naming: `*.test.js` or `*.spec.js`
- Not detected in source code

**Structure:**
- Test directory structure not established

## Test Structure

**Suite Organization:**
- Not implemented - no test files found

**Patterns:**
- Not established

## Mocking

**Framework:** Jest mocking
- AsyncStorage mocked in `jest.setup.js`
- Firebase services mocked (Analytics, Crashlytics)
- React Native modules mocked for testing

**Mock Patterns:**
```javascript
// AsyncStorage mock
jest.mock('@react-native-async-storage/async-storage', () =>
    require('@react-native-async-storage/async-storage/jest/async-storage-mock')
);

// Firebase mocks
jest.mock('@react-native-firebase/analytics', () => () => ({
    logEvent: jest.fn(),
    setUserProperty: jest.fn(),
}));
```

**What to Mock:**
- AsyncStorage for storage operations
- Firebase services for analytics and crash reporting
- Platform-specific APIs
- Third-party libraries with side effects

**What NOT to Mock:**
- Core React Native APIs (tested with react-test-renderer)
- Pure utility functions
- Type definitions

## Fixtures and Factories

**Test Data:**
- No test data fixtures found
- No factory patterns detected

**Location:**
- Not implemented

## Coverage

**Requirements:** 80% threshold for all metrics
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

**View Coverage:**
```bash
npm run test:coverage
```

**Collection Patterns:**
- Collects from `src/**/*.{ts,tsx}`
- Excludes `.d.ts` files and type definitions
- Excludes `src/types/**` directory

## Test Types

**Unit Tests:**
- Not implemented
- Should be added for utility functions in `src/utils/`
- Should be added for custom hooks in `src/hooks/`
- Should be added for business logic in `src/lib/logic/`

**Integration Tests:**
- Not implemented
- Should be added for AsyncStorage operations
- Should be added for Firebase integrations
- Should be added for complex component interactions

**E2E Tests:**
- Not implemented
- No E2E testing framework detected

## Common Patterns

**Async Testing:**
- Not implemented
- Should use `async/await` for async operations
- Should use `jest.useFakeTimers()` for timing-related tests

**Error Testing:**
- Not implemented
- Should test error boundaries
- Should test error handling in utility functions
- Should test graceful degradation

## Testing Gaps

**Untested Areas:**
- All utility functions (validation, storage, errors)
- Custom hooks (useResponsive, usePurchases)
- Business logic (astronomy, bazi calculations)
- Component rendering and interactions
- Error boundaries
- Navigation flows

**Recommendations:**
1. Start with unit tests for utility functions
2. Add component tests for critical UI components
3. Integrate testing into CI/CD pipeline
4. Establish testing patterns from the start
5. Aim for test-driven development for new features

## Test Environment Setup

**Jest Configuration:**
- Uses babel-jest for transformation
- Path alias mapping for `@/` imports
- Specific transform ignore patterns for React Native and Expo modules
- Setup file for global mocks