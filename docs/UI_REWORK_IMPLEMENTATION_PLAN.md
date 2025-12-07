# UI Rework Implementation Plan
## Step-by-Step Migration Guide

**Reference:** `equip-|-pro-2`  
**Target:** React + TypeScript + Tailwind CSS  
**Timeline:** 6 weeks

---

## Week 1: Foundation & Setup

### Day 1-2: Project Initialization

#### Task 1.1: Create New React Project
```bash
# Initialize Vite + React + TypeScript project
npm create vite@latest frontend-react -- --template react-ts
cd frontend-react
npm install
```

**Files to create:**
- `package.json` (with all dependencies)
- `vite.config.ts`
- `tsconfig.json`
- `.env.example`

**Dependencies to install:**
```bash
npm install react react-dom react-router-dom lucide-react zustand date-fns react-hook-form zod
npm install -D @types/react @types/react-dom @vitejs/plugin-react typescript vite tailwindcss autoprefixer postcss @testing-library/react @testing-library/jest-dom vitest
```

#### Task 1.2: Configure Tailwind CSS
```bash
npx tailwindcss init -p
```

**Files to configure:**
- `tailwind.config.js` - Add reference color scheme
- `postcss.config.js`
- `src/styles/tailwind.css` - Import Tailwind directives

**Tailwind Config:**
```javascript
// tailwind.config.js
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-background)',
        surface: 'var(--color-surface)',
        surfaceHighlight: 'var(--color-surface-highlight)',
        border: 'var(--color-border)',
        primary: 'var(--color-primary)',
        primaryHover: 'var(--color-primary-hover)',
        danger: 'var(--color-danger)',
        success: 'var(--color-success)',
        warning: 'var(--color-warning)',
        text: {
          primary: 'var(--color-text-primary)',
          secondary: 'var(--color-text-secondary)',
          tertiary: 'var(--color-text-tertiary)',
        }
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
```

#### Task 1.3: Set Up Project Structure
```
src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── features/
│   └── common/
├── pages/
├── services/
├── hooks/
├── context/
├── types/
├── utils/
├── styles/
├── App.tsx
└── main.tsx
```

#### Task 1.4: Configure CSS Variables
**File:** `src/styles/globals.css`
```css
:root {
  --color-background: #ffffff;
  --color-surface: #f4f4f5;
  --color-surface-highlight: #e4e4e7;
  --color-border: #e4e4e7;
  --color-primary: #2563eb;
  --color-primary-hover: #1d4ed8;
  --color-danger: #ef4444;
  --color-success: #16a34a;
  --color-warning: #eab308;
  --color-text-primary: #18181b;
  --color-text-secondary: #71717a;
  --color-text-tertiary: #a1a1aa;
}

.dark {
  --color-background: #09090b;
  --color-surface: #18181b;
  --color-surface-highlight: #27272a;
  --color-border: #27272a;
  --color-primary: #3b82f6;
  --color-primary-hover: #2563eb;
  --color-danger: #ef4444;
  --color-success: #22c55e;
  --color-warning: #eab308;
  --color-text-primary: #fafafa;
  --color-text-secondary: #a1a1aa;
  --color-text-tertiary: #52525b;
}
```

### Day 3-4: Core Infrastructure

#### Task 1.5: Create Type Definitions
**File:** `src/types/equipment.ts`
```typescript
export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  BORROWED = 'BORROWED',
  MAINTENANCE = 'MAINTENANCE',
  RETIRED = 'RETIRED',
  OVERDUE = 'OVERDUE'
}

export interface Equipment {
  id: number;
  inventarnummer: string;
  bezeichnung: string;
  category?: string;
  status: EquipmentStatus;
  condition?: string;
  location?: string;
  serialNumber?: string;
  image?: string;
  specs?: string;
}
```

