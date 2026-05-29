# Production Setup Guide (Docker)

คู่มือสำหรับการติดตั้งและรันระบบ QR Ordering ในสภาพแวดล้อม Production ด้วย Docker

---

## 🛠️ ความต้องการของระบบ (Prerequisites)
- [Docker Engine](https://www.docker.com/get-started) และ [Docker Compose V2](https://docs.docker.com/compose/install/)
- ไฟล์ `.env` ที่กำหนดค่าตัวแปรสภาพแวดล้อมไว้อย่างถูกต้องที่ Root directory

---

## 🚀 ขั้นตอนการรันระบบ (Quick Start)

### 1. การเตรียมไฟล์ Environment (.env)
สร้างไฟล์ `.env` ที่ root directory เพื่อกำหนดค่าความลับและความปลอดภัย:
```env
# ตั้งค่าความลับระบบ
PORT=4000
JWT_SECRET=your_super_secure_random_jwt_secret_key
ADMIN_PASSWORD_HASH=your_secure_bcrypt_hashed_password

# คอนฟิกฐานข้อมูล PostgreSQL
DB_USER=postgres
DB_PASSWORD=your_secure_database_password
DB_NAME=qr_ordering

# เส้นทางการต่อเชื่อมของระบบภายใน Docker network
DATABASE_URL=postgresql://postgres:your_secure_database_password@db:5432/qr_ordering
```

### 2. การ Build และ Start Services
ใช้คำสั่ง Docker Compose เพื่อสร้างอิมเมจและสตาร์ท Container ทั้งหมด (Database, Backend, Frontend):

```bash
# สั่ง Build และรันในโหมด Background (Detached)
docker compose up -d --build
```

### 3. การทำ Database Migration & Seeding (ครั้งแรก)
* **โครงสร้างตาราง (Migration):** คอนเทนเนอร์ฝั่ง Server ได้รับการอัปเกรดให้ตรวจเช็คฐานข้อมูลและทำ Auto-Migration สร้างตารางตารางต่างๆ โดยอัตโนมัติทันทีที่ Container พร้อมทำงาน
* **ข้อมูลเริ่มต้น (Seeding):** สำหรับการรันครั้งแรก จำเป็นต้องรันคำสั่งด้านล่างเพื่อใส่รายการอาหารเริ่มต้นและโต๊ะ (Tables 1-10) ลงฐานข้อมูล:

```bash
docker compose exec server npx knex seed:run
```

---

## 📊 รายละเอียด Services
| Service | Port (Host) | คำอธิบาย |
| :--- | :--- | :--- |
| **Frontend (Web)** | `3005` | หน้าจอ Next.js 15 สำหรับแอดมินและลูกค้า |
| **Backend (Server)** | `4000` | API Server และ WebSocket |
| **Database (DB)** | `5432` | PostgreSQL Database (สำหรับใช้จัดการร่วมกับ Client) |

---

## 🛡️ มาตรการและการจัดการความปลอดภัย (Security Hardening for Production)

1. **การปกป้องพอร์ตฐานข้อมูล:**
   ในไฟล์ `docker-compose.yml` บริการ `db` มีการเปิดพอร์ต `"5432:5432"` เพื่อความสะดวกในการตรวจสอบผ่าน DBeaver บนเครื่อง Dev 
   * **สำหรับ Production:** แนะนำให้ **ลบหรือปิด (Comment) พอร์ต 5432** ใน `docker-compose.yml` ออก เพื่อป้องกันไม่ให้บุคคลภายนอกเชื่อมต่อเข้ามาที่ฐานข้อมูลโดยตรงจากอินเทอร์เน็ต และให้ติดต่อผ่านเครือข่ายภายใน Docker network หรือใช้ SSH Tunneling เท่านั้น
2. **การป้องกันสิทธิ์ใน Git (.gitignore):**
   * ระบบติดตั้ง `.gitignore` ไว้เรียบร้อยแล้ว ซึ่งจะละเว้นไฟล์ความลับสภาพแวดล้อม (`**/.env`, `**/.env.*`) และฐานข้อมูล SQLite ท้องถิ่นโดยอัตโนมัติ มั่นใจได้ว่าไม่มีความลับใดๆ หลุดเข้าไปใน Repository
3. **มาตรการในแอปพลิเคชัน:**
   * **JWT Expiry & Auth:** ใช้ JWT ในการยืนยันตัวตนแอดมิน (อายุ 24 ชม.) พร้อมรับมือการ Redirect อัตโนมัติเมื่อหมดอายุ
   * **Password Protection:** รหัสผ่านแอดมินเข้ารหัสด้วย `bcrypt` ป้องกันการโจรกรรมฐานข้อมูลแบบ Plaintext
   * **Rate Limiting:** กำหนดสิทธิ์การลองเดารหัสผ่านที่ 5 ครั้งต่อ 15 นาที และขีดจำกัด API ทั่วไปที่ 2000 ครั้งต่อ 15 นาที เพื่อบล็อก Brute-force และ DoS attack
   * **Redacted Logs:** ระบบ Logger จะดักสแกนและปิดบังข้อมูลความลับสำคัญ (เช่น password, jwt token) ไม่ให้ถูกจดจำลงไปใน Logs โดยตรง

---

## 🔍 การตรวจสอบสถานะ (Monitoring)

* **ดู Log ทั้งหมดแบบ Real-time:**
  ```bash
  docker compose logs -f
  ```
* **ดู Log เฉพาะ Backend:**
  ```bash
  docker compose logs -f server
  ```
* **ตรวจสอบความพร้อมของ Container:**
  ```bash
  docker compose ps
  ```

---

## 🛑 การหยุดการทำงาน

```bash
# หยุด Container แต่รักษาข้อมูลในฐานข้อมูลไว้
docker compose down

# หยุด Container และลบข้อมูลในฐานข้อมูลออกทั้งหมด (ระวัง!)
docker compose down -v
```

---
*Technical Lead - Software House Team*
