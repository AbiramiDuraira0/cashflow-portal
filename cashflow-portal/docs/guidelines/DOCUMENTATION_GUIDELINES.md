# Documentation Guidelines

**Version:** 1.0  
**Last Updated:** March 12, 2026  
**Purpose:** Guidelines for creating and maintaining project documentation

---

## Table of Contents
1. [When to Create New Documentation](#when-to-create-new-documentation)
2. [When to Update Existing Documentation](#when-to-update-existing-documentation)
3. [Version Control in Documentation](#version-control-in-documentation)
4. [Documentation Structure](#documentation-structure)
5. [Best Practices](#best-practices)

---

## When to Create New Documentation

Create a **NEW** markdown file only in these cases:

### ✅ New Major Feature
- **Example:** Adding authentication system, payment gateway, new module
- **Reason:** Independent feature that deserves its own comprehensive documentation
- **File Name:** `FEATURE_<FEATURE_NAME>.md`

```
Examples:
- FEATURE_AUTHENTICATION.md
- FEATURE_PAYMENT_INTEGRATION.md
- FEATURE_REAL_TIME_NOTIFICATIONS.md
```

### ✅ New Architecture/Design Pattern
- **Example:** Implementing state management, introducing microservices
- **Reason:** Architectural changes affect multiple parts of the system
- **File Name:** `ARCHITECTURE_<PATTERN_NAME>.md`

```
Examples:
- ARCHITECTURE_STATE_MANAGEMENT.md
- ARCHITECTURE_MICROSERVICES.md
- ARCHITECTURE_CACHING_STRATEGY.md
```

### ✅ Major Refactoring
- **Example:** Complete rewrite of a module, migration to new framework version
- **Reason:** Significant structural changes that need detailed documentation
- **File Name:** `REFACTOR_<MODULE_NAME>.md`

```
Examples:
- REFACTOR_API_LAYER.md
- REFACTOR_ANGULAR_18_MIGRATION.md
- REFACTOR_DATABASE_SCHEMA.md
```

### ✅ New Developer Guides
- **Example:** Setup guide, deployment guide, testing guide
- **Reason:** Standalone instructional content for specific tasks
- **File Name:** `GUIDE_<GUIDE_NAME>.md`

```
Examples:
- GUIDE_LOCAL_SETUP.md
- GUIDE_DEPLOYMENT.md
- GUIDE_TESTING_STRATEGY.md
```

---

## When to Update Existing Documentation

Update **EXISTING** markdown files in these cases:

### ✅ Bug Fixes
- **Action:** Add a new version entry in the existing bug fix document
- **Don't:** Create `BUG_FIX_V2.md`, `BUG_FIX_FINAL.md`, etc.
- **Do:** Update with version history

```markdown
# Bug: Menu Visibility Issue

**Version:** 3.0 (updated)

## Version History
| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 1.0 | ... | Initial fix | ❌ |
| 2.0 | ... | Improved fix | ⚠️ |
| 3.0 | ... | Final solution | ✅ |
```

### ✅ Performance Optimizations
- **Action:** Add optimization steps to existing performance document
- **Versioning:** Use version numbers within the same file

```markdown
# Performance: Dashboard Loading

## Optimization History
- v1.0: Reduced API calls
- v2.0: Added caching
- v3.0: Implemented lazy loading
```

### ✅ Small Feature Enhancements
- **Action:** Update the feature document with enhancement section
- **Don't:** Create new file for minor improvements

```markdown
# Feature: Dashboard

## Version 2.1 - Enhancement
- Added export functionality
- Improved filtering
```

### ✅ Configuration Changes
- **Action:** Update the configuration document
- **Track:** Date and reason for change

```markdown
# Configuration

## Recent Changes
- **2026-03-12:** Updated API timeout from 30s to 60s
- **2026-03-10:** Added new environment variable
```

### ✅ Troubleshooting Steps
- **Action:** Add new troubleshooting scenarios to existing doc
- **Organize:** By category or frequency

```markdown
# Troubleshooting

## Common Issues

### Issue 1: Login not working
**Version History:**
- v1.0: Cache clearing fix
- v2.0: Added cookie check
```

---

## Version Control in Documentation

### Version Number Format

Use semantic versioning for documentation:

```
MAJOR.MINOR.PATCH

Examples:
- 1.0.0 - Initial documentation
- 1.1.0 - Added new section
- 1.1.1 - Fixed typo/minor correction
- 2.0.0 - Major rewrite or significant changes
```

### Version Header Template

```markdown
# Document Title

**Version:** 2.1.0
**Last Updated:** YYYY-MM-DD
**Author:** Developer Name
**Status:** ✅ Active | ⚠️ Deprecated | 🔄 In Progress

---

## Version History

| Version | Date | Changes | Status |
|---------|------|---------|--------|
| 2.1.0 | 2026-03-12 | Added new feature X | ✅ Current |
| 2.0.0 | 2026-03-10 | Major refactoring | ✅ Complete |
| 1.0.0 | 2026-03-01 | Initial release | ✅ Complete |

---
```

### Status Indicators

Use emoji indicators for quick status recognition:

- ✅ **Complete/Resolved/Active** - Working solution, current documentation
- ⚠️ **Partial/In Progress** - Work in progress, partially resolved
- ❌ **Failed/Deprecated** - Approach didn't work, outdated
- 🔄 **Under Review** - Needs validation or testing
- 📝 **Draft** - Documentation being written
- 🚀 **Planned** - Future enhancement

---

## Documentation Structure

### Folder Organization

```
docs/
├── README.md (Documentation index)
├── guidelines/
│   └── DOCUMENTATION_GUIDELINES.md (this file)
├── features/
│   ├── FEATURE_DASHBOARD.md
│   └── FEATURE_AUTHENTICATION.md
├── fixes/
│   ├── SIDE_MENU_LOGIN_FIX.md (with version history)
│   └── DATA_LOADING_FIX.md (with version history)
├── performance/
│   ├── DASHBOARD_OPTIMIZATION.md (with version history)
│   └── API_PERFORMANCE.md (with version history)
├── refactoring/
│   ├── COMPONENT_EXTRACTION.md
│   └── SERVICE_LAYER.md
├── guides/
│   ├── QUICK_START.md
│   ├── DEPLOYMENT.md
│   └── TESTING.md
└── architecture/
    ├── DESIGN_OVERVIEW.md
    └── STATE_MANAGEMENT.md
```

### File Naming Convention

```
Category_Description_Type.md

Categories:
- FEATURE_ - New functionality
- FIX_ - Bug fixes
- REFACTOR_ - Code refactoring
- GUIDE_ - Instructional content
- ARCHITECTURE_ - Design decisions
- PERFORMANCE_ - Optimization docs
- API_ - API documentation
```

---

## Best Practices

### 1. Single Source of Truth ✅

**Do:**
```
docs/fixes/MENU_VISIBILITY.md
  - Version 1.0: Initial attempt
  - Version 2.0: Improved approach
  - Version 3.0: Final solution
```

**Don't:**
```
docs/fixes/MENU_VISIBILITY_FIX.md
docs/fixes/MENU_VISIBILITY_FIX_V2.md
docs/fixes/MENU_VISIBILITY_FINAL.md
docs/fixes/MENU_VISIBILITY_QUICK_FIX.md
```

### 2. Keep History, Don't Rewrite ✅

**Do:**
```markdown
## Version 2.0
New approach that fixes the issue...

## Version 1.0 (Deprecated)
Original approach had limitations...
```

**Don't:**
Delete old content entirely - keep it for historical reference

### 3. Cross-Reference Related Docs ✅

```markdown
## Related Documentation
- [Dashboard Optimization](../performance/DASHBOARD_OPTIMIZATION.md)
- [Component Refactoring](../refactoring/COMPONENT_EXTRACTION.md)
```

### 4. Use Tables for Version History ✅

```markdown
| Version | Date | Author | Changes | Impact |
|---------|------|--------|---------|--------|
| 2.1 | 2026-03-12 | John | Added caching | +50% speed |
| 2.0 | 2026-03-10 | Jane | Refactored | Breaking |
```

### 5. Include Migration Paths ✅

```markdown
## Migration from v1.0 to v2.0

### Breaking Changes
- API endpoint changed from `/api/v1` to `/api/v2`
- Response format updated

### Step-by-Step Migration
1. Update API URL in config
2. Update response parsing logic
3. Test thoroughly
```

### 6. Add Debugging Sections ✅

```markdown
## Troubleshooting

### Issue: Feature not working
**Symptoms:** ...
**Cause:** ...
**Solution:** ...
**Verified:** ✅ 2026-03-12
```

### 7. Keep Documentation Close to Code ✅

For complex features:
```
src/
├── features/
│   └── authentication/
│       ├── auth.service.ts
│       ├── auth.guard.ts
│       └── README.md (feature-specific docs)
```

### 8. Use Code Examples ✅

```markdown
## Implementation

### Before
\`\`\`typescript
// Old approach
const data = getData();
\`\`\`

### After
\`\`\`typescript
// New approach
const data = await getDataAsync();
\`\`\`
```

### 9. Add Testing Checklist ✅

```markdown
## Testing Checklist
- [ ] Unit tests passing
- [ ] Integration tests passing
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on mobile
```

### 10. Document Decisions ✅

```markdown
## Decision Log

### 2026-03-12: Chose Approach B
**Options Considered:**
- Approach A: Simpler but limited
- Approach B: More complex but scalable ✅ CHOSEN

**Reason:** Need scalability for future features
```

---

## Documentation Review Checklist

Before committing documentation:

- [ ] **Single file** - Is this truly a new major feature/component?
- [ ] **Version updated** - Incremented version number?
- [ ] **History preserved** - Old versions documented with deprecation notes?
- [ ] **Cross-references** - Links to related documentation?
- [ ] **Examples included** - Code snippets for implementation?
- [ ] **Testing covered** - Test scenarios documented?
- [ ] **Status clear** - Current status indicated with emoji?
- [ ] **Migration path** - If breaking change, migration steps included?

---

## Quick Decision Tree

```
Need to document something?
├─ Is it a completely new major feature? ───────► Create new file
├─ Is it a fix/enhancement to existing feature? ─► Update existing file
├─ Is it a troubleshooting step? ────────────────► Update existing fix file
├─ Is it a new architecture pattern? ────────────► Create new file
├─ Is it a configuration change? ────────────────► Update config doc
└─ Is it a minor improvement? ───────────────────► Update existing file
```

---

## Examples from This Project

### ✅ Good - Consolidated Documentation
- `SIDE_MENU_LOGIN_FIX.md` - Contains v1.0, v2.0, v3.0 all in one file
- `DASHBOARD_OPTIMIZATION.md` - Multiple optimization rounds documented together

### ❌ Bad - Fragmented Documentation (to avoid)
- `QUICK_FIX.md` - Should have been version in main fix doc
- `MENU_VISIBILITY_FINAL_FIX.md` - Should have been version update

### ✅ Good - When New Files Are Justified
- `SIDE_MENU_COMPONENT_EXTRACTION.md` - Major refactoring, deserves own doc
- `ZONELESS_FIX.md` - New architecture pattern (zoneless mode)

---

## Summary

### Create New File When:
- ✅ New major feature (>500 lines of code)
- ✅ New architecture pattern
- ✅ Major refactoring affecting multiple modules
- ✅ New developer guide/tutorial
- ✅ Standalone component/module

### Update Existing File When:
- ✅ Bug fixes (add version)
- ✅ Performance improvements
- ✅ Feature enhancements
- ✅ Configuration updates
- ✅ Additional troubleshooting steps
- ✅ Code improvements to existing feature

### Key Principle:
**"One feature, one document - with versions"**

Not:
~~"One fix attempt, one document"~~

---

**Remember:** Good documentation is versioned, consolidated, and easy to find. Avoid documentation sprawl by updating existing docs when possible!
