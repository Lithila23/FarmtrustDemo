# FarmTrust

A web application for connecting Sri Lankan farmers and buyers, featuring transparent pricing, direct order management, and AI-driven crop price predictions.

## Project Structure

- `frontend/`: React.js web client styled with Tailwind CSS.
- `backend/`: Express.js server utilizing Sequelize (MySQL) and offering prediction integration.
- `ai-service/`: FastAPI service using Python and Prophet for crop price forecasting.

---

## Setup & Running Instructions

### 1. Prerequisites
- **Node.js** (v18+ recommended) and **npm**
- **Python** (v3.8+ recommended)
- **MySQL Server** (installed and running locally, e.g., via MySQL Installer, XAMPP, or your choice of local installation)

---

### 2. AI Service Setup (`ai-service/`)
1. Open a terminal and navigate to the AI service directory:
   ```bash
   cd ai-service
   ```
2. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
3. Activate the virtual environment:
   - **Windows (PowerShell)**: `.\venv\Scripts\Activate.ps1`
   - **Windows (CMD)**: `.\venv\Scripts\activate.bat`
   - **macOS/Linux**: `source venv/bin/activate`
4. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
5. Start the AI service:
   ```bash
   dev.bat
   ```
   *(Runs on `http://127.0.0.1:8000`)*

---

### 3. Backend Setup (`backend/`)
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment configuration:
   - Copy `.env.example` to `.env`
   - Update `DB_USER`, `DB_PASSWORD`, and `JWT_SECRET` as required for your local database configuration.
4. Set up the database:
   - Ensure MySQL is running on your system.
   - Run the creation script to create the `farmtrust` database:
     ```bash
     node create-db.js
     ```
   - Seed the database (creates tables and populates sample users):
     ```bash
     node seed.js
     ```
5. Start the backend server:
   - **Development**: `npm run dev`
   - **Production**: `npm start`
   *(Runs on `http://localhost:5000`)*

---

### 4. Frontend Setup (`frontend/`)
1. Open a terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the React development server:
   ```bash
   npm start
   ```
   *(Runs on `http://localhost:3000` and automatically opens in your browser)*

---

## Default Seed Accounts
Once the database is seeded (`node seed.js`), you can log in using these accounts:
- **Admin**: `admin@farmtrust.com` / `admin123`
- **Farmer**: `farmer@farmtrust.com` / `farmer123`
- **Buyer**: `buyer@farmtrust.com` / `buyer123`
