import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCJm47YfDXduYsnAvCLwY5LgM5O5x4W9-4",
  authDomain: "velora-demo.firebaseapp.com",
  projectId: "velora-demo",
  storageBucket: "velora-demo.firebasestorage.app",
  messagingSenderId: "334002083712",
  appId: "1:334002083712:web:b393cf141e8aba02c21365",
  measurementId: "G-LYKKH4PJ93"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

