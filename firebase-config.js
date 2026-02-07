// ============================================
// FIREBASE CONFIGURATION
// ============================================
// 
// SETUP INSTRUCTIONS:
// 1. Go to https://console.firebase.google.com/
// 2. Create a new project (e.g., "little-red-hen")
// 3. Go to Project Settings > General > Your apps > Add web app
// 4. Copy the firebaseConfig object and paste the values below
// 5. Enable Firestore: Build > Firestore Database > Create database (start in test mode)
// 6. Enable Auth: Build > Authentication > Get started > Email/Password (enable it)
// 7. Create an admin user: Authentication > Users > Add user (enter your email & password)
// 8. Set Firestore rules (Build > Firestore > Rules):
//
//    rules_version = '2';
//    service cloud.firestore {
//      match /databases/{database}/documents {
//        match /shows/{showId} {
//          allow read: if true;
//          allow write: if request.auth != null;
//        }
//      }
//    }
//
// ============================================

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
