# Equipment Management System - React Frontend

Modern React frontend for the Equipment Management System, built with React 18, TypeScript, Vite, and Tailwind CSS.

## Features

- 🎨 Modern, responsive UI with dark/light mode support
- 🔐 JWT-based authentication with 2FA support
- 📱 Fully responsive design (mobile, tablet, desktop)
- ⚡ Optimized performance with code splitting and lazy loading
- ♿ Accessibility features (ARIA labels, keyboard navigation)
- 🎯 Type-safe with TypeScript
- 🚀 Production-ready Docker configuration

## Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Styling
- **React Router** - Client-side routing
- **React Hook Form + Zod** - Form management and validation
- **Zustand** - State management
- **Lucide React** - Icons
- **date-fns** - Date manipulation

## Getting Started

### Prerequisites

- Node.js 20+ and npm
- Backend API running on `http://localhost:8080`

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

The app will be available at `http://localhost:3000`

## Project Structure

```
frontend-react/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (Button, Card, Modal, etc.)
│   │   ├── layout/      # Layout components (Navbar, Sidebar)
│   │   ├── features/    # Feature-specific components
│   │   └── admin/       # Admin-specific components
│   ├── pages/           # Page components
│   │   └── admin/       # Admin pages
│   ├── context/         # React Context providers
│   ├── services/        # API client and services
│   ├── types/           # TypeScript type definitions
│   ├── utils/           # Utility functions
│   └── styles/          # Global styles
├── public/              # Static assets
└── dist/                # Production build output
```

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Docker Deployment

### Build and Run

```bash
# Build Docker image
docker build -t equipment-frontend-react .

# Run container
docker run -p 3000:80 equipment-frontend-react
```

### Docker Compose

The frontend is included in the main `docker-compose.yml`:

```bash
docker-compose up frontend-react
```

## Development

### Code Style

- Use TypeScript for all new files
- Follow React best practices (hooks, functional components)
- Use Tailwind CSS for styling
- Maintain component composition and reusability

### Adding New Features

1. Create components in appropriate directories
2. Add types to `src/types/`
3. Add API methods to `src/services/api.ts`
4. Update routing in `src/App.tsx` if needed

## Production Build

The production build includes:

- Code splitting and lazy loading
- Optimized bundle sizes
- Gzip compression (via nginx)
- Static asset caching
- Security headers

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

See main project LICENSE file.
