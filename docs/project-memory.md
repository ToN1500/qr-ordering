# Project Memory & Checkpoints

## 📋 สถานะปัจจุบัน
- **Project Name:** QR Code Ordering System (Table-based)
- **Phase:** Phase 2 (Production Hardening & Final Polish)
- **Last Update:** 29 พฤษภาคม 2569
- **Project Directory Structure:**
  - `D:\AI\qr-ordering\` -> โฟลเดอร์เก็บโค้ดระบบโปรเจกต์และคอนฟิกทั้งหมด (มี Git Repository ของโค้ดแยกอยู่ในนี้)
  - `D:\AI\docs\` -> โฟลเดอร์เก็บเอกสารความรู้ ความจำ และประวัติโครงการ (แยกออกเป็นเอกเทศ ไม่ปนกับประวัติ Git ของตัวโค้ด)
  - `D:\AI\GEMINI.md` -> กฎและระเบียบการปฏิบัติตนของ AI ทีมพัฒนา

## ✅ สิ่งที่ทำเสร็จแล้ว
- [x] จัดตั้งทีม Sub-agents (Tech Lead, UI/UX, Backend, Web, Mobile, QA)
- [x] กำหนด Tech Stack มาตรฐาน (Next.js, Flutter, Node.js)
- [x] จัดระเบียบกฎเหล็กของทีมใน `GEMINI.md`
- [x] สร้างฐานข้อมูล SQLite ถาวรและ Migration ระบบข้อมูล
- [x] ติดตั้งระบบความปลอดภัย JWT Authentication สำหรับ Admin
- [x] ติดตั้งระบบ Data Protection (Redacted Logging) สำหรับกรองข้อมูล sensitive (token, password, secret)
- [x] พัฒนาฟีเจอร์ Multi-round Tracking และ Session Guardian
- [x] กู้คืน UI หน้า Admin ให้เป็นเวอร์ชัน Pixel-perfect (Emerald/Rose/Amber)
- [x] แก้ไขปัญหา ReferenceError: logout is not defined ในหน้า Admin
- [x] ตั้งค่าระบบ Testing (Vitest + jsdom) และรันผ่าน 100%
- [x] จัดทำคู่มือการเรียนรู้ WebSocket (docs/web-socket-learning.md) และเพิ่มบทเรียนเรื่อง Variable Naming Mismatch
- [x] จัดทำคู่มือการติดตั้งระบบ Production ด้วย Docker (docs/production-setup-guide.md)
- [x] **[NEW]** ติดตั้งและกำหนดค่า PostgreSQL ใน Docker สำหรับสภาพแวดล้อม Production
- [x] **[NEW]** ตั้งค่า Centralized Environment Variables (.env) ที่ Root Directory
- [x] **[NEW]** ปรับปรุง Server Dockerfile ให้รองรับ Auto-Migration เมื่อเริ่ม Container
- [x] **[NEW]** เพิ่มระบบ Healthcheck ให้ Server รอจนกระทั่ง PostgreSQL พร้อมรันเพื่อป้องกันปัญหา ECONNREFUSED
- [x] **[NEW]** อัปเดต Dockerfile ให้ COPY โฟลเดอร์ `seeds/` ไปยัง Container และรัน Seed ข้อมูลสำเร็จ
- [x] **[NEW]** แก้ไขปัญหา TypeScript Type Mismatch ในหน้า Admin Dashboard (`adminTokenRef.current` null check)
- [x] **[NEW]** เปลี่ยนการแจ้งเตือน `alert()` ทั้ง 5 จุดในระบบ Next.js ให้เป็น Toast Notification (พรีเมียมขึ้น)
- [x] **[NEW]** สตาร์ทระบบและรัน Local Dev Server ในโหมดพัฒนา และยืนยันผลการทดสอบผ่าน 100%
- [x] **[NEW]** เปลี่ยนฐานข้อมูล Local Dev Server ในโหมดพัฒนา (`development`) จาก SQLite3 ชี้ไปเชื่อมต่อ PostgreSQL ใน Docker (localhost พอร์ต `5432`) ทำให้ใช้ PostgreSQL แบบ 100% ในทุกระดับพัฒนา
- [x] **[NEW]** พัฒนาระบบปิดโต๊ะ/เช็คบิล (Close Table & Billing Flow) ให้สมบูรณ์แบบทั้ง Flow:
  - **ฝั่งลูกค้า:** เพิ่มหน้าจอสรุปยอดเรียกเก็บเงิน (Bill Summary Screen) และหน้าจอชำระเงินสำเร็จ (Payment Complete Screen) หลังแอดมินปิดโต๊ะ ป้องกันการสั่งอาหารเพิ่ม
  - **ฝั่งแอดมิน:** เพิ่มระบบแจ้งเตือนแบบ Banner "Billing Requested" และปุ่มยืนยันชำระเงินสี Amber บน Dashboard เมื่อลูกค้าขอเช็คบิล รวมถึงเปลี่ยนการยืนยันปิดโต๊ะจากกล่อง `confirm()` ของเบราว์เซอร์เดิม ให้เป็น **Custom Confirmation Modal** หรูหราเข้ากับธีม
  - **Real-time Sync:** เชื่อมโยงระบบด้วย Socket.io ทำให้หน้าจอลูกค้าเปลี่ยนตามสถานะการปิดโต๊ะแบบ Real-time โดยไม่ต้อง reload หน้าเว็บ
- [x] **[NEW]** แก้ไขปัญหา API Error 429: ปรับเพิ่มขีดจำกัดความถี่การส่งคำขอ (Rate Limit) ของ `apiLimiter` บน Backend จาก 100 เป็น 2000 requests ต่อ 15 นาที เพื่อแก้ปัญหา request เกินโควตาจากการพัฒนา และรองรับระบบเครือข่าย NAT (ที่ลูกค้าทั้งร้านแชร์ Public IP Wi-Fi เดียวกัน)
- [x] **[NEW]** ปรับปรุงโครงสร้าง Request ฝั่งลูกค้า: นำคำสั่ง `fetchOrderStatus()` ออกจากฟังก์ชัน `validateSession()` เพื่อไม่ให้เกิดการส่งคำขอ GET `/orders` ซ้ำซ้อน 2 รอบโดยไม่จำเป็นในทุกการอัปเดตสถานะผ่าน Socket.io
- [x] **[NEW]** แก้ไขปัญหา Validation failed ตอนกดสั่งซื้ออาหาร: ปรับจูนในฟังก์ชัน `placeOrder` ของฝั่งลูกค้า ให้ทำการคลีน Payload โดยคัดเลือกเฉพาะฟิลด์ที่ Zod Schema ฝั่ง Backend ต้องการ และทำการแปลงค่าราคาสินค้า (`price`) ให้เป็น `number` เสมอ เพื่อแก้ปัญหาความแตกต่างของ PostgreSQL Driver ที่ดึงค่า Decimal มาเป็น String
- [x] **[NEW]** Security Hardening (Password Hashing & Rate Limiting):
  - ติดตั้ง `bcrypt` และ `express-rate-limit` ใน `apps/server` (Packages `bcrypt` และ `express-rate-limit` ถูกติดตั้งและใช้งานใน `apps/server` แล้ว)
  - อัปเกรดระบบ Login ให้ใช้ Password Hashing (ระบบ Admin Login มีการใช้ `bcrypt.compare` สำหรับรหัสผ่านแอดมินอยู่แล้ว และมี `generateHash.ts` สำหรับสร้าง Hash สำหรับ `ADMIN_PASSWORD_HASH` ใน `.env`)
  - มีการใช้งาน `express-rate-limit` สำหรับ API และ Admin Login เพื่อป้องกัน Brute-force attacks
  - ข้อควรระวัง: `ADMIN_PASSWORD_HASH` ในไฟล์ `.env` ควรเป็นรหัสผ่านที่แฮชแล้วเท่านั้น

- [x] **[NEW] Custom Security Headers:** เพิ่ม Custom Middleware ปิดใช้ header `X-Powered-By` และตั้งค่า Security Headers เช่น `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection`, `Referrer-Policy`, และ `Content-Security-Policy: default-src 'none'` เพื่อป้องกันความเสี่ยงด้านความปลอดภัย
- [x] **[NEW] Secure Socket.io CORS:** อัปเดต CORS ของ Socket.io ใน Backend ให้ดึงค่ามาจาก `FRONTEND_URL` (.env) โดยตรง ป้องกัน Unauthorized origin
- [x] **[NEW] Secure Database Port Restriction:** จำกัดการ expose พอร์ต PostgreSQL ใน `docker-compose.yml` ให้เชื่อมต่อผ่าน `127.0.0.1:5432` เท่านั้น เพื่อความปลอดภัยของข้อมูล และช่วยให้ Unit Tests บน local host รันผ่านได้ปกติ
- [x] **[NEW] Database Integration Test Fixes:** แก้ไข `api.test.ts` ให้สร้าง Category และ Menu ชั่วคราว (เพื่อผ่าน FK Constraints ของ Postgres) และแก้ไข assertion ของ API Session Validation พร้อมตั้งค่า cleanup ใน `beforeEach` ส่งผลให้เทสต์ผ่าน 100% (10/10 passed)
- [x] **[NEW] SQLite Database Clean Up:** หยุดโปรแกรม DBeaver/Node process ที่ถือครองและล็อกไฟล์บนเครื่อง host เพื่อลบไฟล์ `apps/server/dev.sqlite3` ที่ไม่ได้ใช้งานแล้วออกอย่างสมบูรณ์แบบร้อยเปอร์เซ็นต์
- [x] **[NEW] Git & Ignored Configuration:** อัปเดต `.gitignore` เพื่อกรองโฟลเดอร์เครื่องมือ `.antigravitycli/` เพิ่มเติมเพื่อรักษาความสะอาดของ repository
- [x] **[NEW] Complete Test Verification:** ยืนยันความสมบูรณ์ในการรัน Unit Tests โดยฝั่ง Server ผ่านฉลุย 10/10 tests และฝั่ง Web (Frontend) ผ่านฉลุย 7/7 tests บนฐานข้อมูล PostgreSQL เรียบร้อย 100%
- [x] **[NEW] Directory Restructuring:** จัดระเบียบโฟลเดอร์โครงการใหม่ โดยย้ายโค้ดทั้งหมด (`apps/`, `docker-compose.yml`, `.env`, `.gitignore`, ฯลฯ) ไปรวมอยู่ในโฟลเดอร์โครงการ `D:\AI\qr-ordering` ส่วนเอกสารความทรงจำคงไว้ที่ `D:\AI\docs` เพื่อแยกขอบเขตของโค้ดโปรเจกต์และประวัติ Git ออกจากกันอย่างเป็นสัดส่วน
- [x] **[NEW] Re-initialize Clean Git Repository:** ยกเลิกการใช้งาน Git repository เก่าของ root ที่ปะปนกับประวัติภายนอก และเริ่มต้นใหม่ด้วยคำสั่ง `git init` ในโฟลเดอร์ `D:\AI\qr-ordering` เปลี่ยนชื่อ branch หลักเป็น `main` และบันทึก Initial Commit อย่างเป็นทางการ
- [x] **[NEW] Redundant Files Cleanup:** ค้นหาและลบไฟล์ที่ไม่จำเป็นและไม่ได้ใช้งานแล้วออกถาวร เช่น รูปภาพ หน้าล็อกเก่า ไฟล์ prototype โค้ด HTML ตัวอย่าง สคริปต์กรอง logs ที่ไม่ได้ใช้ และโฟลเดอร์ build-cache ของทั้งฝั่งเว็บและฝั่งเซิร์ฟเวอร์ก่อนเริ่มทำการ Commit เพื่อรับประกันความสะอาด 100%

## 🏗️ สิ่งที่กำลังทำ
- ให้คำแนะนำแก่ผู้ใช้ในการผูก remote repository ใหม่ที่สอดคล้องกับชื่อโครงการและทำการ Push โค้ดทั้งหมดขึ้น GitHub

## 📝 บันทึกสำคัญ
- **Security:** ใช้ JWT ร่วมกับ Bearer Token และดักจับ Error 401/403 เพื่อ Auto-Redirect
- **UI Standard:** ห้ามใช้อิโมจิในโค้ด (No-Emoji Policy)
- **Testing:** ทุกการแก้ไขต้องมี Unit Test รองรับและรันผ่านก่อนส่งงาน
- **WebSocket:** ให้เชื่อมต่อผ่าน `127.0.0.1:4000` เท่านั้นเมื่อรันบน Windows เพื่อความเสถียร
- **Git Branch:** โปรเจกต์นี้เปลี่ยนมาใช้สาขาหลักชื่อ `main` ในโฟลเดอร์ `qr-ordering` เป็นค่าเริ่มต้น
