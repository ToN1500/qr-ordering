# 🏃 Sprint 1: Production Infrastructure & Hardening
**ระยะเวลา:** 16 พฤษภาคม - 23 พฤษภาคม

## 🎯 เป้าหมาย (Sprint Goals)
ทำให้ระบบมีความเสถียรระดับสากลและพร้อมสำหรับ Deployment บน Server จริง

## 📝 รายการงาน (Tasks)
1. **Infrastructure:** ย้ายฐานข้อมูลสู่ PostgreSQL (Dockerized) - `@tech-lead`
2. **Security:** เพิ่มระบบ Hash Password และ Rate Limiter (อัปเกรดจาก Basic Auth) - `@backend-dev`
3. **UX:** เปลี่ยน alert() เป็น Toast Notification ทั้งหมด - `@web-dev`
4. **Validation:** ทำ Stress Test เบื้องต้น - `@qa-tester`

## ✅ Definition of Done (DoD)
- โค้ดผ่านการรัน `npm run lint` และ `npm test` 100%
- ผ่านการ Audit โดย `@security-auditor`
- บันทึกประวัติใน `docs/milestones/`
