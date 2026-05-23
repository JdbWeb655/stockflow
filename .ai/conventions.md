# Code Conventions

## Naming

- Variables: camelCase
- Functions: camelCase
- Classes: PascalCase
- Files: kebab-case (e.g., `product-list.tsx`)
- Constants: UPPER_SNAKE_CASE

## Documentation

- Style: JSDoc (TypeScript) with type annotations
- When required: Public functions, classes, modules, and complex logic
- Inline comments: Used sparingly for non-obvious code

## Error Handling

- Pattern: Try/catch blocks with custom error types
- Supabase client errors are caught and handled gracefully
- No explicit Result type pattern; uses exceptions

## Imports

- Order: Standard library → Third-party → Local modules
- One blank line between groups
- No wildcard imports except for React

## Testing

- File naming: `*.test.ts` or `*.spec.ts`
- Structure: Arrange/Act/Assert pattern
- Coverage target: Not established

## Git

- Branch naming: Not established
- Commit style: Conventional Commits (inferred from package.json)
- Commit messages: Imperative mood, concise

---
*Last updated: 2026-05-15*