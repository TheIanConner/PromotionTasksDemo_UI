# Un:Hurd Music Promotion Portal

A web application for music artists and labels to manage their release promotion tasks. This platform helps track and organize promotional activities for music releases.

## Features

- **User Authentication**: Login system for artists
- **Dashboard Overview**: View all releases and promotion tasks in a centralized dashboard
- **Release Management**: Create and manage music releases (singles, EPs, albums, mixtapes)
- **Task Management**: Track promotion tasks with status updates (To-Do, In Progress, Done)
- **Priority System**: Assign and modify task priorities to focus on important activities
- **Visual Celebration**: Animation effects when tasks are completed for positive reinforcement

## Technology Stack

- **Frontend**: React, TypeScript, TailwindCSS
- **HTTP Client**: Axios
- **UI Components**: Custom components with Lucide React icons
- **Notifications**: React Hot Toast

## To-Do Improvements

**Authentication Enhancements**

- (Out of scope for demo) Implement proper authentication (currently only checking username)
- (Out of scope for demo) Add password reset functionality
- (Out of scope for demo) Implement JWT token-based auth system

**API Integration**

- Configure proper API endpoint URL based on environment
- (Out of scope for demo) Implement API request caching for better performance

**UI/UX Improvements**

- Add dark/light theme toggle
- Implement skeleton loading states
- (Out of scope for demo) Create a guided onboarding experience for new users

**Feature Additions**

- Add ability to create custom promotion tasks

**Technical Improvements**

- Implement comprehensive test coverage
- Optimize bundle size and loading performance
- (Out of scope for demo) Enhance accessibility compliance

## Getting Started

### Installation

1. Clone the repository
2. Install dependencies with `npm install` or `yarn install`
3. Copy `.env.example` to `.env` and update the API URL as needed
4. Start the development server with `npm run dev` or `yarn dev`
5. Open the URL shown by Vite in your browser

### Environment Variables

This application uses the following environment variables:

- `VITE_API_URL`: The URL of the API server (defaults to http://localhost:5110 if not set)

For local development, variables are loaded from the `.env` file. In production environments like GitHub or Azure App Services, configure these as environment variables in your deployment settings.

Note: Variables must be prefixed with `VITE_` to be accessible by the application.

### Building for Production

To build the application for production:

```bash
npm run build
```

This creates a `build` directory with the production-ready files that can be deployed to any static hosting service.
