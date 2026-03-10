# Dashboard Design Overview

## Layout Structure

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDE MENU (240px)              MAIN CONTENT AREA               │
│  ┌──────────────┐              ┌──────────────────────────────┐│
│  │ ☰ Cashflow   │              │    Dashboard Header          ││
│  │   Portal     │              │    Welcome back! Here's...   ││
│  ├──────────────┤              ├──────────────────────────────┤│
│  │              │              │                              ││
│  │ 🏠 Dashboard │◄─Active      │  ┌─────┐ ┌─────┐ ┌─────┐   ││
│  │              │              │  │ 💰  │ │ 💸  │ │ 💵  │   ││
│  │ 💰 Income    │              │  │45K  │ │32K  │ │12K  │   ││
│  │              │              │  └─────┘ └─────┘ └─────┘   ││
│  │ 💸 Expense   │              │                              ││
│  │              │              │  ┌─────┐ ┌─────┐ ┌─────┐   ││
│  │ 📁 Category  │              │  │ 📈  │ │ 🏦  │ │ 📁  │   ││
│  │              │              │  │185K │ │48K  │ │ 12  │   ││
│  │ 📈 Investment│              │  └─────┘ └─────┘ └─────┘   ││
│  │              │              │                              ││
│  │ 🏦 Debts     │              │  ┌──────────────────────┐   ││
│  │              │              │  │ Recent Transactions  │   ││
│  │ 📊 Report    │              │  │ • Salary    +45,000  │   ││
│  │              │              │  │ • Groceries  -3,500  │   ││
│  └──────────────┘              │  │ • Restaurant -1,200  │   ││
│                                │  └──────────────────────┘   ││
│                                │                              ││
│                                │  ┌──────────────────────┐   ││
│                                │  │ Budget Overview      │   ││
│                                │  │ Food: ███████░ 65%   │   ││
│                                │  │ Bills: ██████░░ 68%  │   ││
│                                │  └──────────────────────┘   ││
│                                │                              ││
│                                └──────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
```

## Dashboard Widgets (6 Cards)

### Widget Layout
```
┌─────────────────────────┐
│ 💰              ↑ +12%  │  ← Icon & Trend
├─────────────────────────┤
│ TOTAL INCOME            │  ← Title (uppercase)
│ ₹45,000                 │  ← Value (large)
│ This month              │  ← Subtitle (muted)
└─────────────────────────┘
```

### Widget Grid (3 columns on desktop, responsive)
```
Row 1:  [💰 Income]  [💸 Expense]  [💵 Balance]
Row 2:  [📈 Investment]  [🏦 Debts]  [📁 Categories]
```

## Side Menu States

### Expanded (240px)
```
┌──────────────────┐
│ ☰  Cashflow      │
│    Portal        │
├──────────────────┤
│                  │
│ 🏠  Dashboard    │ ◄─ Active (blue bg)
│                  │
│ 💰  Income       │
│                  │
│ 💸  Expense      │
│                  │
│ 📁  Category     │
│                  │
│ 📈  Investment   │
│                  │
│ 🏦  Debts        │
│                  │
│ 📊  Report       │
│                  │
└──────────────────┘
```

### Collapsed (60px)
```
┌────┐
│ ☰  │
│    │
├────┤
│ 🏠 │
│ 💰 │
│ 💸 │
│ 📁 │
│ 📈 │
│ 🏦 │
│ 📊 │
└────┘
```

## Two-Column Section

```
┌────────────────────────────────────────────────────┐
│                                                    │
│  ┌─────────────────────┐  ┌──────────────────┐   │
│  │ Recent Transactions │  │ Budget Overview  │   │
│  ├─────────────────────┤  ├──────────────────┤   │
│  │ ↓ Salary            │  │ Food             │   │
│  │   Today     +45,000 │  │ ███████░ 65%     │   │
│  │                     │  │ ₹5,200 / ₹8,000  │   │
│  │ ↑ Groceries         │  │                  │   │
│  │   Today      -3,500 │  │ Bills            │   │
│  │                     │  │ ██████░░ 68%     │   │
│  │ ↑ Restaurant        │  │ ₹4,100 / ₹6,000  │   │
│  │   Yesterday  -1,200 │  │                  │   │
│  │                     │  │ Transport        │   │
│  │ ↑ Transport         │  │ █████████░ 93%   │   │
│  │   2 days ago   -800 │  │ ₹2,800 / ₹3,000  │   │
│  │                     │  │                  │   │
│  │ ↓ Freelance         │  │ Shopping         │   │
│  │   4 days ago +8,000 │  │ ████░░░░░░ 36%   │   │
│  │                     │  │ ₹1,800 / ₹5,000  │   │
│  │                     │  │                  │   │
│  │ [View all →]        │  │ [Manage →]       │   │
│  └─────────────────────┘  └──────────────────┘   │
│                                                    │
└────────────────────────────────────────────────────┘
```

## Quick Actions Section

```
┌────────────────────────────────────────────┐
│ Quick Actions                              │
├────────────────────────────────────────────┤
│                                            │
│  ┌────────┐  ┌────────┐  ┌────────┐      │
│  │   ➕   │  │   ➖   │  │   📁   │ ...  │
│  │  Add   │  │  Add   │  │ Manage │      │
│  │ Income │  │Expense │  │Category│      │
│  └────────┘  └────────┘  └────────┘      │
│                                            │
└────────────────────────────────────────────┘
```

## Color Palette

### Background Colors
- **Main BG**: `#0b1020` (Dark Blue)
- **Card BG**: `#121935` (Lighter Blue)
- **Border**: `#1f274a` (Blue-Gray)

