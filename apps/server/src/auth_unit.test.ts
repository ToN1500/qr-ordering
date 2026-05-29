import { describe, it, expect, beforeEach, vi } from 'vitest';
import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import authMiddleware from './authMiddleware';

// สร้าง Mock App เฉพาะกิจเพื่อทดสอบ Middleware โดยตรง (Unit Test แท้ๆ)
const testApp = express();
testApp.use(express.json());

// Mock Secret สำหรับเทส
process.env.JWT_SECRET = 'test_secret';

// Endpoint สำหรับทดสอบ Middleware
testApp.get('/test-auth', authMiddleware, (req, res) => {
  res.status(200).json({ message: 'Success', user: (req as any).user });
});

describe('Authentication Middleware (Unit Tests)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should allow access with a valid JWT token', async () => {
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET as string);
    
    const res = await request(testApp)
      .get('/test-auth')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.message).toBe('Success');
    expect(res.body.user.isAdmin).toBe(true);
  });

  it('should deny access if no token is provided', async () => {
    const res = await request(testApp).get('/test-auth');
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('No token provided');
  });

  it('should deny access if token format is invalid', async () => {
    const res = await request(testApp)
      .get('/test-auth')
      .set('Authorization', 'InvalidFormat 123');
    
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('token format is incorrect');
  });

  it('should deny access if token is invalid/tampered', async () => {
    const res = await request(testApp)
      .get('/test-auth')
      .set('Authorization', 'Bearer invalid-token-string');
    
    expect(res.status).toBe(403);
    expect(res.body.message).toContain('Forbidden: Invalid token');
  });

  it('should deny access if token is expired', async () => {
    // สร้าง token ที่หมดอายุแล้ว
    const expiredToken = jwt.sign(
      { isAdmin: true }, 
      process.env.JWT_SECRET as string, 
      { expiresIn: '0s' }
    );

    // รอ 1 วินาทีเพื่อให้แน่ใจว่าหมดอายุจริง
    await new Promise(resolve => setTimeout(resolve, 1000));

    const res = await request(testApp)
      .get('/test-auth')
      .set('Authorization', `Bearer ${expiredToken}`);
    
    expect(res.status).toBe(401);
    expect(res.body.message).toContain('Token expired');
  });
});
