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
// role: "admin"    = แอดมิน (สิทธิ์ปรับได้ผ่านหน้า Roles & Permissions)
// role: "sup"       = Sup
// role: "shipco"    = Ship Co
// role: "employee"  = พนักงาน (เดิมคือ "user")
export const ROLES = ["admin", "sup", "shipco", "employee"];
export const ROLE_LABELS = {
  admin: "Admin",
  sup: "Sup",
  shipco: "Ship Co",
  employee: "พนักงาน"
};

// ── รายการสิทธิ์ทั้งหมดในระบบ (ใช้ทำตาราง checkbox หน้า users.html) ──
// key ต้องตรงกับที่ใช้เช็คใน requirePermission()/hasPermission() ทุกหน้า
// และต้องตรงกับ key ที่ firestore.rules อ้างอิงถึงใน app_settings/role_permissions
export const PERMISSION_GROUPS = [
  {
    group: "หน้าเมนูหลัก",
    keys: [
      { key: "page_dashboard", label: "เข้าหน้า Dashboard" },
      { key: "page_monitor",   label: "เข้าหน้า Monitor" },
      { key: "page_users",     label: "เข้าหน้าจัดการ User" }
    ]
  },
  {
    group: "Stock",
    keys: [
      { key: "stock_manage_tab",      label: "แท็บจัดการสินค้า" },
      { key: "stock_receive",         label: "รับสินค้าเข้า" },
      { key: "stock_adjust",          label: "ปรับยอดสต๊อก" },
      { key: "stock_product_edit",    label: "แก้ไขสินค้า" },
      { key: "stock_product_delete",  label: "ลบสินค้า" },
      { key: "stock_cyclecount_save", label: "บันทึกผล Cycle Count" }
    ]
  },
  {
    group: "Medicine",
    keys: [
      { key: "medicine_receive_tab",    label: "แท็บรับยา" },
      { key: "medicine_status_tab",     label: "แท็บสถานะยา" },
      { key: "medicine_manage_tab",     label: "แท็บจัดการยา" },
      { key: "medicine_receive_action", label: "บันทึกรับยา" }
    ]
  },
  {
    group: "WMS",
    keys: [
      { key: "wms_import_tab",             label: "แท็บ Import" },
      { key: "wms_archive_tab",             label: "แท็บ Archive" },
      { key: "wms_import_csv",              label: "Import CSV กิจกรรม" },
      { key: "wms_import_sku_master",       label: "Import SKU Master" },
      { key: "wms_import_location_master",  label: "Import Location Master" },
      { key: "wms_kpi_manual_add",          label: "เพิ่ม KPI ด้วยมือ" },
      { key: "wms_kpi_manual_delete",       label: "ลบ KPI ด้วยมือ" },
      { key: "wms_export_clear",            label: "Export แล้วล้างข้อมูล" },
      { key: "wms_restore_backup",          label: "กู้คืนข้อมูลจาก Backup" }
    ]
  },
  {
    group: "WI (เอกสาร)",
    keys: [
      { key: "wi_upload", label: "อัปโหลด WI" },
      { key: "wi_delete", label: "ลบ WI" }
    ]
  },
  {
    group: "Stocktake",
    keys: [
      { key: "stocktake_view_all_jobs", label: "ดูงานนับสต๊อกของทุกคน (ไม่ใช่แค่ของตัวเอง)" }
    ]
  },
  {
    group: "Dock",
    keys: [
      { key: "dock_view",           label: "ดูบอร์ด Dock" },
      { key: "dock_toggle_status",  label: "เปลี่ยนสถานะ Dock (ว่าง/ไม่ว่าง)" },
      { key: "dock_power",          label: "สิทธิ์ระดับ Power (แก้/ยกเลิกคิว, จอง, ตาราง)" },
      { key: "dock_admin",          label: "จัดการ Dock (เพิ่ม/ลบช่อง, ตั้งค่า, พิมพ์ QR)" }
    ]
  }
];

export const PERMISSION_KEYS = PERMISSION_GROUPS.flatMap(g => g.keys.map(k => k.key));

// ── ค่า default ของแต่ละ role (ใช้ตอนยังไม่เคยตั้งค่าใน Firestore) ──
// admin = true ทั้งหมด, sup/shipco/employee = false ทั้งหมด ยกเว้นค่าที่
// ตรงกับพฤติกรรมเดิมของ dock.html (canDock=['Admin','Sup'], isPower=['Admin','Ship Co'])
// เพื่อไม่ให้ role ใหม่ได้สิทธิ์เกินกว่าที่เคยมีมาก่อนโดยไม่ตั้งใจ
export const DEFAULT_ROLE_PERMISSIONS = {
  admin: Object.fromEntries(PERMISSION_KEYS.map(k => [k, true])),
  sup: Object.fromEntries(PERMISSION_KEYS.map(k => [
    k,
    k === "dock_view" || k === "dock_toggle_status"
  ])),
  shipco: Object.fromEntries(PERMISSION_KEYS.map(k => [
    k,
    k === "dock_view" || k === "dock_power"
  ])),
  employee: Object.fromEntries(PERMISSION_KEYS.map(k => [
    k,
    k === "dock_view"
  ]))
};

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
  window.location.href = "index.html";
}