### Accent Colors
- **Primary**: `#3b82f6` (Blue)
- **Success/Income**: `#22c55e` (Green)
- **Danger/Expense**: `#ef4444` (Red)
- **Warning**: `#f59e0b` (Orange)
- **Info**: `#06b6d4` (Cyan)
- **Purple**: `#8b5cf6` (Purple)

### Text Colors
- **Primary Text**: `#e5e7eb` (Light Gray)
- **Muted Text**: `#94a3b8` (Blue-Gray)
- **White**: `#ffffff`

## Interactive States

### Menu Items
- **Default**: Gray text, transparent background
- **Hover**: Light background, white text, blue left border
- **Active**: Blue background (15% opacity), blue text, blue left border

### Widgets
- **Default**: Card with subtle shadow
- **Hover**: Lift up 2px, enhanced shadow, colored border

### Buttons
- **Default**: Gradient blue background
- **Hover**: Slight brightness increase
- **Active**: Move down 1px

## Responsive Breakpoints

### Desktop (1200px+)
- Side menu: 240px
- Widget grid: 3 columns
- Two-column section: 2 columns
- Quick actions: 4 columns

### Tablet (768px - 1199px)
- Side menu: 240px
- Widget grid: 2 columns
- Two-column section: 1 column (stacked)
- Quick actions: 2 columns

### Mobile (< 768px)
- Side menu: Overlay or collapsed
- Widget grid: 1 column
- Two-column section: 1 column
- Quick actions: 2 columns

## Typography

### Headings
- **H1 (Page Title)**: 32px, bold, gradient text
- **H2 (Section)**: 20px, semi-bold
- **H3 (Widget Title)**: 13px, uppercase, muted

### Body
- **Large (Widget Value)**: 28px, bold
- **Regular**: 14px
- **Small**: 12px
- **Tiny**: 11px

### Font Weights
- **Regular**: 400
- **Medium**: 500
- **Semi-bold**: 600
- **Bold**: 700

## Icons
Using emoji icons for simplicity:
- 🏠 Dashboard
- 💰 Income
- 💸 Expense
- 📁 Category
- 📈 Investment
- 🏦 Debts
- 📊 Report
- ➕ Add
- ➖ Subtract
- ↑ Expense indicator
- ↓ Income indicator

## Animation & Transitions

### Durations
- **Fast**: 0.15s (hover states)
- **Normal**: 0.2s (most transitions)
- **Slow**: 0.3s (layout changes, menu expand/collapse)

### Easing
- **Default**: `ease`
- **Smooth**: `ease-in-out`

## Loading States
- Skeleton screens with gradient animation
- 6 skeleton cards in widget grid
- Shimmer effect from left to right
- Duration: 1.5s infinite loop