**File:** `src/types/user.ts`
```typescript
export enum Role {
  USER = 'USER',
  ADMIN = 'ADMIN'
}

export interface User {
  id: number;
  benutzername: string;
  vorname: string;
  nachname: string;
  email?: string;
  role: Role;
  avatar?: string;
}
```

**File:** `src/types/loan.ts`
```typescript
export interface Loan {
  id: number;
  equipmentId: number;
  equipmentName: string;
  benutzerId: number;
  ausleihe: string; // ISO date string
  rueckgabe?: string;
  expectedReturnDate?: string;
  status: 'Active' | 'Returned' | 'Overdue';
}
```

#### Task 1.6: Create API Client
**File:** `src/services/api.ts`
- Adapt existing `frontend/js/api.js` to TypeScript
- Create typed methods for all endpoints
- Handle authentication tokens
- Error handling

#### Task 1.7: Set Up Routing
**File:** `src/App.tsx`
- Implement hash-based routing (to match reference)
- Or use React Router
- Protected routes
- Public routes

#### Task 1.8: Create Theme Context
**File:** `src/context/ThemeContext.tsx`
- Dark/light mode toggle
- Persist to localStorage
- System preference detection

### Day 5: Base UI Components

#### Task 1.9: Create Button Component
**File:** `src/components/ui/Button.tsx`
- Match reference Button component
- Variants: primary, secondary, ghost, danger
- Sizes: sm, md, lg, icon
- TypeScript interfaces

#### Task 1.10: Create Card Component
**File:** `src/components/ui/Card.tsx`
- Match reference Card component
- Hover effects
- Border styling

#### Task 1.11: Create Modal Component
**File:** `src/components/ui/Modal.tsx`
- Match reference Modal component
- Backdrop blur
- Escape key handling
- Animation

---

## Week 2: Core Components & Authentication

### Day 1-2: Complete UI Component Library

#### Task 2.1: Create Toast Component
**File:** `src/components/ui/Toast.tsx`
- Match reference Toast component
- Success/error variants
- Auto-dismiss
- Animation

#### Task 2.2: Create Tooltip Component
**File:** `src/components/ui/Tooltip.tsx`
- Match reference Tooltip component
- Position variants
- Hover trigger

#### Task 2.3: Create Input Component
**File:** `src/components/ui/Input.tsx`
- Text input
- Search input variant
- Error states
- Label support

#### Task 2.4: Create Select Component
**File:** `src/components/ui/Select.tsx`
- Dropdown select
- Styled to match design system

#### Task 2.5: Create Badge Component
**File:** `src/components/ui/Badge.tsx`
- Status badges
- Color variants
- Size variants

### Day 3-4: Layout Components

#### Task 2.6: Create Navbar Component
**File:** `src/components/layout/Navbar.tsx`
- Match reference Navbar
- Logo
- Navigation items
- Search bar
- Theme toggle
- User avatar
- Mobile menu
- Notifications bell

#### Task 2.7: Create Sidebar Component (Admin)
**File:** `src/components/layout/Sidebar.tsx`
- Admin sidebar
- Navigation links
- Active state
- Collapsible (optional)

### Day 5: Authentication Pages

#### Task 2.8: Create Landing Page
**File:** `src/pages/Landing.tsx`
- Match reference Landing component
- Hero section
- Features grid
- CTA buttons
- Footer

#### Task 2.9: Create Login Page
**File:** `src/pages/Login.tsx`
- Login form
- Form validation (react-hook-form + zod)
- Error handling
- 2FA support
- Link to register/forgot password

#### Task 2.10: Create Register Page
**File:** `src/pages/Register.tsx`
- Registration form
- Form validation
- Error handling
- Link to login

#### Task 2.11: Create Forgot Password Page
**File:** `src/pages/ForgotPassword.tsx`
- Password reset form
- Email input
- Submit handler

---

## Week 3: User Dashboard

### Day 1-2: Dashboard Layout & Stats

