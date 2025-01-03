# Mobile Inventory Management System - Backend

This is the backend API server for the Mobile Inventory Management System built with Node.js, Express, and MongoDB.

## Features

- RESTful API endpoints
- MongoDB database integration
- CORS enabled
- Environment variable configuration
- Error handling middleware
- Data validation

## Tech Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- CORS
- Dotenv for environment variables
- Moment.js for date handling

## Getting Started

### Prerequisites

- Node.js 14+ installed
- MongoDB installed and running
- npm or yarn package manager

### Installation

1. Clone the repository
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with:
```
MONGODB_URI=your_mongodb_connection_string
PORT=5000
```

4. Start the server:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

- `GET /api/products` - Get all products
- `POST /api/products` - Create a new product
- `GET /api/products/:id` - Get a specific product
- `PUT /api/products/:id` - Update a product
- `DELETE /api/products/:id` - Delete a product

## Deployment

This project is configured for deployment on Vercel:

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

## Project Structure

```
backend/
├── models/          # Database models
├── routes/          # API routes
├── controllers/     # Route controllers
├── middleware/      # Custom middleware
├── config/          # Configuration files
└── server.js        # Entry point
```

## Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `PORT`: Server port (default: 5000)

## Error Handling

The API uses a consistent error response format:
```json
{
  "error": "Error message here"
}
```
