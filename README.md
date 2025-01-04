# Mobile Inventory Management System

A comprehensive inventory management system for mobile phones and their parts, built with React (frontend) and Node.js/Express (backend).

## 🚀 Features

### Mobile Management
- Create and manage mobile categories
- Add/Edit/Delete mobile models within categories
- Track model details and specifications

### Parts Management
- Manage mobile parts inventory
- Categorize parts by type and model
- Track part quantities and prices
- Set low stock alerts
- Part type management system

### User Management
- Role-based access control
- User authentication and authorization
- Different permission levels for various operations

### Stock Management
- Real-time inventory tracking
- Low stock notifications
- Stock movement history
- Parts usage tracking

## 🛠️ Tech Stack

### Frontend
- React.js
- TailwindCSS for styling
- Axios for API calls
- React Router for navigation
- React Icons
- Context API for state management

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcrypt for password hashing

## 📦 Project Structure

```
mobile-inventory/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── context/        # Context providers
│   │   ├── hooks/          # Custom hooks
│   │   └── config/         # Configuration files
│   └── package.json
│
└── backend/                # Node.js backend application
    ├── models/            # Mongoose models
    ├── routes/            # API routes
    ├── middleware/        # Custom middleware
    └── package.json
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/mohdsabir1/mobile-inventory.git
```

2. Install Backend Dependencies:
```bash
cd backend
npm install
```

3. Install Frontend Dependencies:
```bash
cd frontend
npm install
```

4. Set up environment variables:
   - Create `.env` file in backend directory
   - Create `.env` file in frontend directory

### Running the Application

1. Start the Backend Server:
```bash
cd backend
npm start
```

2. Start the Frontend Development Server:
```bash
cd frontend
npm start
```

## 🔑 Environment Variables

### Backend (.env)
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000
```

## 🔒 Security Features

- JWT based authentication
- Password hashing
- Role-based access control
- Protected API routes
- Input validation and sanitization

## 📱 Key Components

### Frontend Components
- `MobileList`: Manages mobile categories and models
- `PartList`: Handles parts inventory
- `ModelParts`: Manages parts for specific models
- `PartTypeManagement`: Manages part types and categories
- `DeleteConfirmationModal`: Reusable confirmation dialog

### Backend APIs
- `/api/auth`: Authentication endpoints
- `/api/models`: Mobile model management
- `/api/parts`: Parts inventory management
- `/api/part-types`: Part type management
- `/api/users`: User management

## 👥 User Roles

1. **Admin**
   - Full system access
   - User management
   - System configuration

2. **Manager**
   - Inventory management
   - Reports access
   - Part type management

3. **Staff**
   - Basic inventory operations
   - View-only access to reports

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details