#### Task 3.1: Create Dashboard Page Structure
**File:** `src/pages/Dashboard.tsx`
- Page layout
- Header section
- Stats cards section
- Main content area

#### Task 3.2: Create Stats Cards
**File:** `src/components/features/StatsCard.tsx`
- Available items count
- Active loans count
- Overdue count
- Icons
- Loading states (skeleton)

#### Task 3.3: Create Equipment Grid/List View
**File:** `src/components/features/EquipmentGrid.tsx`
- Grid view
- List view
- Toggle between views
- Equipment cards

#### Task 3.4: Create Equipment Card
**File:** `src/components/features/EquipmentCard.tsx`
- Image
- Name
- Specs
- Status badge
- Hover effects
- Click handler

### Day 3-4: Filters & Search

#### Task 3.5: Create Category Filter
**File:** `src/components/features/CategoryFilter.tsx`
- Pill-style buttons
- Active state
- All categories option

#### Task 3.6: Create Search Bar
**File:** `src/components/features/SearchBar.tsx`
- Search input
- Icon
- Debounced search
- Clear button

#### Task 3.7: Create View Toggle
**File:** `src/components/features/ViewToggle.tsx`
- Grid/List toggle
- Icons
- Active state

#### Task 3.8: Create Sort Menu
**File:** `src/components/features/SortMenu.tsx`
- Dropdown menu
- Sort options
- Active selection

### Day 5: Equipment Details & Actions

#### Task 3.9: Create Equipment Details Modal
**File:** `src/components/features/EquipmentDetailsModal.tsx`
- Large image
- Equipment info
- Status badge
- Borrow/Return button
- Close button

#### Task 3.10: Implement Borrow Functionality
- API integration
- Success/error handling
- Toast notifications
- Refresh equipment list

#### Task 3.11: Create Activity Sidebar
**File:** `src/components/features/ActivitySidebar.tsx`
- Loan list
- Sort options
- Return actions
- Quick return
- Empty state

---

## Week 4: Activity Page & Reservations

### Day 1-2: Activity Page

#### Task 4.1: Create Activity Page
**File:** `src/pages/Activity.tsx`
- Page layout
- Header
- Filter tabs
- Search bar
- Loan list

#### Task 4.2: Create Filter Tabs
**File:** `src/components/features/FilterTabs.tsx`
- All, Active, Returned, Overdue
- Active state
- Tab styling

#### Task 4.3: Create Loan Card
**File:** `src/components/features/LoanCard.tsx`
- Equipment image
- Equipment name
- Borrow date
- Due date
- Status badge
- Return actions
- Hover effects

#### Task 4.4: Implement Return Functionality
- Return button
- Quick return
- Confirmation
- API integration
- Toast notifications

### Day 3-4: Reservations

#### Task 4.5: Create Reservations Section
**File:** `src/components/features/ReservationsSection.tsx`
- Reservation list
- Create reservation button
- Reservation cards

#### Task 4.6: Create Reservation Card
**File:** `src/components/features/ReservationCard.tsx`
- Equipment info
- Date range
- Status badge
- Cancel button

#### Task 4.7: Create Reservation Modal
**File:** `src/components/features/CreateReservationModal.tsx`
- Equipment selection
- Date picker
- Start/end dates
- Submit handler

### Day 5: Polish & Integration

#### Task 4.8: Add Loading States
- Skeleton loaders
- Spinner components
- Loading overlays

#### Task 4.9: Add Empty States
- No equipment message
- No loans message
- No reservations message
- Clear filters button

#### Task 4.10: Add Error Handling
- Error boundaries
- Error messages
- Retry mechanisms

---

## Week 5: Admin Dashboard

### Day 1-2: Admin Layout & Overview

#### Task 5.1: Create Admin Dashboard Layout
**File:** `src/pages/admin/AdminDashboard.tsx`
- Sidebar navigation
- Main content area
- Section switching

