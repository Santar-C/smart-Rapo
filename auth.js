// ============================================================
// auth.js — ระบบ Login/Role ร่วมกัน ทุกหน้า import ไฟล์นี้
// ============================================================

import { auth, db } from "./firebase-config.js";
import {
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import {
  doc, getDoc, setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// ── กำหนด Role ──────────────────────────────────────────────
// role: "admin" = เข้าได้ทุกหน้า, จัดการได้ทุกอย่าง
// role: "user"  = เข้าได้บางหน้า, ทำรายการได้ ไม่มีสิทธิ์ลบ/จัดการ

// ── Login ───────────────────────────────────────────────────
export async function loginUser(email, password) {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    return { ok: true, user: cred.user };
  } catch (e) {
    const msg = {
      "auth/invalid-credential": "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
      "auth/user-not-found": "ไม่พบผู้ใช้งานนี้ในระบบ",
      "auth/wrong-password": "รหัสผ่านไม่ถูกต้อง",
      "auth/too-many-requests": "ลองหลายครั้งเกินไป กรุณารอสักครู่"
    }[e.code] || "เกิดข้อผิดพลาด: " + e.message;
    return { ok: false, error: msg };
  }
}

// ── Logout ──────────────────────────────────────────────────
export async function logoutUser() {
  await signOut(auth);
  window.location.href = "/rapo-app/index.html";
}

// ── ดึง Profile (role, name) จาก Firestore ─────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data();
  // ถ้ายังไม่มี profile ให้สร้าง default
  const defaultProfile = { role: "user", name: auth.currentUser?.email || "User" };
  await setDoc(doc(db, "users", uid), defaultProfile);
  return defaultProfile;
}

// ── สร้าง/อัปเดต User Profile (Admin ใช้) ──────────────────
export async function setUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

// ── Guard: ตรวจสอบว่า Login แล้วหรือยัง ────────────────────
// ถ้ายังไม่ Login → redirect ไปหน้า index (Login)
// ถ้า Login แล้ว → คืน { user, profile }
export function requireAuth(callback) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/rapo-app/index.html";
        return;
      }
      const profile = await getUserProfile(user.uid);
      resolve({ user, profile });
      if (callback) callback({ user, profile });
    });
  });
}

// ── Guard: ต้องเป็น Admin เท่านั้น ─────────────────────────
export function requireAdmin(callback) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "/rapo-app/index.html";
        return;
      }
      const profile = await getUserProfile(user.uid);
      if (profile.role !== "admin") {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        window.history.back();
        reject("Unauthorized");
        return;
      }
      resolve({ user, profile });
      if (callback) callback({ user, profile });
    });
  });
}

// ── onAuthStateChanged wrapper ──────────────────────────────
export { onAuthStateChanged, auth };
