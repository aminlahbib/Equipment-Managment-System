# Equipment Management System - React Frontend

Modern React + TypeScript + Tailwind CSS frontend for the Equipment Management System.

## Tech Stack

- **React 19** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing (to be implemented)
- **Zustand** - State management (to be implemented)
- **Lucide React** - Icon library

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### Build

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/      # React components
│   ├── ui/         # Base UI components
│   ├── layout/     # Layout components
│   ├── features/   # Feature-specific components
│   └── common/     # Shared components
├── pages/          # Page components
├── services/       # API services
├── hooks/          # Custom React hooks
├── context/        # React contexts
├── types/          # TypeScript type definitions
├── utils/          # Utility functions
└── styles/         # Global styles
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

## Development Status

**Week 1: Foundation & Setup** ✅
- [x] Project initialization
- [x] TypeScript configuration
- [x] Tailwind CSS setup
- [x] Type definitions
- [x] API client service
- [x] Basic App component

**Next Steps:**
- Week 2: Core components & authentication
- Week 3: User dashboard
- Week 4: Activity page & reservations
- Week 5: Admin dashboard
- Week 6: Polish & deployment