#### Task 5.2: Create Admin Overview Section
**File:** `src/pages/admin/sections/Overview.tsx`
- Stats cards
- Recent activity
- Quick actions

### Day 3-4: Equipment Management

#### Task 5.3: Create Equipment Management Section
**File:** `src/pages/admin/sections/EquipmentManagement.tsx`
- Equipment list/grid
- Add equipment button
- Search and filters
- Bulk operations

#### Task 5.4: Create Add/Edit Equipment Modal
**File:** `src/components/admin/EquipmentModal.tsx`
- Form fields
- Validation
- Submit handler
- Image upload (optional)

#### Task 5.5: Implement Equipment CRUD
- Create equipment
- Update equipment
- Delete equipment
- Confirmation dialogs

### Day 5: User Management

#### Task 5.6: Create User Management Section
**File:** `src/pages/admin/sections/UserManagement.tsx`
- User list
- Search and filters
- User cards

#### Task 5.7: Create User Details Modal
**File:** `src/components/admin/UserModal.tsx`
- User info
- Role selection
- Account status
- Update handler

#### Task 5.8: Implement User Management
- Update user
- Delete user
- Role management
- Account status management

---

## Week 6: Admin Features & Polish

### Day 1-2: Loan & Maintenance Management

#### Task 6.1: Create Loan Management Section
**File:** `src/pages/admin/sections/LoanManagement.tsx`
- Current loans
- Loan history
- Overdue loans
- Filters

#### Task 6.2: Create Maintenance Management Section
**File:** `src/pages/admin/sections/MaintenanceManagement.tsx`
- Maintenance list
- Schedule maintenance
- Update status
- Filters

#### Task 6.3: Create Reservation Management Section
**File:** `src/pages/admin/sections/ReservationManagement.tsx`
- All reservations
- Confirm reservations
- Filters

### Day 3-4: Polish & Optimization

#### Task 6.4: Add Animations
- Page transitions
- Component animations
- Hover effects
- Loading animations

#### Task 6.5: Responsive Design
- Mobile optimization
- Tablet optimization
- Touch interactions
- Mobile menu

#### Task 6.6: Performance Optimization
- Code splitting
- Lazy loading
- Image optimization
- Bundle optimization

#### Task 6.7: Accessibility
- Keyboard navigation
- ARIA labels
- Focus management
- Screen reader support

### Day 5: Testing & Deployment

#### Task 6.8: Unit Tests
- Component tests
- Utility function tests
- Hook tests

#### Task 6.9: Integration Tests
- Page tests
- Flow tests
- API integration tests

#### Task 6.10: E2E Tests
- Critical user flows
- Authentication flow
- Equipment borrowing flow
- Admin operations

#### Task 6.11: Build & Deploy
- Production build
- Docker configuration
- CI/CD pipeline
- Deployment

---

## Component Checklist

### UI Components
- [ ] Button
- [ ] Card
- [ ] Modal
- [ ] Toast
- [ ] Tooltip
- [ ] Input
- [ ] Select
- [ ] Badge
- [ ] Skeleton
- [ ] Spinner

### Layout Components
- [ ] Navbar
- [ ] Sidebar
- [ ] PageContainer
- [ ] Footer

### Feature Components
- [ ] EquipmentCard
- [ ] EquipmentGrid
- [ ] EquipmentList
- [ ] EquipmentDetailsModal
- [ ] LoanCard
- [ ] ReservationCard
- [ ] StatsCard
- [ ] SearchBar
- [ ] CategoryFilter
- [ ] ViewToggle
- [ ] SortMenu
- [ ] FilterTabs

### Pages
- [ ] Landing
- [ ] Login
- [ ] Register
- [ ] ForgotPassword
- [ ] Dashboard
- [ ] Activity
- [ ] AdminDashboard
- [ ] EquipmentManagement
- [ ] UserManagement
- [ ] LoanManagement
- [ ] MaintenanceManagement
- [ ] ReservationManagement

---

## API Integration Checklist

