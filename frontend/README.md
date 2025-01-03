# Mobile Inventory Management System - Frontend

This is the frontend application for the Mobile Inventory Management System built with React and Vite.

## Features

- Inventory Management Dashboard
- Product CRUD Operations
- Search and Filter Functionality
- Responsive Design
- PDF Export Feature
- User-friendly Interface

## Tech Stack

- React 18
- Vite
- React Router DOM
- Axios for API calls
- Tailwind CSS for styling
- Hero Icons and React Icons
- JSPdf for PDF generation

## Getting Started

### Prerequisites

- Node.js 14+ installed
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add:
```
VITE_API_URL=http://localhost:5000 # for development
```

4. Start the development server:
```bash
npm run dev
```

### Building for Production

1. Update `.env.production` with your backend URL
2. Build the project:
```bash
npm run build
```

## Deployment

This project is configured for deployment on Netlify:

1. Install Netlify CLI:
```bash
npm install -g netlify-cli
```

2. Login to Netlify:
```bash
netlify login
```

3. Deploy:
```bash
netlify deploy
```

## Project Structure

```
frontend/
├── src/
│   ├── components/    # Reusable components
│   ├── pages/         # Page components
│   ├── context/       # React context
│   ├── api/           # API integration
│   └── utils/         # Utility functions
├── public/            # Static assets
└── dist/             # Build output
```

## Environment Variables

- `VITE_API_URL`: Backend API URL
