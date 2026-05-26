import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';

// Your web app's Firebase configuration
// Replace these with your actual Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyA6FF8R1pGBBAJznWgPQ1cNibtlYIjV5xQ", // Make sure to put your actual API key here!
  authDomain: "binu-s-clinic.firebaseapp.com",
  projectId: "binu-s-clinic",
  storageBucket: "binu-s-clinic.firebasestorage.app",
  messagingSenderId: "837928838387",
  appId: "1:837928838387:web:26d582a6b75612acfd8386",
  measurementId: "G-NLJ2CBQXJL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, googleProvider };
