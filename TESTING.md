# Testing Guide

Comprehensive testing infrastructure for database operations and application components.

## 📋 Table of Contents

- [Installation](#installation)
- [Running Tests](#running-tests)
- [Test Structure](#test-structure)
- [Writing Tests](#writing-tests)
- [Best Practices](#best-practices)
- [Test Coverage](#test-coverage)

## Installation

Install test dependencies:

```bash
npm install --save-dev @types/jest jest ts-jest
```

## Running Tests

### Run All Tests
```bash
npx jest
```

### Run Specific Test File
```bash
npx jest __tests__/database.test.ts
```

### Run Tests in Watch Mode
```bash
npx jest --watch
```

### Run Tests with Coverage
```bash
npx jest --coverage
```

### Run Tests Matching Pattern
```bash
npx jest -t "User Operations"
```

## Test Structure

```
project/
├── __tests__/
│   ├── database.test.ts          # Database operation tests
│   ├── services/
│   │   ├── supabaseService.test.ts
│   │   └── userAccountService.test.ts
│   ├── components/
│   │   ├── AIAssistant.test.tsx
│   │   └── Captcha.test.tsx
│   └── pages/
│       ├── SigninPage.test.tsx
│       └── SignupPage.test.tsx
├── jest.config.js                 # Jest configuration
├── jest.setup.ts                  # Global test setup
└── package.json                   # Test scripts
```

## Writing Tests

### Basic Test Structure

```typescript
import { supabase } from '../services/supabaseService';
import { dbConfig } from '../config';

describe('Feature Name', () => {
  
  describe('Specific Functionality', () => {
    
    test('should do something', async () => {
      // Arrange
      const testData = { ... };
      
      // Act
      const result = await supabase
        .from(dbConfig.tables.table_name)
        .insert(testData);
      
      // Assert
      expect(result.data).toBeDefined();
      expect(result.error).toBeNull();
    });
    
  });
});
```

### Using Mock Data

```typescript
// Create mock user
const mockUser = global.createMockUser();

// Use in tests
const result = await supabase
  .from(dbConfig.tables.users)
  .insert(mockUser)
  .select()
  .single();

expect(result.data?.username).toBe(mockUser.username);
```

### Testing Async Operations

```typescript
test('should handle async operation', async () => {
  const promise = new Promise(resolve => setTimeout(resolve, 100));
  await promise;
  
  expect(someValue).toBe(expected);
});
```

### Testing Error Handling

```typescript
test('should handle error gracefully', async () => {
  const invalidData = { /* missing required fields */ };
  
  const { error } = await supabase
    .from(dbConfig.tables.users)
    .insert(invalidData);
  
  expect(error).toBeDefined();
  expect(error?.message).toContain('violates');
});
```

## Best Practices

### 1. **Use Descriptive Test Names**
```typescript
// ❌ Bad
test('user test', () => { ... });

// ✅ Good
test('should create user with valid credentials', () => { ... });
```

### 2. **Arrange-Act-Assert Pattern**
```typescript
test('follows AAA pattern', () => {
  // Arrange
  const data = prepareTestData();
  
  // Act
  const result = performAction(data);
  
  // Assert
  expect(result).toBe(expected);
});
```

### 3. **Clean Up After Tests**
```typescript
afterEach(async () => {
  // Clean up test data
  await cleanupTestData();
});
```

### 4. **Test Edge Cases**
```typescript
test('handles empty input', () => { ... });
test('handles null values', () => { ... });
test('handles maximum length input', () => { ... });
test('handles special characters', () => { ... });
```

### 5. **Use beforeEach for Common Setup**
```typescript
let mockUser;

beforeEach(() => {
  mockUser = createMockUser();
});

test('uses mock user', () => {
  // mockUser is available here
});
```

## Test Coverage

### View Coverage Report
```bash
npx jest --coverage
```

### Coverage Thresholds
Current thresholds (in `jest.config.js`):
- Branches: 50%
- Functions: 50%
- Lines: 50%
- Statements: 50%

### Generate HTML Coverage Report
```bash
npx jest --coverage --coverageReporters=html
# Open coverage/index.html in browser
```

## Database Testing

### Testing CRUD Operations

```typescript
describe('User CRUD Operations', () => {
  
  test('CREATE: should insert new user', async () => {
    const userData = createMockUser();
    const { data, error } = await createUser(userData);
    expect(error).toBeNull();
    expect(data?.id).toBeDefined();
  });
  
  test('READ: should fetch user by id', async () => {
    const user = await createAndSaveUser();
    const { data } = await getUserById(user.id);
    expect(data?.id).toBe(user.id);
  });
  
  test('UPDATE: should modify user data', async () => {
    const user = await createAndSaveUser();
    const { data } = await updateUser(user.id, { 
      first_name: 'Updated' 
    });
    expect(data?.first_name).toBe('Updated');
  });
  
  test('DELETE: should remove user', async () => {
    const user = await createAndSaveUser();
    const { error } = await deleteUser(user.id);
    expect(error).toBeNull();
  });
  
});
```

### Testing Relationships

```typescript
test('should create order with items', async () => {
  const user = await createAndSaveUser();
  const order = await createOrder({ user_id: user.id });
  const item = await addOrderItem({ order_id: order.id });
  
  expect(item.order_id).toBe(order.id);
  expect(order.user_id).toBe(user.id);
});
```

## Component Testing

### Testing React Components

```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import MyComponent from './MyComponent';

test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Expected Text')).toBeInTheDocument();
});

test('handles user interaction', () => {
  render(<MyComponent />);
  fireEvent.click(screen.getByRole('button'));
  expect(screen.getByText('Clicked!')).toBeInTheDocument();
});
```

## Troubleshooting

### Common Issues

**Issue**: `Cannot find name 'describe'`
**Solution**: Install `@types/jest` and restart TypeScript server

**Issue**: Tests not running
**Solution**: Check `jest.config.js` module file extensions

**Issue**: Import errors
**Solution**: Verify `moduleNameMapper` in jest config matches your project structure

**Issue**: Async tests timeout
**Solution**: Increase timeout in `jest.setup.ts`: `jest.setTimeout(60000)`

## CI/CD Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v2
      
      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test -- --coverage
      
      - name: Upload coverage
        uses: codecov/codecov-action@v2
```

## Additional Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [TypeScript Testing](https://www.typescriptlang.org/docs/handbook/testing.html)

## Support

For questions or issues, check the project documentation or contact the development team.
