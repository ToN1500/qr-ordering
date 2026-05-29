# Retrospective: Phase 1 (Foundation & Core Features)
**วันที่:** 16 พฤษภาคม 2569
**โดย:** Tech Lead

## 🌟 สิ่งที่ทำได้ดี (What went well)
- **Multi-Agent Efficiency:** ทีมงาน (Backend, Web, QA) สามารถทำงานสอดประสานกันได้ดี โดยมีการใช้ `docs/project-memory.md` เป็นจุดเชื่อมโยงข้อมูล ทำให้งานไม่หลุด
- **Test-Driven Foundation:** ระบบมี Unit Test และ Integration Test ที่ครอบคลุม Business Logic สำคัญ (Ordering, Auth) ทำให้การ Refactor UI ทำได้อย่างมั่นใจ
- **Security First:** มีการนำระบบ Redacted Logging และ JWT มาใช้ตั้งแต่เนิ่นๆ ช่วยลดความเสี่ยงเรื่องข้อมูลรั่วไหล
- **UI Recovery:** สามารถกู้คืน Admin Dashboard ให้กลับมาเป็น Pixel-perfect ตามที่ออกแบบไว้ได้สำเร็จ

## ⚠️ ปัญหาที่พบ (Challenges)
- **Server Listener in Tests:** พบปัญหาเล็กน้อยในการรัน Test เนื่องจาก `app.listen()` อยู่ในไฟล์เดียวกับ Logic ของ Express ทำให้เกิด Port Conflict ได้ง่าย
- **SQLite Limitations:** ข้อจำกัดของ SQLite ในเรื่อง Foreign Key (ต้องเปิด manual) ทำให้การทดสอบความสมบูรณ์ของข้อมูล (Data Integrity) ในระดับ DB ยังไม่เต็มร้อย
- **Admin UI Errors:** มีปัญหา ReferenceError เล็กน้อยในช่วงแรกจากการ Refactor โค้ดที่ซับซ้อน

## 💡 สิ่งที่ได้เรียนรู้ (Learnings)
- การแยก `server.ts` ออกจาก `app.ts` เป็นแนวทางปฏิบัติที่ดี (Best Practice) ที่ควรทำตั้งแต่เริ่ม
- การมี `AGENTS.md` และ `CLAUDE.md` ในแต่ละ Sub-directory ช่วยควบคุมพฤติกรรมของเอเจนต์ได้แม่นยำขึ้น
- การทำ Pixel-perfect UI ใน Next.js ต้องระวังเรื่อง hydration และ state management ให้ดี

## 🚀 แนวทางการพัฒนาต่อ (Next Steps)
- มุ่งหน้าสู่ Production Hardening (Sprint 1)
- ย้ายไปใช้ PostgreSQL เพื่อรองรับงานหนักและความถูกต้องของข้อมูลระดับสูง
- พัฒนาระบบ Error Boundary เพื่อให้ App ไม่ล่มเมื่อเกิดความผิดพลาดที่ไม่คาดคิด
