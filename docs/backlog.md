# 📋 Product Backlog - QR Code Ordering System

รายการฟีเจอร์และงานทางเทคนิคทั้งหมด แบ่งตามลำดับความสำคัญ (Priority)

## 🔴 Priority 0: Critical (ต้องมีก่อน Production)
- [x] Core Ordering System (QR -> Menu -> Cart -> Order)
- [x] Multi-table Admin Dashboard
- [x] JWT Authentication for Admin
- [x] Dynamic QR Token (Security)
- [x] Real-time updates with Socket.io
- [x] **Production-grade Database Migration (SQLite -> PostgreSQL)**
- [x] **Dockerization (Container for easy deployment)**
- [ ] **Admin Account Management (Create/Update Staff)**

## 🟡 Priority 1: Important (ควรมีเพื่อความสมบูรณ์)
- [ ] **Checkout & Payment Integration (PromptPay QR)**
- [ ] **Menu Management UI (Complete CRUD with image upload)**
- [ ] **Daily Sales Report & Analytics Dashboard**
- [ ] **Auto-print to Kitchen (Integration with Thermal Printers)**

## 🟢 Priority 2: Nice to Have (เพิ่มมูลค่า)
- [ ] Customer Membership & Loyalty Points
- [ ] Multi-language Support (TH/EN)
- [ ] Dark Mode for Admin Dashboard

## 🔄 4. Inbox & Refinement (งานใหม่/งานที่ต้องวิเคราะห์เพิ่ม)
*ส่วนนี้ใช้สำหรับจดบันทึกงานที่เพิ่งนึกได้ หรืองานที่วิเคราะห์พลาดในตอนแรก*
- [ ] **Admin Password Reset:** ระบบสำหรับให้พนักงานกู้คืนรหัสผ่าน (Priority: TBD)
- [ ] **Session Expiry Config:** ตั้งค่าเวลาหมดอายุของโต๊ะได้จากหน้าแอดมิน (Priority: TBD)

## 📢 5. Change Requests (ลูกค้าขอเพิ่ม)
*ส่วนนี้สำหรับบันทึกความต้องการที่เปลี่ยนแปลงจากเดิม*
- (ยังไม่มีรายการ)

## 🛠️ Agile Protocol: How to handle "Missed Tasks"
1. **Detect:** เมื่อเอเจนต์พบงานที่ตกสำรวจ ให้เพิ่มในหัวข้อ 4 ทันที
2. **Analyze:** `@tech-lead` ประเมินความยากและผลกระทบ (Low/Medium/High)
3. **Decide:** Product Owner (คุณ) เลือกว่าจะทำทันที (Sprint นี้) หรือเก็บไว้ก่อน
