# Copilot Instructions - Cashflow Portal

## Project Overview
Angular 20 personal finance tracking application using standalone components, zoneless change detection, and Supabase backend. The app features a collapsible side menu, dashboard with financial widgets, and protected routes for authenticated users.

## Architecture & Key Patterns

### Standalone Components & Zoneless Angular
- **ALL components are standalone** - use `standalone: true` and explicit `imports` array
- **Zoneless change detection** via `provideZonelessChangeDetection()` - use signals instead of traditional change detection
- **Signals over observables** for state management - prefer `signal()`, `computed()` for reactive values
- **Example:** `protected showMenu = signal<boolean | null>(null);` in `app.ts`

### Component Organization
```
src/app/
├── component/        # Feature pages (*.page.ts) and shared UI (*.component.ts)
│   ├── home/        # Dashboard with pre-initialized widget data
│   ├── login/       # Passcode auth ('demo123'), sessionStorage
│   ├── side-menu/   # Collapsible nav with Material tooltips
│   └── loading-spinner/
├── services/        # Singleton services with `providedIn: 'root'`
│   ├── supabase.service.ts   # Backend client wrapper
│   └── loading.service.ts    # BehaviorSubject for global loading
└── guards/          # Functional guards (CanActivateFn)
    └── auth.guard.ts         # sessionStorage check, redirect to /login
```

### Authentication Flow
- **No real backend auth yet** - hardcoded passcode check in `login.page.ts`
- `sessionStorage.setItem('isAuthenticated', 'true')` on success
- `authGuard` checks sessionStorage before activating protected routes
- All routes except `/login` use `canActivate: [authGuard]`

### Side Menu States
- **Three-state visibility logic** in `app.ts`: `null` (initial), `true` (show), `false` (hide)
- **Menu visibility tied to route** - hidden on `/login`, shown on all other routes
- **Collapsible/expandable** - controlled by `isMenuCollapsed` signal in `side-menu.component.ts`
  - Expanded: 240px with labels
  - Collapsed: 64px with icons only
- **Material tooltips** (`MatTooltipModule`) shown when collapsed - **never use `title` attribute on menu items** (prevents browser tooltips)
- **Main content adjusts** via CSS `:has(.side-menu.collapsed)` selector in `app.css`

### Data Loading Pattern
```typescript
// Dashboard uses pre-initialized data (no loading delay)
loading = signal(false);
widgets: Widget[] = [/* hardcoded data */];

ngOnInit(): void {
  // When integrating real API:
  // this.loading.set(true);
  // await this.fetchData();
  // this.loading.set(false);
}
```

### Routing & Navigation
- **Functional guards** - use `CanActivateFn` with `inject(Router)`, not class-based guards
- **Preload all modules** - `provideRouter(routes, withPreloading(PreloadAllModules))`
- **SSR enabled** - has `app.routes.server.ts` and `app.config.server.ts`
- **Default redirect** - `/` → `/login`, `**` → `/login`

## Component Naming & Structure
- **Pages:** `<feature>.page.ts/.html/.scss` (e.g., `income.page.ts`)
- **Shared UI:** `<name>.component.ts/.html/.scss` (e.g., `side-menu.component.ts`)
- **Protected props:** Use `protected` keyword for template-accessible class members
- **Minimal logic in components** - pages have placeholder methods (future service integration)

## Styling Guidelines
- **Global styles:** `src/styles.css` for app-wide CSS
- **Component styles:** Scoped `.scss` files, use BEM-like naming
- **Material Design:** Angular Material used for tooltips (`@angular/material` v20)
- **Responsive breakpoints:** Mobile-first approach, check `docs/features/LOGIN_SIDEMENU_UPDATE.md` for spacing examples

## Development Workflow

### Commands (PowerShell)
```powershell
ng serve              # Dev server on http://localhost:4200
ng build              # Production build → dist/
ng test               # Karma unit tests
ng generate component <name>  # Scaffold new component
```

### Build Configuration
- **Esbuild-based** (`@angular/build:application`) - faster builds than Webpack
- **Budget limits:** Initial: 2MB warning / 5MB error, Component styles: 20KB / 50KB
- **Netlify deployment** - configured via `netlify.toml` with SPA redirect

### Environment Variables
- **Supabase config** in `src/environments/environment.ts`
- **⚠️ API keys exposed in code** - not production-ready (use env vars for prod)

## Documentation Standards
- **Version-tracked docs** in `docs/` - use semantic versioning (v1.0, v2.0, v2.1)
- **Update existing files** for bug fixes/enhancements - don't create `*_V2.md`, `*_FINAL.md`
- **Create new files** only for major features (see `docs/guidelines/DOCUMENTATION_GUIDELINES.md`)
- **Change logs** - include version history table at top of feature docs
- **Example:** `docs/features/LOGIN_SIDEMENU_UPDATE.md` has 7 versions tracked in one file

## Common Gotchas
1. **Never mix zone-based and zoneless** - don't use `NgZone` or zone-dependent APIs
2. **Material tooltip conflicts** - always set `title=""` on elements with `matTooltip` to prevent browser tooltips
3. **SessionStorage auth** - not secure, placeholder for real auth implementation
4. **Side menu spacing** - dashboard padding optimized for collapsed menu (see v4.2 in LOGIN_SIDEMENU_UPDATE.md)
5. **Route guards** - must return boolean or UrlTree, use `inject()` for dependencies

## Key Files to Reference
- `app.ts` - Side menu visibility logic (three-state pattern)
- `side-menu.component.ts` - Collapsed/expanded state with Material tooltips
- `app.routes.ts` - All routes with auth guard configuration
- `app.config.ts` - Zoneless + SSR + animations setup
- `docs/features/LOGIN_SIDEMENU_UPDATE.md` - Complete side menu evolution (4 major versions)
- `docs/guides/DESIGN_OVERVIEW.md` - UI layout specs and widget grid

## When Making Changes
1. **Check existing docs** in `docs/` for context on feature history
2. **Update version history** when fixing bugs in documented features
3. **Use signals** for reactive state - avoid manual change detection
4. **Test menu states** - collapsed, expanded, and route transitions
5. **Verify SSR compatibility** - avoid browser-only APIs in component constructors
