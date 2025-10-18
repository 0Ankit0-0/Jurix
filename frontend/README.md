# Jurix Frontend

The frontend for the Jurix legal simulation platform, built with React, Vite, and Tailwind CSS. This modern web application provides an intuitive interface for legal case management, AI-powered simulations, evidence review, and collaborative discussions.

## Features

- **Modern React Architecture**: Built with React 18 and hooks
- **Fast Development**: Vite for lightning-fast development and building
- **Responsive Design**: Tailwind CSS with custom components
- **Real-time Communication**: Socket.IO integration for live simulations
- **Authentication**: JWT-based user authentication with Google OAuth
- **File Uploads**: Drag-and-drop evidence upload with progress tracking
- **PDF Generation**: Client-side report generation and export
- **Dark/Light Theme**: Theme switching with next-themes
- **Animations**: Smooth page transitions with Framer Motion
- **Performance Optimized**: Code splitting, lazy loading, and bundle optimization
- **PWA Ready**: Service worker registration for offline capabilities

## Tech Stack

- **Framework**: React 18 with TypeScript support
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **UI Components**: Radix UI primitives with shadcn/ui
- **Routing**: React Router v6
- **State Management**: React Context API
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **Charts**: Custom components with CSS
- **PDF Generation**: jsPDF with autoTable
- **OAuth**: Google OAuth 2.0

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Backend server running (see backend README)

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create environment file:
   ```bash
   cp .env.example .env
   ```

4. Configure environment variables in `.env`:
   ```env
   VITE_API_BASE_URL=http://localhost:5001/api
   VITE_GOOGLE_CLIENT_ID=your_google_client_id
   VITE_ENVIRONMENT=development
   ```

5. Start development server:
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting
- `npm run clean` - Clean build artifacts
- `npm run analyze` - Analyze bundle size

## Project Structure

```
frontend/
├── public/                 # Static assets
│   ├── favicon.ico
│   ├── sw.js             # Service worker
│   └── web-app-manifest-*.png
├── src/
│   ├── assets/           # Images and icons
│   ├── components/       # Reusable UI components
│   │   ├── ui/          # Base UI components (shadcn/ui)
│   │   ├── Case/        # Case-related components
│   │   ├── Evidence/    # Evidence management
│   │   ├── simulation/  # Simulation components
│   │   └── homepageComponents/
│   ├── context/         # React contexts
│   ├── hooks/           # Custom React hooks
│   ├── lib/             # Utilities and configurations
│   ├── pages/           # Page components
│   │   ├── Dashboard/   # Dashboard page
│   │   ├── EvidenceReview/ # Evidence review
│   │   ├── CaseDiscussions/ # Discussion threads
│   │   ├── PublicCases/ # Public case listings
│   │   ├── forms/       # Authentication forms
│   │   └── home/        # Landing page
│   ├── services/        # API service functions
│   ├── utils/           # Utility functions
│   │   ├── apiUtils.js  # API utilities
│   │   ├── constants.js # Application constants
│   │   ├── errorHandler.js # Error handling
│   │   ├── helpers.js   # Helper functions
│   │   ├── monitoring.js # Performance monitoring
│   │   ├── pdfExporter.js # PDF export utilities
│   │   ├── performance.js # Performance utilities
│   │   ├── serviceWorker.js # PWA utilities
│   │   ├── validation.js # Form validation
│   │   └── index.js     # Utility exports
│   ├── App.jsx          # Main application component
│   ├── main.jsx         # Application entry point
│   └── index.css        # Global styles
├── index.html           # HTML template
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind configuration
├── package.json         # Dependencies and scripts
├── eslint.config.js     # ESLint configuration
├── .prettierrc.json     # Prettier configuration
└── README.md            # This file
```

## Key Components

### Pages

- **Home**: Landing page with platform overview
- **Dashboard**: User dashboard with case overview
- **Case Management**: Create and manage legal cases
- **Evidence Review**: Upload and analyze case evidence
- **Live Simulation**: Real-time AI-powered legal simulations
- **Replay Simulation**: Review past simulation transcripts
- **Case Discussions**: Collaborative case discussions
- **Public Cases**: Browse public case studies

### Core Features

#### Authentication
- JWT-based authentication
- Google OAuth integration
- Protected routes
- User profile management

#### Case Management
- Create detailed case profiles
- Upload multiple evidence types
- AI-powered document analysis
- Case status tracking

#### Simulations
- Prosecutor vs Defense AI agents
- Real-time chat interface
- Judge AI for rulings
- Transcript generation and replay

#### Evidence Processing
- PDF, DOCX, and image upload
- OCR text extraction
- Table extraction from documents
- Evidence categorization

#### Reports
- Automated report generation
- PDF export functionality
- Case summary and analysis

## API Integration

The frontend communicates with the backend through RESTful APIs:

- **Base URL**: Configurable via `VITE_API_BASE_URL`
- **Authentication**: Bearer token in Authorization header
- **Real-time**: Socket.IO for simulation events
- **File Uploads**: Multipart form data

## Styling

- **Tailwind CSS**: Utility-first CSS framework
- **Custom Components**: shadcn/ui component library
- **Themes**: Light/dark mode support
- **Animations**: Framer Motion for smooth transitions
- **Responsive**: Mobile-first design approach

## Performance

- **Code Splitting**: Route-based lazy loading
- **Bundle Optimization**: Vendor chunk splitting
- **Image Optimization**: Lazy loading and WebP support
- **Caching**: Service worker for offline capabilities
- **Monitoring**: Web vitals tracking

## Development Guidelines

### Code Style
- ESLint for code linting
- Prettier for code formatting
- Consistent naming conventions
- Component composition over inheritance

### Component Structure
- Functional components with hooks
- Custom hooks for shared logic
- Prop validation with PropTypes
- Error boundaries for error handling

### State Management
- React Context for global state
- Local state for component-specific data
- Custom hooks for API calls
- Optimistic updates for better UX

## Deployment

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_GOOGLE_CLIENT_ID=your_production_google_client_id
VITE_ENVIRONMENT=production
```

### Serve Static Files
The `dist` folder contains the production build that can be served by any static file server.

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Contributing

1. Follow the existing code structure and naming conventions
2. Write tests for new components and features
3. Ensure code passes linting and formatting checks
4. Update documentation for new features
5. Test across different browsers and devices

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure backend CORS is configured for frontend domain
2. **WebSocket Connection**: Check Socket.IO server configuration
3. **File Uploads**: Verify backend upload endpoints and file size limits
4. **Authentication**: Check JWT token expiration and refresh logic

### Development Tips

- Use React DevTools for component debugging
- Check Network tab for API request/response issues
- Use browser developer tools for performance profiling
- Enable React Strict Mode for development warnings

## License

This project is part of the Jurix legal simulation platform.
