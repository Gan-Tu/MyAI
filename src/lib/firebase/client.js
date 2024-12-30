import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKhMgX3MnPHq6Jnlz8rPXMohgGW35Th4Q",
  authDomain: "myai-51dcc.firebaseapp.com",
  projectId: "myai-51dcc",
  storageBucket: "myai-51dcc.firebasestorage.app",
  messagingSenderId: "1063594001354",
  appId: "1:1063594001354:web:c4946d4e8244eac30e0533",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { app, auth };
