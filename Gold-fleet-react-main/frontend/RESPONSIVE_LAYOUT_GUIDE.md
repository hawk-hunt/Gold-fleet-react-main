# Responsive Layout System - Integration Guide

## 🚀 Overview

The Gold Fleet React application now includes a comprehensive responsive layout system that works seamlessly across all screen sizes. This system is already integrated globally and requires minimal setup for new pages.

## 📦 New Components Created

### Core Layout Components
1. **Header.jsx** - Global navigation bar with:
   - Mobile hamburger menu
   - Search functionality
   - Notification center
   - User profile menu
   - Responsive design

2. **Layout.jsx** - Updated main layout wrapper that:
   - Integrates Header globally
   - Manages sidebar state
   - Handles responsive breakpoints (lg = 1024px)
   - Provides proper spacing for all screens

### Data Display Components
3. **Card.jsx** - Flexible card component with:
   - Icon support
   - Title and subtitle
   - Loading states
   - Footer actions
   - Hover effects

4. **CardGrid.jsx** - Responsive grid system with:
   - Configurable columns
   - Gap control
   - Default responsive breakpoints

5. **StatCardsGrid.jsx** - Pre-built stat cards with:
   - Icon, title, value display
   - Trend indicators
   - Loading skeleton
   - Responsive grid

6. **PageHeader.jsx** - Page headers with:
   - Icon and title
   - Description
   - Back button navigation
   - Action buttons
   - Responsive layout

7. **DataTable.jsx** - Responsive data display with:
   - Desktop table view
   - Mobile card view
   - Sorting/filtering ready
   - Empty states
   - Loading states

## 🎯 How It Works

### Global Application Layout
```
┌─────────────────────────────────┐
│         Header (Fixed)           │  ← Fixed at top, height: 64px
├──────┬──────────────────────────┤
│      │                          │
│ S    │   Main Content Area      │  ← Scrollable
│ i    │   (Page content here)    │
│ d    │                          │
│ e    ├──────────────────────────┤
│ b    │        Footer            │
│ a    │                          │
│ r    └──────────────────────────┘
│      
└──────────────────────────────────┘
```

### Responsive Breakpoints (Tailwind)
- **Mobile**: < 640px (full width)
- **Tablet**: 640px - 1024px (md breakpoint)
- **Desktop**: ≥ 1024px (lg breakpoint)
- **Large Desktop**: ≥ 1280px (xl breakpoint)

## 🎨 Component Usage

### 1. Basic Card
```jsx
import Card from '@/components/Card';

<Card
  icon="🚗"
  title="My Cards"
  subtitle="Optional subtitle"
  footer={<a href="#">View more</a>}
>
  {/* Your content here */}
</Card>
```

### 2. Stat Cards Grid
```jsx
import StatCardsGrid from '@/components/StatCardsGrid';

const stats = [
  {
    icon: '🚗',
    title: 'Vehicles',
    value: '24',
    trend: { positive: true, percentage: 12 }
  },
  // More stats...
];

<StatCardsGrid stats={stats} cols="grid-cols-1 md:grid-cols-2 lg:grid-cols-4" />
```

### 3. Page with Header
```jsx
import PageHeader from '@/components/PageHeader';

<PageHeader
  icon="🚗"
  title="Vehicles"
  description="Manage your fleet"
  actions={[
    { label: 'Add', primary: true, onClick: () => {...} },
    { label: 'Export', onClick: () => {...} }
  ]}
/>
```

### 4. Data Table
```jsx
import DataTable from '@/components/DataTable';

const columns = [
  { key: 'id', label: 'ID' },
  { 
    key: 'status', 
    label: 'Status',
    render: (val) => <span className="...">{ val }</span>
  }
];

<DataTable
  columns={columns}
  data={dataArray}
  onRowClick={(row) => navigate(`/detail/${row.id}`)}
/>
```

## 📱 Responsive Features

### Automatic Responsiveness
- **Grid columns** adjust automatically: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3`
- **Sidebar** collapses on mobile, fixed on desktop
- **Header** shows mobile menu on screens < 1024px
- **Tables** transform to cards on mobile

### Mobile-First Approach
- Base styles for mobile (100% width)
- `md:` prefix for tablet (640px+)
- `lg:` prefix for desktop (1024px+)
- `xl:` prefix for large screens (1280px+)

## 🔧 Integrating into Existing Pages

### Before - Old Dashboard
```jsx
export default function Dashboard() {
  return (
    <div className="dashboard">
      {/* Old markup */}
    </div>
  );
}
```

### After - New Dashboard
```jsx
import PageHeader from '@/components/PageHeader';
import StatCardsGrid from '@/components/StatCardsGrid';
import Card from '@/components/Card';