### Authentication
- [ ] Login
- [ ] Register
- [ ] Logout
- [ ] Password Reset
- [ ] 2FA Enable
- [ ] 2FA Verify
- [ ] 2FA Disable

### User Operations
- [ ] Get Profile
- [ ] Update Profile
- [ ] Get Available Equipment
- [ ] Search Equipment
- [ ] Borrow Equipment
- [ ] Return Equipment
- [ ] Get My Loans
- [ ] Get Loan Rules
- [ ] Create Reservation
- [ ] Get My Reservations
- [ ] Cancel Reservation

### Admin Operations
- [ ] Get All Users
- [ ] Search Users
- [ ] Update User
- [ ] Delete User
- [ ] Get All Equipment
- [ ] Search Equipment
- [ ] Add Equipment
- [ ] Update Equipment
- [ ] Delete Equipment
- [ ] Get Current Loans
- [ ] Get Loan History
- [ ] Get Overdue Loans
- [ ] Schedule Maintenance
- [ ] Start Maintenance
- [ ] Complete Maintenance
- [ ] Get Maintenance History
- [ ] Get All Reservations
- [ ] Confirm Reservation

---

## Testing Checklist

### Unit Tests
- [ ] Button component
- [ ] Card component
- [ ] Modal component
- [ ] Toast component
- [ ] Input component
- [ ] Utility functions
- [ ] Formatters
- [ ] Validators

### Integration Tests
- [ ] Authentication flow
- [ ] Equipment browsing
- [ ] Equipment borrowing
- [ ] Equipment return
- [ ] Reservation creation
- [ ] Admin operations

### E2E Tests
- [ ] User registration
- [ ] User login
- [ ] Browse equipment
- [ ] Borrow equipment
- [ ] Return equipment
- [ ] Create reservation
- [ ] Admin login
- [ ] Admin equipment management
- [ ] Admin user management

---

## Deployment Checklist

### Build Configuration
- [ ] Production build script
- [ ] Environment variables
- [ ] API base URL configuration
- [ ] Asset optimization

### Docker
- [ ] Dockerfile
- [ ] .dockerignore
- [ ] Multi-stage build
- [ ] Nginx configuration

### CI/CD
- [ ] GitHub Actions workflow
- [ ] Build on push
- [ ] Run tests
- [ ] Deploy to staging
- [ ] Deploy to production

### Documentation
- [ ] README.md
- [ ] Component documentation
- [ ] API integration guide
- [ ] Deployment guide
- [ ] Developer guide

---

## Daily Standup Template

**Date:** [Date]  
**Sprint:** Week [X], Day [Y]

### Yesterday
- [Completed tasks]

### Today
- [Planned tasks]

### Blockers
- [Any blockers]

### Notes
- [Additional notes]

---

## Progress Tracking

### Week 1: Foundation
- [ ] Day 1-2: Project setup
- [ ] Day 3-4: Core infrastructure
- [ ] Day 5: Base components

### Week 2: Components & Auth
- [ ] Day 1-2: UI components
- [ ] Day 3-4: Layout components
- [ ] Day 5: Authentication pages

### Week 3: User Dashboard
- [ ] Day 1-2: Dashboard layout
- [ ] Day 3-4: Filters & search
- [ ] Day 5: Equipment details

### Week 4: Activity & Reservations
- [ ] Day 1-2: Activity page
- [ ] Day 3-4: Reservations
- [ ] Day 5: Polish

### Week 5: Admin Dashboard
- [ ] Day 1-2: Admin layout
- [ ] Day 3-4: Equipment management
- [ ] Day 5: User management

### Week 6: Admin Features & Deploy
- [ ] Day 1-2: Loan & maintenance
- [ ] Day 3-4: Polish & optimization
- [ ] Day 5: Testing & deployment

---

**Document Version:** 1.0  
**Last Updated:** 2024  
**Status:** Ready for Implementation

