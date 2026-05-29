# API Specification - QR Code Ordering System

Base URL: `/api`

## 🔑 Authentication
- `POST /admin/login`: เข้าสู่ระบบ Admin
  - Body: `{ "password": "..." }`
  - Response: `{ "success": true, "token": "..." }`

## 🛒 Customer API (Public/QR-validated)

### Menus
- `GET /menu`: ดึงรายการอาหารและหมวดหมู่ทั้งหมด
- `GET /menu/{id}`: ดูรายละเอียดเมนูเฉพาะจาน

### Orders
- `POST /orders`: ส่งรายการสั่งอาหาร
  - Body: `{ "table_id": "...", "token": "...", "items": [...], "total_price": ... }`
  - **Validation:** ตรวจสอบ `token` ที่ถูกต้อง, `total_price > 0`, และรายการอาหารต้องไม่เป็นค่าลบ
- `GET /orders`: ดูสถานะอาหารที่สั่งไปแล้ว (Query params: `table_id`, `token`)
- `POST /orders/call-bill`: แจ้งพนักงานว่าต้องการเช็คบิล (Body: `table_id`, `token`)

## ⚙️ Admin API (Authenticated)

### Menu Management
- `GET /admin/menu`: รายการเมนูทั้งหมด (รวมเมนูที่ปิดการใช้งาน)
- `POST /admin/menu`: เพิ่มเมนูใหม่
- `PATCH /admin/menu/{id}`: แก้ไขเมนูหรือราคา
- `DELETE /admin/menu/{id}`: ลบเมนู

### Table & Order Management
- `GET /admin/tables/status`: ดึงสถานะโต๊ะทั้งหมดพร้อมสรุปยอดของ session ปัจจุบัน
- `POST /admin/tables/{id}/open`: เปิดโต๊ะใหม่และสร้าง QR Token
- `POST /admin/tables/{id}/close`: ปิดโต๊ะ (Check Bill)
  - เปลี่ยนสถานะโต๊ะเป็น 'available' (เคลียร์ session)
  - เปลี่ยนสถานะออเดอร์ในเซสชันนั้นเป็น 'paid'
- `GET /admin/orders`: ดูออเดอร์ที่ค้างอยู่ทั้งหมด (Live Feed)
- `PATCH /admin/orders/{id}/status`: อัปเดตสถานะออเดอร์ (เช่น 'cooking', 'served')
