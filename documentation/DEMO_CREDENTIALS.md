# Sunshine's Todo — Login Credentials

This document contains the login credentials and instructions for logging in to the **Sunshine's Todo** productivity workspace.

The application is connected to a local database storage (`db.json`) using custom JWT authentication. Both pre-created accounts and new registrations are supported and saved directly to the database file.

---

## 🔑 Active Accounts

You can log in using either of the following pre-created cloud accounts:

### 1. Administrator Accounts (Full Access)
Use these accounts to access the main productivity suite with administrative permissions.

*   **Email Address:** `ishika@sunshine.com`
*   **Password:** `admin123`
*   **Permissions:** Full administrative permissions.

*   **Email Address:** `Jas@sunshine.com`
*   **Password:** `admin123`
*   **Permissions:** Full administrative permissions.

### 2. Regular User Account
Use this account to experience the standard productivity workspace (Dashboard, To-Do lists, Calendar grids, focus mode, and private journals).

*   **Email Address:** `sunshine@example.com`
*   **Password:** `sunshine123`
*   **Permissions:** Access to all client screens except the Admin Panel.

---

## 🖥️ Running the Application

To run the complete application (both the frontend client and backend database server concurrently with automatic local database persistence), open your terminal in the project root directory and run:

### 1. Install Workspace Dependencies (One-time Setup)
Run this command from the root directory to install dependencies for the root, frontend, and backend packages:
```bash
npm run install:all
```

### 2. Start Both Servers Concurrently
Start the client and server together in development mode:
```bash
npm run dev
```

The terminal will output local URLs (typically `http://localhost:5173` for the frontend and `http://localhost:5000` for the backend). Open `http://localhost:5173` in your web browser to explore and use the app. All CRUD operations and database persistence will work seamlessly!
