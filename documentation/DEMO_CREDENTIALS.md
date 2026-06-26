# Sunshine's Todo — Login Credentials

This document contains the login credentials and instructions for logging in to the **Sunshine's Todo** productivity workspace.

The application is connected to a local database storage (`db.json`) using custom JWT authentication. Both pre-created accounts and new registrations are supported and saved directly to the database file.

---

## 🔑 Active Accounts

You can log in using either of the following pre-created cloud accounts:

### 1. Administrator Account (Full Access)
Use this account to access the main productivity suite with administrative permissions.

*   **Email Address:** `ishika@sunshine.com`
*   **Password:** `admin123`
*   **Permissions:** Full administrative permissions.

### 2. Regular User Account
Use this account to experience the standard productivity workspace (Dashboard, To-Do lists, Calendar grids, focus mode, and private journals).

*   **Email Address:** `sunshine@example.com`
*   **Password:** `sunshine123`
*   **Permissions:** Access to all client screens except the Admin Panel.

---

## 🖥️ Running the Application

To start the local development server, open your terminal in the `client` directory and run:

```bash
cd client
npm run dev
```

The terminal will output a local URL (typically `http://localhost:5173`). Open this URL in your web browser to explore the app.
