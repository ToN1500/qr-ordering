# WebSocket Learning Guide: Real-time Communication in Modern Web Apps

คู่มือการเรียนรู้ฉบับนี้จัดทำขึ้นเพื่ออธิบายหลักการและการนำ WebSocket มาใช้งานจริงในโปรเจกต์ (Software House Edition) โดยเน้นไปที่ความแตกต่างระหว่าง Polling และ WebSocket รวมถึงการวางโครงสร้างระบบทั้ง Backend และ Frontend

---

## 1. Polling vs WebSocket: ทำไมเราถึงเลิกใช้ Polling?

ในการทำระบบ Real-time (เช่น การแจ้งเตือนออเดอร์ใหม่) มี 2 วิธีหลักที่นิยมกัน:

### ❌ Polling (แบบเดิม)
คือการที่ Frontend ส่ง Request ไปถาม Backend ทุกๆ X วินาที ว่า "มีข้อมูลใหม่ไหม?"
- **ข้อเสีย:** เปลืองทรัพยากร Server (High Overhead), ข้อมูลไม่ Real-time จริง (มี Delay ตามรอบเวลา), และเปลือง Bandwidth โดยใช่เหตุถ้าไม่มีข้อมูลใหม่

### ✅ WebSocket (แบบใหม่)
คือการสร้าง "ท่อ" เชื่อมต่อทิ้งไว้ระหว่าง Client และ Server เมื่อมีข้อมูลใหม่ Server สามารถ "ผลัก" (Push) ข้อมูลมาให้ Client ได้ทันที
- **ข้อดี:** Real-time 100% (Latency ต่ำ), ประหยัดทรัพยากรมากกว่าในระยะยาว (ลด HTTP Overhead), รองรับการสื่อสารแบบ Two-way (Full-duplex)

---

## 2. โครงสร้างหลังบ้าน (Server Wrapper)

ในโปรเจกต์ Node.js (TypeScript) ของเรา เราใช้ **Socket.io** ซึ่งเป็น Library ที่ครอบ WebSocket อีกทีเพื่อความง่ายและมีความสามารถในการ Fallback ถ้า Browser ไม่รองรับ

### การตั้งค่าเริ่มต้น (Setup)
เราต้องรัน Socket.io ร่วมกับ HTTP Server ของ Express:

```typescript
import http from 'http';
import { Server } from 'socket.io';
import express from 'express';

const app = express();
const server = http.createServer(app);

// Initialize Socket.io
export const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"], // กำหนดสิทธิ์ให้ Frontend เข้าถึงได้
    methods: ["GET", "POST"]
  }
});

server.listen(4000, () => {
  console.log('Server is running on port 4000');
});
```

### การส่งข้อมูล (Emitting Events)
เมื่อมีการเปลี่ยนแปลงข้อมูลใน Database (เช่น มีออเดอร์ใหม่) เราจะสั่งให้ Server กระจายข่าวผ่าน `io.emit()`:

```typescript
// ตัวอย่าง: เมื่อลูกค้าสั่งอาหารเสร็จ
adminRouter.post('/orders', async (req, res) => {
  // ... บันทึกลงฐานข้อมูล ...
  
  // แจ้งเตือนหน้าจอ Admin ทันที
  io.emit('new_order', { orderId: '123', table: 'T1' });
  
  res.json({ success: true });
});
```

---

## 3. โครงสร้างหน้าบ้าน (React Hooks + Socket Client)

ในฝั่ง Next.js (React) เราจะใช้ `useEffect` เพื่อจัดการ Lifecycle ของการเชื่อมต่อ

### การเชื่อมต่อและรับข้อมูล (Client Implementation)

```tsx
'use client';

import { useEffect } from 'react';
import { io } from 'socket.io-client';

export default function OrderPage() {
  useEffect(() => {
    // 1. สร้างการเชื่อมต่อ
    const socket = io('http://localhost:4000');

    // 2. ฟังเหตุการณ์ (Event Listener)
    socket.on('new_order', (data) => {
      console.log('รับข้อมูลออเดอร์ใหม่:', data);
      // ตรงนี้สามารถสั่งให้ Fetch ข้อมูลใหม่ หรืออัปเดต State ใน React ได้เลย
    });

    // 3. การคืนทรัพยากร (Cleanup)
    // สำคัญมาก: ต้อง disconnect เมื่อ Component ถูกถอดออก เพื่อป้องกัน Memory Leak
    return () => {
      socket.disconnect();
    };
  }, []);

  return <div>หน้าจอรับออเดอร์ (Real-time)</div>;
}
```

---

## 4. ข้อควรระวัง (Senior Checklist)

1.  **Cleanup Function:** ทุกครั้งที่ใช้ `socket.on` ใน React ต้องมี `socket.disconnect()` หรือ `socket.off()` ใน Cleanup function ของ `useEffect` เสมอ
2.  **CORS Policy:** อย่าลืมกำหนด `origin` ในฝั่ง Server ให้ตรงกับ URL ของ Frontend ไม่งั้น Browser จะบล็อกการเชื่อมต่อ
3.  **Authentication:** สำหรับระบบที่ต้องการความปลอดภัย ควรส่ง Token ไปตอน Handshake (ขั้นเริ่มเชื่อมต่อ) เพื่อตรวจสอบสิทธิ์
4.  **Reconnection:** Socket.io มีระบบต่อสายให้อัตโนมัติ (Auto-reconnect) อยู่แล้ว แต่ควรจัดการ UI ให้ User ทราบหากเน็ตหลุด (เช่น แสดงสัญลักษณ์ Offline)
5.  **Variable Naming Mismatch (Common Pitfall):** หนึ่งในปัญหาที่พบบ่อยที่สุดคือการตั้งชื่อ Key ใน Object ไม่ตรงกันระหว่างฝั่งส่ง (Emitter) และฝั่งรับ (Listener)
    *   **ตัวอย่าง:** Backend ส่ง `{ session_id: 123 }` แต่ Frontend พยายามอ่าน `data.sessionId`
    *   **ผลลัพธ์:** การเชื่อมต่อทำงานปกติ (ไม่มี Error ใน Console) แต่ข้อมูลใน UI ไม่เปลี่ยนหรือเป็น `undefined`
    *   **แนวทางแก้ไข:** ควรใช้ TypeScript Interface ร่วมกันทั้งสองฝั่ง หรือมีการทำ API/Socket Contract ที่ชัดเจน และยึดมาตรฐานการตั้งชื่อแบบเดียวกัน (เช่น camelCase เสมอ)

---

### สรุป (Key Takeaway)
WebSocket เปลี่ยนจากระบบ "ถาม-ตอบ" (Request-Response) มาเป็นระบบ "กระซิบข่าว" (Event-driven) ช่วยให้ User Experience ดีขึ้นอย่างมากในการทำ Dashboard หรือระบบที่ต้องการความสดใหม่ของข้อมูลตลอดเวลา

---
*จัดทำโดย: Technical Lead*
