# Cashflow Portal Documentation

> **Version:** 2.0  
> **Last Updated:** January 2025  
> **Status:** ✅ Active

This folder contains all documentation for the Cashflow Portal project, organized into logical categories with version tracking.

---

## 📁 Folder Structure

### `/features`
Documentation for major features and functionality implementations:
- **[DASHBOARD_UPDATE.md](./features/DASHBOARD_UPDATE.md)** - Dashboard component updates and enhancements
- **[LOGIN_SIDEMENU_UPDATE.md](./features/LOGIN_SIDEMENU_UPDATE.md)** - ✅ v4.0 - Login screen and side menu with Angular Material tooltips

### `/ui-updates`
UI/UX improvements and styling updates:
- **[STYLING_UPDATE.md](./ui-updates/STYLING_UPDATE.md)** - General styling improvements
- **[SIDEMENU_ICONS_TOOLTIPS.md](./ui-updates/SIDEMENU_ICONS_TOOLTIPS.md)** - Initial tooltip implementation for side menu
- **[SIDEMENU_ICON_SIZE_TOOLTIPS_ENHANCED.md](./ui-updates/SIDEMENU_ICON_SIZE_TOOLTIPS_ENHANCED.md)** - Enhanced tooltips with smaller icons
- **[TOOLTIP_FIX.md](./ui-updates/TOOLTIP_FIX.md)** - First tooltip bug fix
- **[TOOLTIP_FINAL_FIX.md](./ui-updates/TOOLTIP_FINAL_FIX.md)** - Final tooltip implementation (URL preview fix)

### `/guides`
Setup guides, design documentation, and best practices:
- **[QUICK_START.md](./guides/QUICK_START.md)** - Quick start guide for the project
- **[DESIGN_OVERVIEW.md](./guides/DESIGN_OVERVIEW.md)** - Overall design system and architecture
- **[DOCUMENTATION_GUIDELINES.md](./guides/DOCUMENTATION_GUIDELINES.md)** - ⭐ **NEW** - Documentation standards and versioning best practices

---

## 🔍 Quick Reference

### For New Developers
1. **Start here:** [Quick Start Guide](./guides/QUICK_START.md)
2. **Understand the architecture:** [Design Overview](./guides/DESIGN_OVERVIEW.md)
3. **Learn documentation standards:** [Documentation Guidelines](./guides/DOCUMENTATION_GUIDELINES.md)

### For Feature Documentation
- **Dashboard features:** [Dashboard Update](./features/DASHBOARD_UPDATE.md)
- **Authentication & Navigation:** [Login/Side Menu Update v3.0](./features/LOGIN_SIDEMENU_UPDATE.md) ✅

### For UI/UX Updates
- **Latest tooltip implementation:** [Tooltip Final Fix](./ui-updates/TOOLTIP_FINAL_FIX.md)
- **Side menu enhancements:** [Side Menu Icons & Tooltips Enhanced](./ui-updates/SIDEMENU_ICON_SIZE_TOOLTIPS_ENHANCED.md)
- **Styling changes:** [Styling Update](./ui-updates/STYLING_UPDATE.md)

### For Contributing
- **Documentation standards:** [Documentation Guidelines](./guides/DOCUMENTATION_GUIDELINES.md)
- **When to create new files:** Use version tracking in existing files unless it's a major new feature
- **Version format:** Semantic versioning (v1.0, v2.0, v2.1)

---

## 📊 Recent Updates

| Date | Document | Version | Description |
|------|----------|---------|-------------|
| Mar 12, 2026 | LOGIN_SIDEMENU_UPDATE.md | v4.0 | **Implemented Angular Material UI tooltips for side menu** |
| Mar 12, 2026 | LOGIN_SIDEMENU_UPDATE.md | v3.1 | Enhanced tooltips with arrows, removed browser tooltips (superseded) |
| Jan 2025 | DOCUMENTATION_GUIDELINES.md | v1.0 | Created comprehensive documentation standards |
| Jan 2025 | LOGIN_SIDEMENU_UPDATE.md | v3.0 | Consolidated menu visibility fixes with version history |
| Jan 2025 | DASHBOARD_UPDATE.md | v2.0 | Optimized loading and added loading indicators |

---

## 📝 Documentation Guidelines Summary

**⚠️ Important:** Before creating a new documentation file, read [Documentation Guidelines](./guides/DOCUMENTATION_GUIDELINES.md)

### Quick Decision Tree
```
Need to document something?
├─ Is it a brand new feature/module? ────────────────► Create NEW file
├─ Is it a bug fix or enhancement to existing feature? ► UPDATE existing file (add version)
├─ Is it a minor tweak or adjustment? ──────────────► UPDATE existing file (same version)
└─ Not sure? ───────────────────────────────────────► Check DOCUMENTATION_GUIDELINES.md
```

### Best Practices
1. ✅ **Use version tracking** within files (v1.0, v2.0, v2.1)
2. ✅ **Update existing docs** for fixes/enhancements to same feature
3. ✅ **Create new files** only for major new features or modules
4. ✅ **Include status indicators** (✅ Active, ⚠️ Deprecated, 📦 Archived)
5. ✅ **Cross-reference related docs** using markdown links

---

## 📄 Root Documentation Files
- **README.md** - Main project README (in root directory)
- **This file** - Documentation index and navigation

---

## 🗂️ File Naming Conventions

- **Features:** `FEATURE_NAME.md` (e.g., `DASHBOARD_UPDATE.md`)
- **UI Updates:** `COMPONENT_CHANGE.md` (e.g., `SIDEMENU_ICONS_TOOLTIPS.md`)
- **Guides:** `GUIDE_TYPE.md` (e.g., `QUICK_START.md`)
- Use **UPPERCASE** with **underscores** for separation
- Be **descriptive** and **specific**

---

## 🔗 External Resources

- [Angular Documentation](https://angular.dev)
- [Angular Signals Guide](https://angular.dev/guide/signals)
- [Zoneless Change Detection](https://angular.dev/guide/experimental/zoneless)

---

*For questions or suggestions about documentation, please refer to [DOCUMENTATION_GUIDELINES.md](./guides/DOCUMENTATION_GUIDELINES.md)*

---

*Last Updated: March 9, 2026*
