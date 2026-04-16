// ============================================================
// firebase-config.js — ไฟล์ Config กลาง ใช้ร่วมกันทุกหน้า
// RAPO System v1.0
// ============================================================

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyCx2A8zmYI1GxvJY2-De6A7FPo1tgVRJk8",
  authDomain: "rapo-system.firebaseapp.com",
  databaseURL: "https://rapo-system-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "rapo-system",
  storageBucket: "rapo-system.firebasestorage.app",
  messagingSenderId: "87090183469",
  appId: "1:87090183469:web:eafb1ded183755f329a7a4"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);       // Firestore — Stock, Medicine, Users
export const rtdb = getDatabase(app);      // Realtime DB — Dock (realtime TV)
export default app;
