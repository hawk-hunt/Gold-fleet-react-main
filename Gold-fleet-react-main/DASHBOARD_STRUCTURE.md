# Dashboard Analytics Visual Structure

## Dashboard Layout (Top to Bottom)

```
┌─────────────────────────────────────────────────────────────────┐
│  FLEET DASHBOARD HEADER                                         │
│  Welcome back, [User Name]!                                     │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  QUICK NAVIGATION                                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌──────┐ │
│  │  Vehicles    │  │   Drivers    │  │    Trips     │ │ Fuel │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ └──────┘ │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  KPI CARDS (4 columns)                                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐        │
│  │Vehicles  │  │ Drivers  │  │  Trips   │  │Expenses  │        │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘        │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FLEET ANALYTICS GRID                                           │
│  ━━━ [REFRESH] button                                           │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ Service          │  │ Time To          │                   │
│  │ Compliance       │  │ Resolve          │                   │
│  │ (Radial)         │  │ (Line Chart)     │                   │
│  │ ●  75%           │  │ ┌─────────────┐  │                   │
│  │ ✓75 Completed    │  │ │ /  /   /    │  │                   │
│  │ ⏳25 Pending      │  │ └─────────────┘  │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ Priority         │  │ Onboarding       │                   │
│  │ Trends           │  │ Task             │                   │
│  │ (Area Chart)     │  │                  │                   │
│  │ ▨▨▨▨▨▨▨▨        │  │ + Add Vehicle    │                   │
│  │ ░░░░░░░░░░░░    │  │ or:              │                   │
│  │ ▓▓▓▓▓▓▓▓▓▓      │  │ ✓ Manage Tasks   │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  PROFESSIONAL ANALYTICS CARDS (Responsive Grid)                 │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ Vehicles         │  │ Maintenance      │                   │
│  │ Overview         │  │ Summary          │                   │
│  │                  │  │                  │                   │
│  │ Total: 15        │  │ ✓ Completed: 42  │                   │
│  │ Active: 14       │  │ ⚙ In Progress: 8  │                   │
│  │ Due: 2           │  │ ⏳ Pending: 5      │                   │
│  │ [View All]       │  │ [Manage Svcs]    │                   │
│  └──────────────────┘  └──────────────────┘                   │
│                                                                 │
│  ┌──────────────────┐  ┌──────────────────┐                   │
│  │ Fleet            │  │ Issue            │                   │
│  │ Performance      │  │ Tracking         │                   │
│  │                  │  │                  │                   │
│  │ Health: ━━━━━85% │  │ Open: 12         │                   │
│  │ Compliance:      │  │ Overdue: 3       │                   │
│  │ ━━━━━━━━━75%    │  │ Resolution: 87%  │                   │
│  │ [View Map]       │  │                  │                   │
│  └──────────────────┘  └──────────────────┘                   │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  CHARTS SECTION (Existing - Monthly Trends)                    │
│  ┌──────────────────────────┐  ┌─────────────────┐            │
│  │ Monthly Expense & Fuel   │  │ Quick Summary   │            │
│  │ Trends (Line Chart)      │  │                 │            │
│  │                          │  │ Active: 14/15   │            │
│  │                          │  │ On Duty: 10/12  │            │
│  │                          │  │ Fleet Health: 87│            │
│  │                          │  │ Trips: 156      │            │
│  └──────────────────────────┘  └─────────────────┘            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  FLEET STATUS OVERVIEW (Existing Status Cards)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ ┌─────┐ │
│  │ Open Issues  │  │ Services     │  │ Vehicle      │ │More │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ └─────┘ │
│  ┌──────────────┐  ┌──────────────┐                            │
│  │ Fleet Status │  │ Driver Status│                            │
│  └──────────────┘  └──────────────┘                            │
└─────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────┐
│  QUICK LINKS FOOTER                                             │
│  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐               │
│  │Services│  │  Map   │  │Expenses│  │Reminders               │
│  └────────┘  └────────┘  └────────┘  └────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Card Styling Reference

### All Analytics Cards:
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  📊 Card Title
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background:     #FFF8E7 (Light Cream)
Border:         12px radius + colored border
Shadow:         shadow-md (normal), shadow-lg (hover)
Text Color:     #333333 (Dark Grey)
Accent Gold:    #CFAF4B
Accent Green:   #2E7D32
```

