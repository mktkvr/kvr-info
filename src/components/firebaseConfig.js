import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
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
const db = getFirestore(app);

export { db };
