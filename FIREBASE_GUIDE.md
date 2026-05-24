# Firebase Configuration Guide for NeoHealth AI

This document provides instructions on how to finalize your Firebase setup for the NeoHealth AI application.

## 1. Get Your Credentials
1. Go to the [Firebase Console](https://console.firebase.google.com/).
2. Select your project.
3. Click on the **Project Settings** (gear icon) -> **General**.
4. Scroll down to **Your apps** and select your Web app (or create one if you haven't).
5. Copy the values from the `firebaseConfig` object and paste them into your `.env` file in `frontend/.env`.

## 2. Authorized Domains
To ensure Google Login and Authentication work correctly from your local machine, you must add your local domains to the authorized list:

1. In the Firebase Console, go to **Authentication** -> **Settings**.
2. Click on **Authorized domains**.
3. Add the following domains if they are not already present:
   - `localhost`
   - `127.0.0.1`
   - `localhost:5173` (Vite Default)
   - `localhost:5174` (Vite Fallback)

## 3. Enable Authentication Methods
1. Go to **Authentication** -> **Sign-in method**.
2. Enable **Email/Password**.
3. Enable **Google**.

## 4. Firestore Setup
1. Go to **Firestore Database**.
2. Click **Create database**.
3. Choose **Start in test mode** (for development) or **Production mode** (and configure rules).
4. Create the following collections (they will also auto-create on first write):
   - `patients`
   - `predictions`

## 5. Security Rules
For testing, you can use these basic rules (replace with production-ready rules later):

```javascript
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 6. Restart the App
After updating your `.env` file, restart the development server:

```bash
cd frontend
npm run dev
```