export default function Dashboard() {
  return (
    <div className="space-y-8">
      <PageHeader
        title="Dashboard"
        description="Fleet overview"
      />
      
      <StatCardsGrid stats={stats} />
      
      <Card title="My Data">
        {/* Content */}
      </Card>
    </div>
  );
}
```

## 📊 API Integration Pattern

```jsx
import { useState, useEffect } from 'react';
import Card from '@/components/Card';

export default function Page() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/endpoint', {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('auth_token')}`
          }
        });
        const json = await res.json();
        setData(json);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <Card loading={loading}>
      {/* Render data */}
    </Card>
  );
}
```

## 🎯 Key Features

✅ **Global Header** - Always available across all pages
✅ **Responsive Grid** - Automatic column adjustment
✅ **Loading States** - Skeleton screens
✅ **Mobile Optimized** - Hamburger menu, touch-friendly
✅ **Accessibility** - ARIA labels, semantic HTML
✅ **Performance** - Clean CSS, minimal JS
✅ **Consistency** - Unified design system
✅ **Extensible** - Easy to customize via props

## 📝 File Locations

```
frontend/src/
├── components/
│   ├── Layout.jsx              # Main layout wrapper (updated)
│   ├── Header.jsx              # Global header (updated)
│   ├── Card.jsx                # Reusable card (new)
│   ├── CardGrid.jsx            # Grid wrapper (new)
│   ├── StatCardsGrid.jsx       # Stat cards (new)
│   ├── PageHeader.jsx          # Page headers (new)
│   ├── DataTable.jsx           # Responsive tables (new)
│   └── RESPONSIVE_COMPONENTS.md # This documentation
│
└── pages/
    └── DashboardTemplate.jsx    # Example usage (new)
```

## 🚀 Migration Checklist

- [x] Header component created and integrated
- [x] Card system implemented
- [x] Grid system implemented
- [x] StatCardsGrid implemented
- [x] PageHeader implemented
- [x] DataTable implemented
- [x] Layout updated with Header
- [x] Example dashboard created
- [x] Documentation complete
- [ ] Your pages migrated (next step!)

## 🎨 Tailwind Classes Used

### Responsive Prefixes
- `sm:` - Small (640px)
- `md:` - Medium (768px)
- `lg:` - Large (1024px)
- `xl:` - Extra Large (1280px)
- `2xl:` - 2X Large (1536px)

### Utility Classes
- `grid-cols-1` - Full width
- `md:grid-cols-2` - 2 columns on tablet
- `lg:grid-cols-3` - 3 columns on desktop
- `gap-4` - Space between items
- `rounded-lg` - Rounded corners
- `shadow-md` - Box shadow
- `transition-all` - Smooth animations

## ⚙️ Configuration

### Change responsive breakpoint
In `Layout.jsx`:
```jsx
const isLarge = window.innerWidth >= 1024; // Change 1024 to your breakpoint
```

### Customize colors
Update `Tailwind.config.js`:
```js
module.exports = {
  theme: {
    extend: {
      colors: {
        // Your custom colors
      }
    }
  }
}
```

### Adjust spacing
```jsx
<div className="space-y-8"> {/* Change 8 to your preferred spacing */}
```

## 🐛 Troubleshooting

### Header not showing
- Ensure `Header.jsx` is imported in `Layout.jsx`
- Check that `Layout` wraps your app routes

### Cards not responsive
- Verify `CardGrid` has correct `cols` prop
- Check Tailwind CSS is properly configured

### Mobile menu not working
- Ensure `isLarge` state updates on resize
- Check `setSidebarOpen` is passed correctly

### Tables not breaking to cards on mobile
- Verify `DataTable` has `md:hidden` on table
- Check mobile card view has correct grid

## 📚 Resources

- [Tailwind CSS Responsive Design](https://tailwindcss.com/docs/responsive-design)
- [React Hooks Guide](https://react.dev/reference/react)
- [Accessibility Best Practices](https://www.w3.org/WAI/WCAG21/quickref/)

## 🤝 Contributing

When adding new components:
1. Follow existing naming conventions
2. Add prop documentation
3. Include loading states
4. Test on mobile/tablet/desktop
5. Update this documentation

---

**Last Updated**: February 2026
**Version**: 1.0.0
**Status**: Production Ready ✅