// ── ดึง Profile (role, name) จาก Firestore ─────────────────
export async function getUserProfile(uid) {
  const snap = await getDoc(doc(db, "users", uid));
  if (snap.exists()) return snap.data();
  // ถ้ายังไม่มี profile ให้สร้าง default — role ต่ำสุด (พนักงาน) เสมอ
  // ห้ามตั้งเป็น "admin"/role สูงกว่านี้โดย default เด็ดขาด
  const defaultProfile = { role: "employee", name: auth.currentUser?.email || "User" };
  await setDoc(doc(db, "users", uid), defaultProfile);
  return defaultProfile;
}

// ── สร้าง/อัปเดต User Profile (Admin ใช้) ──────────────────
export async function setUserProfile(uid, data) {
  await setDoc(doc(db, "users", uid), data, { merge: true });
}

// ── ดึงตาราง permission ทั้งหมดจาก Firestore (app_settings/role_permissions) ──
// ถ้ายังไม่เคยตั้งค่า (เอกสารไม่มีอยู่) จะคืนค่า default (DEFAULT_ROLE_PERMISSIONS)
// โดยไม่เขียนอะไรลง Firestore — ผู้ใช้ทั่วไปไม่มีสิทธิ์เขียน app_settings อยู่แล้ว
// การเขียนค่า default ครั้งแรกทำได้จากหน้า users.html (admin) เท่านั้น
let _permCache = null;
export async function getRolePermissions() {
  if (_permCache) return _permCache;
  try {
    const snap = await getDoc(doc(db, "app_settings", "role_permissions"));
    _permCache = snap.exists()
      ? mergeWithDefaults(snap.data())
      : DEFAULT_ROLE_PERMISSIONS;
  } catch (e) {
    // ไม่มีสิทธิ์อ่าน หรือ error อื่น ๆ → fail-safe ใช้ default (ปฏิเสธไว้ก่อน)
    console.error("getRolePermissions failed, using defaults:", e);
    _permCache = DEFAULT_ROLE_PERMISSIONS;
  }
  return _permCache;
}

// รวมค่าที่ตั้งไว้ใน Firestore กับ default เพื่อกัน key ที่เพิ่มใหม่ทีหลังหายไป
// (key ที่ยังไม่เคยตั้งค่า → fail-safe = false เสมอ ยกเว้น admin)
function mergeWithDefaults(saved) {
  const merged = {};
  for (const role of ROLES) {
    merged[role] = {};
    for (const key of PERMISSION_KEYS) {
      const v = saved?.[role]?.[key];
      merged[role][key] = typeof v === "boolean" ? v : DEFAULT_ROLE_PERMISSIONS[role][key];
    }
  }
  return merged;
}

export function hasPermission(permissions, key) {
  return permissions?.[key] === true;
}

// ── Guard: ตรวจสอบว่า Login แล้วหรือยัง ────────────────────
// ถ้ายังไม่ Login → redirect ไปหน้า index (Login)
// ถ้า Login แล้ว → คืน { user, profile, permissions }
// permissions = สิทธิ์ทั้งหมดของ role ผู้ใช้คนนี้ (object ของ key → true/false)
export function requireAuth(callback) {
  return new Promise((resolve) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "index.html";
        return;
      }
      const profile = await getUserProfile(user.uid);
      const allPerms = await getRolePermissions();
      const permissions = allPerms[profile.role] || {};
      const result = { user, profile, permissions };
      resolve(result);
      if (callback) callback(result);
    });
  });
}

// ── Guard: ต้องมีสิทธิ์ (permission key) นี้เท่านั้น ────────
// ใช้แทน requireAdmin() เดิม — ระบุ key ที่หน้านั้นต้องการ เช่น "page_dashboard"
export function requirePermission(key, callback) {
  return new Promise((resolve, reject) => {
    onAuthStateChanged(auth, async (user) => {
      if (!user) {
        window.location.href = "index.html";
        return;
      }
      const profile = await getUserProfile(user.uid);
      const allPerms = await getRolePermissions();
      const permissions = allPerms[profile.role] || {};
      if (!hasPermission(permissions, key)) {
        alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
        window.history.back();
        reject("Unauthorized");
        return;
      }
      const result = { user, profile, permissions };
      resolve(result);
      if (callback) callback(result);
    });
  });
}

// ── onAuthStateChanged wrapper ──────────────────────────────
export { onAuthStateChanged, auth };
