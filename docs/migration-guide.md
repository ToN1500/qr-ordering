# 🚀 Comprehensive Migration Guide (QR Ordering System)

ใช้คู่มือนี้เมื่อต้องการย้ายโปรเจกต์ไปรันที่เครื่องใหม่ หรือแชร์งานให้เพื่อนร่วมทีม โดยที่ "ประวัติการแชท" และ "ทีม AI" ยังอยู่ครบถ้วน

## 📁 1. ข้อมูลที่ต้อง Copy (The Source)

คุณต้องสำรองข้อมูลจาก 2 แหล่งหลัก:

### ส่วนที่ A: โฟลเดอร์โปรเจกต์ (D:\AI)
- **วิธี:** สั่ง `git push` ขึ้น GitHub หรือก๊อปปี้โฟลเดอร์ `AI/` ทั้งหมด
- **จุดสำคัญ:** ต้องแน่ใจว่าโฟลเดอร์ซ่อน **`.gemini/`** (ใน D:\AI) ติดไปด้วย เพราะในนั้นมีคำสั่งเอเจนต์ (`agents/`) และสกิล (`skills/`) ของทีมงานเราครับ

### ส่วนที่ B: ประวัติการแชท (User Profile)
- **Path:** `C:\Users\uset1\.gemini\`
- **วิธี:** ก๊อปปี้โฟลเดอร์ `.gemini` ทั้งหมดจากเครื่องเดิม ไปวางไว้ที่ Path เดียวกันในเครื่องใหม่ (เปลี่ยนชื่อ username ให้ตรงกับเครื่องใหม่)
- **ข้อมูลข้างใน:**
  - `history/ai`: เก็บประวัติที่เราคุยกันทั้งหมด (ถ้าไม่เอาไป แชทจะว่างเปล่า)
  - `tmp/ai`: เก็บไฟล์ชั่วคราวและผลลัพธ์การรันเครื่องมือต่างๆ

---

## 🚀 2. ขั้นตอนการเริ่มงานในเครื่องใหม่

1. **Install Prerequisites:** ติดตั้ง Docker Desktop และ Node.js (v20+)
2. **Clone/Paste:** วางโฟลเดอร์โปรเจกต์ (D:\AI)
3. **Restore History:** วางโฟลเดอร์ `.gemini` ใน User Profile
4. **Start Chat:** เปิด Terminal ใน `D:\AI` แล้วพิมพ์ `gemini`
5. **Wake up the Team:** พิมพ์ข้อความแรกว่า:
   > *"อ่านไฟล์ `docs/brain-dump-for-new-session.md` แล้วทำหน้าที่ต่อจาก Orchestrator คนเดิมที"*

---

## 🛠️ 3. การรันระบบ (Development Mode)
- **Backend:** `cd apps/server && npm run dev`
- **Frontend:** `cd apps/web && npx next dev -p 3005`
- **Admin Login:** รหัสผ่าน `admin1234` (ค่า Hash อยู่ใน .env)
