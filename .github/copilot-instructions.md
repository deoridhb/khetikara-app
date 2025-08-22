# KhetiKara AI Agent Instructions

## Project Overview
KhetiKara is a React-based e-commerce application built with Vite, using Supabase as the backend. The application follows a monolithic frontend architecture with direct Supabase integration.

## Key Technologies & Dependencies
- Frontend: React 18 with Vite
- Styling: Tailwind CSS v4 (Note: Uses @tailwindcss/postcss plugin)
- State Management: React hooks (useState, useReducer, useMemo)
- Backend: Supabase
- UI Components: Lucide React for icons
- Animation: Framer Motion

## Architecture Patterns
1. **API Service Pattern**
   - Central API service class in `src/App.jsx` handles all Supabase interactions
   - Example:
   ```jsx
   class ApiService {
     constructor() {
       this.baseUrl = SUPABASE_URL;
       this.apiKey = SUPABASE_ANON_KEY;
     }
   }
   ```

2. **Component Architecture**
   - Components are defined within `App.jsx`
   - Heavy use of React.memo for performance optimization
   - State management uses combination of useState and useReducer

## Development Workflow
1. **Local Development**
   ```bash
   npm install
   npm run dev
   ```

2. **Build Process**
   ```bash
   npm run build
   npm run preview
   ```

## Project-Specific Conventions
1. **State Management**
   - Global state managed through React Context
   - Complex state updates use useReducer
   - Memoization with useMemo for expensive calculations

2. **Network Status Handling**
   - Built-in offline/online detection using Wifi/WifiOff components
   - Implement error boundaries for API failures

## Integration Points
1. **Supabase Integration**
   - Direct integration through supabase-js
   - Configuration in App.jsx
   - Edge Functions endpoint: `${SUPABASE_URL}/functions/v1/`

## Common Patterns
1. **Error Handling**
   - API errors are handled through try-catch in ApiService
   - UI feedback uses AlertCircle component

## Key Files/Directories
- `/src/App.jsx` - Main application logic and components
- `/src/main.jsx` - Application entry point
- `/src/index.css` - Global styles
- `/public/` - Static assets
- `/supabase/` - Supabase configurations and functions

Note: When making changes, ensure to handle both online and offline states, and maintain the existing error handling patterns.
