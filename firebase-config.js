import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// Firebase console > Project settings > Your apps > firebaseConfig paste here
const firebaseConfig = {
  apiKey: "AIzaSyCBb_cBfnjpUL8JH_-0BJc_FbjRbA9CKNc",
  authDomain: "abhinav-portfolio-cs.firebaseapp.com",
  projectId: "abhinav-portfolio-cs",
  storageBucket: "abhinav-portfolio-cs.firebasestorage.app",
  messagingSenderId: "821637590587",
  appId: "1:821637590587:web:48959874d2e9baf1c0361e"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);