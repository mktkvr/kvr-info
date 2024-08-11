// src/firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
//   apiKey: "YOUR_API_KEY",
//   authDomain: "YOUR_AUTH_DOMAIN",
//   projectId: "YOUR_PROJECT_ID",
//   storageBucket: "YOUR_STORAGE_BUCKET",
//   messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
//   appId: "YOUR_APP_ID"
  apiKey: "AIzaSyDrKHiNOxfkLZcajxOJmp_4yHgstFAUecU",
  authDomain: "kvr-info.firebaseapp.com",
  databaseURL: "https://kvr-info-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "kvr-info",
  storageBucket: "kvr-info.appspot.com",
  messagingSenderId: "945200773612",
  appId: "1:945200773612:web:b3d8d2bb91d9944ddb68c9",
  measurementId: "G-82W4QP82RT"
};

const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export { storage };
