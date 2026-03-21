import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC4-4w1eeONbxtfG4wYq7sxMFrFKWSyJzM",
  authDomain: "vision-flow-15666.firebaseapp.com",
  projectId: "vision-flow-15666",
  storageBucket: "vision-flow-15666.firebasestorage.app",
  messagingSenderId: "367023812805",
  appId: "1:367023812805:web:ec2ee83e8d9968843f40ac",
  measurementId: "G-LZ4BT2D468"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
