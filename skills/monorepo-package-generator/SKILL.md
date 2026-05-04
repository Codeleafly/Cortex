---
name: monorepo-package-generator
description: A standardized procedure for scaling the Nox monorepo. Use this when the project needs a new decoupled package (e.g., @nox/stdlib, @nox/optimizer) following the modern ESM and TypeScript project references architecture.
license: MIT
metadata:
  version: "1.1.0"
---

# Monorepo Package Generator Skill

This skill ensures that all new packages follow the project's "Modern ESM" and "Project References" standards.

## Steps

### 1. Directory Setup
- Create `packages/package-name/src`.
- Create `packages/package-name/package.json` with the modern `exports` field.

### 2. Configuration
- Extend the root `tsconfig.base.json`.
- Set `composite: true` and `rootDir: "src"`, `outDir: "dist"`.
- If the package depends on others, add `references` in `tsconfig.json` and `dependencies` in `package.json`.

### 3. Global Integration
- Add the new package path to the `workspaces` array in the root `package.json`.
- Add the path to the root `tsconfig.json`'s `references` array.

### 4. Verification
- Run `npm install` at the root.
- Run `tsc -b` to verify the new project graph builds correctly.

## Standards
- **Naming:** Use the `@nox/` prefix for all internal packages.
- **ESM:** Always include `.js` extensions in internal imports.
- **Decoupling:** A package should have a single, clear responsibility.