---

## Color Scheme Reference

### Primary Colors:
| Color | Hex | Usage |
|-------|-----|-------|
| Light Cream | #FFF8E7 | Card backgrounds |
| Gold | #CFAF4B | Primary accent, charts |
| Soft Green | #2E7D32 | Secondary accent, positive status |
| Dark Grey | #333333 | Text color |
| Emergency Red | #ff6b6b | Critical issues |

### Recharts Colors:
| Chart | Color | Meaning |
|-------|-------|---------|
| Emergency | #ff6b6b | High priority |
| Scheduled | #CFAF4B | Gold - Normal |
| Non-Scheduled | #2E7D32 | Green - Low priority |
| Line Charts | #CFAF4B | Gold primary line |
| Grid/Text | #f0f0f0 / #666 | Neutral |

---

## Data Flow Diagram

```
┌─────────────────┐
│  Dashboard      │
│  Component      │
│  Mount          │
└────────┬────────┘
         │
         ├─────────────────────────────────────────┐
         │                                         │
         ▼                                         ▼
    ┌──────────────┐                      ┌──────────────────┐
    │Fetch Main    │                      │Fetch Analytics   │
    │Dashboard     │                      │Data              │
    │Stats API     │                      └────┬─────────────┘
    └──────┬───────┘                           │
           │                    ┌──────────────┼──────────────┐
           │                    ▼              ▼              ▼
           │              ┌──────────┐  ┌─────────────┐ ┌─────────┐
           │              │Fetch:    │  │Fetch:       │ │Fetch:   │
           │              │/api/     │  │/api/        │ │/api/    │
           │              │dashboard │  │maintenance │ │vehicles │
           │              │_stats    │  │_logs        │ │         │
           │              └────┬─────┘  └─────┬───────┘ └────┬────┘
           │                   │              │             │
           ▼                   ▼              ▼             ▼
    ┌────────────────────────────────────────────────────────┐
    │   Process & Transform Data                             │
    │   - Calculate compliance %                             │
    │   - Group by month                                     │
    │   - Calculate avg resolution time                      │
    │   - Group by priority                                  │
    └─────────────────────┬────────────────────────────────┘
                          │
        ┌─────────────────┼─────────────────┐
        │                 │                 │
        ▼                 ▼                 ▼
    ┌─────────┐    ┌─────────────┐   ┌──────────┐
    │Update   │    │Update       │   │Update    │
    │Service  │    │TimeToResolve│   │Priority  │
    │Compliance   │Data         │   │Trends    │
    └────┬────┘    └──────┬──────┘   └────┬─────┘
        │                 │               │
        └─────────────────┼───────────────┘
                          │
                          ▼
                    ┌───────────────┐
                    │Re-render with │
                    │Updated Data   │
                    └───────────────┘
```

---

## Responsive Behavior

### Desktop (≥1024px):
```
[Card 1] [Card 2] [Card 3] [Card 4]
[Card 5] [Card 6] [Card 7] [Card 8]
```

### Tablet (768px - 1023px):
```
[Card 1] [Card 2]
[Card 3] [Card 4]
[Card 5] [Card 6]
```

### Mobile (<768px):
```
[Card 1]
[Card 2]
[Card 3]
[Card 4]
```

All cards maintain minimum width of 350px and scale with available space.

---

## Interactive Features

### Fleet Analytics Refresh:
- Button with FaSync icon
- Manually fetches latest data
- Shows loading spinner during fetch
- Color: Yellow-500 (#EAB308)

### Card Hover Effects:
- Shadow increases: shadow-md → shadow-lg
- Smooth transition (0.3s)
- Gives visual feedback

### Navigation Buttons:
- Blue hover effect
- Links to related pages
- Styled with brand colors

### KPI Card Expansion:
- Click to expand/collapse
- Shows additional details
- Border-top divider

---

## Error Handling

### API Fails:
- Shows "No data available" in chart areas
- Fallback values (0) for metrics
- Error banner at top of dashboard
- Doesn't break other components

### Empty States:
- Onboarding card shows "Add Vehicle" prompt if count = 0
- Charts show placeholder messages
- Tables show empty state UI

### Loading States:
- Spinner animation while fetching
- "Loading analytics..." message
- Prevents UI flashing

