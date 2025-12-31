# TypeScript Project Guide

## Contents

- Project Structure
- Configuration
- Build & Run
- Best Practices
- Common Patterns

## Project Structure

```
project/
├── src/
│   ├── index.ts          # Entry point
│   ├── types/            # Type definitions
│   └── utils/            # Utility functions
├── tests/
│   └── *.test.ts
├── dist/                 # Compiled output
├── package.json
├── tsconfig.json
├── .gitignore
└── README.md
```

## Configuration

### tsconfig.json (Recommended)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "outDir": "./dist",
    "rootDir": "./src",
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

### package.json Scripts

```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/index.js",
    "dev": "tsx watch src/index.ts",
    "test": "vitest",
    "lint": "eslint src/"
  }
}
```

## Build & Run

```bash
# Install dependencies
npm install

# Development
npm run dev

# Build
npm run build

# Run
npm start
```

## Best Practices

1. **Strict mode**: Always enable `strict: true`
2. **Type exports**: Export types alongside implementations
3. **Avoid `any`**: Use `unknown` or proper types
4. **Path aliases**: Use `@/` for src imports

## Common Patterns

### Type-safe Error Handling

```typescript
type Result<T, E = Error> =
  | { success: true; data: T }
  | { success: false; error: E };

function safeOperation<T>(fn: () => T): Result<T> {
  try {
    return { success: true, data: fn() };
  } catch (error) {
    return { success: false, error: error as Error };
  }
}
```

### Dependency Injection

```typescript
interface Logger {
  log(message: string): void;
}

class Service {
  constructor(private logger: Logger) {}

  execute() {
    this.logger.log("Executing...");
  }
}
```
