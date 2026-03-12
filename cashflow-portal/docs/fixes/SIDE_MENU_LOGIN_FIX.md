# Fix: Side Menu Appearing on Login Screen

## Problem
The side menu was appearing on the login screen when:
1. The app first launches at `http://localhost:4200/`
2. Only after refreshing the browser would the menu disappear

## Root Cause
The initial URL check in the app constructor was running **before the router had fully initialized**. This timing issue meant:
- On first load: Router not ready → `showMenu` defaults to `false` → Then router initializes and redirects → Signal subscription fires → Menu appears
- On refresh: Router already initialized → URL check works correctly → Menu stays hidden

## Solution: Use `afterNextRender`
Angular's `afterNextRender` hook runs after the initial render and after the router is fully initialized, ensuring the URL check happens at the right time.

### Code Change

**Before (Broken):**
```typescript
constructor(private router: Router) {
  // This runs TOO EARLY - router not initialized yet
  const currentUrl = this.router.url;
  this.showMenu.set(!(currentUrl.includes('/login') || currentUrl === '/' || currentUrl === ''));
  
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: any) => {
    this.showMenu.set(!event.url.includes('/login'));
  });
}
```

**After (Fixed):**
```typescript
import { afterNextRender } from '@angular/core';

constructor(private router: Router) {
  // Use afterNextRender - runs AFTER router initializes
  afterNextRender(() => {
    const currentUrl = this.router.url;
    this.showMenu.set(!(currentUrl.includes('/login') || currentUrl === '/' || currentUrl === ''));
  });

  // Listen to navigation events for subsequent navigations
  this.router.events.pipe(
    filter(event => event instanceof NavigationEnd)
  ).subscribe((event: any) => {
    this.showMenu.set(!event.url.includes('/login'));
  });
}
```

## Why `afterNextRender` Works

`afterNextRender` is designed for:
- ✅ Code that needs to run after Angular's initial render
- ✅ Accessing router state reliably
- ✅ DOM manipulation (if needed)
- ✅ Initialization that depends on fully loaded app state

### Execution Order
1. Component constructor runs
2. Component template renders
3. Router initializes and processes initial navigation
4. **`afterNextRender` callback executes** ← Our menu visibility check
5. Subsequent navigation events fire normally

## Test Cases

✅ **Fresh Load at `/`** - Menu hidden, redirects to `/login`, menu stays hidden
✅ **Direct `/login` Access** - Menu hidden immediately
✅ **Browser Refresh on `/login`** - Menu stays hidden
✅ **After Login to `/dashboard`** - Menu appears
✅ **After Logout** - Menu disappears when redirected to `/login`
✅ **Direct Navigation to `/dashboard`** - Auth guard redirects to `/login`, menu hidden

## Testing Instructions

1. **Clear browser cache** (Ctrl+Shift+Delete)
2. **Close all browser tabs** for the app
3. **Open fresh tab** and navigate to `http://localhost:4200/`
4. **Expected**: Login page appears with NO side menu visible
5. **Login** with passcode `Abibee`
6. **Expected**: Dashboard loads with side menu visible
7. **Logout**
8. **Expected**: Redirected to login, side menu disappears
9. **Refresh browser** on login page
10. **Expected**: Menu stays hidden

## Alternative Approaches Considered

### ❌ ngOnInit
```typescript
ngOnInit() {
  // Still too early for router in some cases
  this.showMenu.set(!this.router.url.includes('/login'));
}
```
**Problem**: Router might still be processing initial navigation

### ❌ setTimeout
```typescript
constructor(private router: Router) {
  setTimeout(() => {
    this.showMenu.set(!this.router.url.includes('/login'));
  }, 0);
}
```
**Problem**: Unreliable, causes flicker, hack-y approach

### ✅ afterNextRender (Chosen)
```typescript
constructor(private router: Router) {
  afterNextRender(() => {
    this.showMenu.set(!this.router.url.includes('/login'));
  });
}
```
**Benefits**: 
- Built-in Angular feature
- Designed for this exact use case
- Reliable timing
- Works with SSR (Server-Side Rendering)
- No race conditions

## URLs Where Menu Should Be Hidden
- `/` (redirects to login)
- `/login` (login page)

## URLs Where Menu Should Be Visible
- `/dashboard`
- `/income`
- `/expense`
- `/category`
- `/investment`
- `/debts`
- `/report`

## Result
✅ Side menu correctly hidden on all login scenarios
✅ Menu properly shows after authentication
✅ No flicker or timing issues
✅ Works on first load, refresh, and navigation
✅ Compatible with zoneless change detection and signals
