import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyArx4wmy_JEN39HnKpd2YMOwsJoUu0U-CA",
  authDomain: "sewsmart-pos.firebaseapp.com",
  projectId: "sewsmart-pos",
  storageBucket: "sewsmart-pos.appspot.com",
  messagingSenderId: "796043143292",
  appId: "1:796043143292:web:193bb80129d3f7855141f9",
  measurementId: "G-Y9BS8RL6ZE"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);