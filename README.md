# RAPO System — คู่มือ Deploy บน GitHub Pages

> Version 1.0 | Stock · Medicine · Smart Dock Management  
> Presented by Teerapat Tunthikul

---

## 📁 โครงสร้างไฟล์

```
rapo-app/
├── index.html          ← หน้า Login + Dashboard (เริ่มต้นที่นี่)
├── stock.html          ← ระบบสต็อกทั่วไป
├── medicine.html       ← ระบบเบิกจ่ายยา
├── stocktake.html      ← Stock Take (นับสต็อก)
├── monitor.html        ← Monitor & Audit
├── dock.html           ← Smart Dock Management
├── dock-tv.html        ← TV Display (เปิดบนจอทีวี)
├── wi.html             ← คู่มือการทำงาน WI
├── firebase-config.js  ← Firebase Config (ไฟล์กลาง)
├── auth.js             ← ระบบ Login/Role
├── shared.css          ← CSS ร่วมกันทุกหน้า
├── manifest.json       ← PWA manifest
├── sw.js               ← Service Worker
├── firestore.rules     ← Firestore Security Rules
├── database.rules.json ← Realtime DB Security Rules
└── assets/
    ├── logo.png        ← โลโก้บริษัท (ใส่เพิ่มเอง)
    ├── icon-192.png    ← PWA icon 192x192
    └── icon-512.png    ← PWA icon 512x512
```

---

## 🚀 ขั้นตอน Deploy (ทำครั้งเดียว ~15 นาที)

### ขั้นที่ 1 — สร้าง GitHub Repository

1. ไปที่ [github.com](https://github.com) → กด **New repository**
2. ชื่อ: `rapo-app`
3. เลือก **Public** → กด **Create repository**

### ขั้นที่ 2 — Upload ไฟล์ขึ้น GitHub

**วิธีง่ายที่สุด (ไม่ต้องใช้ Git):**

1. เปิด Repository ที่สร้างไว้
2. กด **"uploading an existing file"** หรือลาก-วางไฟล์ทั้งหมดลงไป
3. กด **Commit changes**

> ⚠️ ต้องสร้างโฟลเดอร์ `assets/` และใส่ `logo.png`, `icon-192.png`, `icon-512.png` ด้วย  
> ถ้ายังไม่มีรูป ระบบจะแสดงตัวอักษร "R" แทนโลโก้

### ขั้นที่ 3 — เปิด GitHub Pages

1. ใน Repository → **Settings** → **Pages**
2. Source: **Deploy from a branch**
3. Branch: **main** → Folder: **/ (root)** → กด **Save**
4. รอประมาณ 2-3 นาที แล้วเข้า URL:  
   `https://[username].github.io/rapo-app/`

---

## 🔐 ตั้งค่า Firebase Security Rules

### Firestore Rules

1. Firebase Console → **Firestore Database** → **Rules**
2. คัดลอกเนื้อหาจากไฟล์ `firestore.rules` วางทับทั้งหมด
3. กด **Publish**

### Realtime Database Rules

1. Firebase Console → **Realtime Database** → **Rules**
2. คัดลอกเนื้อหาจากไฟล์ `database.rules.json` วางทับทั้งหมด
3. กด **Publish**

---

## 👤 สร้าง User แรก (Admin)

1. Firebase Console → **Authentication** → **Users** → **Add user**
2. Email: `admin@rapo.com` (หรือ email จริง)
3. Password: ตั้งเองได้เลย

4. หลัง Login ครั้งแรก → ไปที่ **Firestore** → Collection `users`  
   จะมีเอกสาร Document ID = UID ของ user  
   เปลี่ยน `role` จาก `"user"` → `"admin"` แล้วกด **Save**

> Admin สามารถสร้าง user เพิ่มได้ผ่านหน้าจัดการใน stock.html

---

## 📱 ติดตั้งเป็นแอพบนมือถือ (PWA)

### iPhone (Safari)
1. เปิด `https://[username].github.io/rapo-app/` ใน Safari
2. กด ปุ่ม Share (□↑)
3. เลือก **"Add to Home Screen"**
4. กด **Add** → ได้ไอคอนบนหน้าจอเหมือนแอพจริง

### Android (Chrome)
1. เปิด URL ใน Chrome
2. จะมี banner "Add to Home Screen" ขึ้นมาเอง
3. หรือกด Menu (⋮) → **Add to Home Screen**

---

## 🖥️ เปิด TV Mode

เปิด URL นี้บน Smart TV หรือ PC ที่ต่อจอโปรเจกเตอร์:
```
https://[username].github.io/rapo-app/dock-tv.html
```

เพิ่ม `?date=YYYY-MM-DD` เพื่อดูข้อมูลวันที่ต้องการ:
```
https://[username].github.io/rapo-app/dock-tv.html?date=2025-01-15
```

---

## 🏗️ โครงสร้าง Firebase ที่สร้างอัตโนมัติ

### Firestore Collections
| Collection | ข้อมูล |
|---|---|
| `users` | ข้อมูลผู้ใช้ + role |
| `products` | สินค้าทั้งหมด |
| `transactions` | ประวัติเบิก/รับสินค้า |
| `stock_take_jobs` | งานนับสต็อก |
| `medicines` | ข้อมูลยา |
| `medicine_batches` | ล็อตยา |
| `medicine_logs` | ประวัติยา |
| `wi_documents` | เอกสาร WI |

### Realtime Database
```
smartdock/
├── bays/       ← ข้อมูลช่องจอด (sync realtime)
└── bookings/   ← คิวจองหน้าท่า (sync realtime)
```

---

## 🔄 อัปเดตระบบในอนาคต

แก้ไขไฟล์ใน GitHub โดยตรง:
1. เข้า Repository → คลิกไฟล์ที่ต้องการแก้
2. กด ปุ่ม ✏️ Edit
3. แก้ไข → **Commit changes**
4. GitHub Pages จะ deploy อัตโนมัติภายใน 2-3 นาที

---

## ❓ แก้ปัญหาที่พบบ่อย

**หน้าจอว่างเปล่า / Error**
- กด F12 → Console ดู error message
- ตรวจสอบว่า Firebase Config ใน `firebase-config.js` ถูกต้อง

**Login ไม่ได้**
- ตรวจสอบว่าเปิด Email/Password Auth ใน Firebase Console แล้ว
- ตรวจสอบ email/password ที่สร้างใน Authentication

**TV Display ไม่อัปเดต**
- ตรวจสอบ Realtime Database Rules ว่า allow read
- ลอง refresh หน้า TV

**ติดตั้ง PWA บน iPhone ไม่ได้**
- ต้องใช้ Safari เท่านั้น (ไม่รองรับบน Chrome/Firefox บน iOS)

---

## 📞 ติดต่อ

Presented by **Teerapat Tunthikul**  
Version 1.0 — RAPO Stock & Dock System
