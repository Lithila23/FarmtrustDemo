<<<<<<< HEAD
# FarmTrust

A web application for connecting farmers and buyers in Sri Lanka with transparency and trust.

## Project Structure

- `backend/`: Express.js server with MongoDB
- `frontend/`: React.js client with Tailwind CSS styling

## Setup

1. Install Node.js and npm.
2. Install MongoDB: Download from https://www.mongodb.com/try/download/community or use `winget install MongoDB.MongoDBCommunity`. Start with `mongod --dbpath C:\data\db`.
3. Install dependencies:
   - Backend: `cd backend && npm install`
   - Frontend: `cd frontend && npm install`
4. .env file is created in backend with default values. Update JWT_SECRET for security.

## Running

1. Start MongoDB: `mongod --dbpath C:\data\db`
2. Start backend: `cd backend && npm start` (runs on http://localhost:5000)
3. Start frontend: `cd frontend && npm start` (runs on http://localhost:3000)
4. Open http://localhost:3000

## Features

- **User Authentication**: Registration and login for farmers, buyers, and admins
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Farmer Dashboard**: List crops with details
- **Buyer Dashboard**: Browse and search available crops
- **Admin Panel**: Manage users, crops, and system settings
- **Modern Styling**: Green gradient theme with custom components

## Styling

The application uses:
- **Tailwind CSS**: Utility-first CSS framework for responsive design
- **Custom CSS**: Additional styling in `src/index.css` with custom classes
- **Color Scheme**: Primary green (#10b981), secondary darker green (#059669), accent yellow (#f59e0b)

## API Endpoints

- POST /api/auth/register
- POST /api/auth/login
- GET /api/crops
- POST /api/crops (authenticated)
- GET /api/users/profile (authenticated)
- PUT /api/users/profile (authenticated)
=======
# FarmtrustDemo
>>>>>>> 65831607da4e6ff6fe608e1b39978d98d40b6490
