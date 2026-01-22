# Coding Conventions

**Analysis Date:** 2026-01-22

## Naming Patterns

**Files:**
- PascalCase for components: `FortuneCard.tsx`, `PopResultCard.tsx`
- camelCase for utilities: `validation.ts`, `storage.ts`, `errors.ts`
- kebab-case for routing files: `birth-date.tsx`, `gender.tsx`
- Index files use lowercase: `index.ts`

**Functions:**
- camelCase for exported functions: `validateBirthDate()`, `saveResult()`, `loadResult()`
- PascalCase for class names: `CalculationError`, `ValidationError`, `StorageError`
- camelCase for internal functions and variables

**Variables:**
- camelCase for all variables: `isTablet`, `contentPadding`, `currentSummaryIndex`
- Use descriptive names: `birthDate` not `bd`
- Boolean variables prefixed with `is`, `has`, `can`, `should`: `isLandscape`, `hasPermission`

**Types:**
- PascalCase for type interfaces: `CardProps`, `CalculationResult`
- camelCase for type properties: `birthDate`, `longitude`, `gender`
- Use descriptive names with proper casing

## Code Style

**Formatting:**
- No specific linting configuration detected in root
- TypeScript with strict mode enabled in `tsconfig.json`
- Mix of Tailwind classes and inline styles for UI components
- Uses `clsx` for conditional class name management

**Spacing:**
- 2-space indentation for JSX elements
- Consistent line breaks between sections
- Proper spacing around operators and commas

**Comments:**
- JSDoc format for functions with parameters and return types
- Japanese comments for user-facing text and descriptions
- Block comments for complex logic explanations
- Todo comments are avoided per project standards

## Import Organization

**Order:**
1. React imports
2. React Native imports
3. Third-party libraries (lucide-react-native, lunar-javascript, etc.)
4. Local imports with path alias `@/`
5. Relative imports for internal modules

**Path Aliases:**
- `@/` mapped to project root in `tsconfig.json`
- Examples: `@/src/types`, `@/src/hooks/useResponsive`

**Grouping:**
- Related imports grouped together
- No blank lines between import groups
- Single imports per line for clarity

## Error Handling

**Patterns:**
- Custom error classes for specific domains:
  - `CalculationError` for calculation failures
  - `ValidationError` for input validation
  - `StorageError` for AsyncStorage operations
- Try-catch blocks for async operations
- Error objects with `cause` property for error chaining
- Graceful degradation with null returns for non-critical errors

**Logging:**
- `console.error()` for error logging
- No structured logging framework detected
- Error messages in Japanese for user-facing content

## Logging

**Framework:** Console logging only
- `console.error()` for errors and debugging
- No centralized logging system
- Level-specific logging not implemented

**Patterns:**
- Error logging with contextual information
- Warning logs for non-critical issues
- No debug logging framework detected

## Comments

**When to Comment:**
- Complex business logic in calculations
- External library integration points
- Platform-specific code sections
- Data transformation logic

**JSDoc/TSDoc:**
- Consistently used for exported functions
- Includes parameter descriptions and return types
- Examples for complex functions
- @throws documentation for error cases

**Inline Comments:**
- Used sparingly for self-explanatory code
- Japanese for business logic explanations
- Commented code is actively removed

## Function Design

**Size:**
- Functions kept under 50 lines when possible
- Complex functions broken into smaller helper functions
- Single responsibility principle applied

**Parameters:**
- 3-4 parameters maximum for public functions
- Object destructuring for multiple related parameters
- Optional parameters with default values where appropriate

**Return Values:**
- Consistent return types across similar functions
- Union types for success/failure scenarios
- Null/undefined for optional returns

## Module Design

**Exports:**
- Named exports for functions and types
- Barrel exports in `index.ts` files for cleaner imports
- Re-exports from submodules for convenience

**Barrel Files:**
- Used in `/src/types/index.ts`
- Used in `/src/lib/logic/index.ts`
- Used in `/src/hooks/index.ts` (if exists)

**Module Organization:**
- Feature-based organization
- Clear separation between UI, logic, and utilities
- No circular dependencies detected