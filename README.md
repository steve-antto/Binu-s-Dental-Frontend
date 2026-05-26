# Binu's Dental Frontend

A modern, responsive, and multilingual web frontend for Binu's Dental clinic built with React, Vite, TypeScript, and Tailwind CSS. It connects to the existing Node.js/Express backend and uses Firebase Authentication.

## Features
- **Multilingual UI (i18next):** Supports English, Tamil, Malayalam, Hindi, and Telugu.
- **Firebase Auth:** Email/password and Google OAuth login.
- **Backend Syncing:** Secure ID Token verification against the backend for authenticated requests.
- **Responsive Design:** Premium modern UI built with Tailwind CSS.

## Getting Started

### Prerequisites
- Node.js (v18+)
- Firebase Project setup

### Local Development
1. **Install Dependencies:**
   ```bash
   cd dental-frontend
   npm install
   ```

2. **Environment Variables:**
   Create a `.env` file in the `dental-frontend` root with your Firebase config:
   ```env
   VITE_FIREBASE_API_KEY="your-api-key"
   VITE_FIREBASE_AUTH_DOMAIN="your-auth-domain"
   VITE_FIREBASE_PROJECT_ID="your-project-id"
   VITE_FIREBASE_STORAGE_BUCKET="your-storage-bucket"
   VITE_FIREBASE_MESSAGING_SENDER_ID="your-messaging-sender-id"
   VITE_FIREBASE_APP_ID="your-app-id"
   VITE_API_BASE_URL="/api/v1"
   ```

3. **Start the Frontend:**
   ```bash
   npm run dev
   ```

4. **Start the Backend:**
   Ensure the backend is running on `localhost:4500` (or update `vite.config.ts` proxy settings).

## Deployment

### Vercel / Netlify
1. Connect your GitHub repository to Vercel or Netlify.
2. Set the build command to `npm run build`.
3. Set the publish directory to `dist`.
4. Add the environment variables from your `.env` file into the deployment platform's settings.
5. In your frontend, you may need to update `VITE_API_BASE_URL` to point to your live backend URL (e.g., `https://api.binusdental.com/api/v1`) rather than relying on Vite's proxy, which only works locally.

### Firebase Hosting
1. Install Firebase CLI: `npm install -g firebase-tools`
2. Login to Firebase: `firebase login`
3. Initialize hosting: `firebase init hosting`
   - Select your project
   - Set public directory to `dist`
   - Configure as a single-page app: Yes
4. Build the app: `npm run build`
5. Deploy: `firebase deploy --only hosting`

## Backend Changes Summary
To support this frontend, the backend has been updated:
- The `User` model now includes a `language` field.
- A new endpoint `PATCH /api/v1/auth/users/:id/language` was added to sync language preferences.
- Firebase Admin SDK is verified on each sync and auth middleware dynamically validates tokens.
