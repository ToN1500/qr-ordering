import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { app } from './index';
import knex from 'knex';
const knexConfig = require('../knexfile');

const db = knex(knexConfig.development);

describe('Backend API Integration Tests (Real App)', () => {
  beforeEach(async () => {
    // Clear test-specific data to avoid unique constraint violations
    await db('table_sessions').whereIn('token', ['test-token-123', 'valid-token-456']).del();
  });

  it('GET /api/menu should return menu items from DB', async () => {
    const res = await request(app).get('/api/menu');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/orders should record order in DB with valid token', async () => {
    // 1. Create an active session, temp category, and temp menu first
    const table_id = '01';
    const token = 'test-token-123';
    const tempCatId = require('crypto').randomUUID();
    const tempMenuId = require('crypto').randomUUID();

    try {
      await db('categories').insert({
        id: tempCatId,
        name: 'Temp Test Cat',
        display_order: 99
      });

      await db('menus').insert({
        id: tempMenuId,
        category_id: tempCatId,
        name: 'Temp Test Menu',
        name_th: 'เมนูทดสอบชั่วคราว',
        price: 100,
        is_available: true
      });

      await db('table_sessions').insert({
        id: require('crypto').randomUUID(),
        table_id,
        token,
        status: 'active'
      });

      const newOrder = { 
        table_id, 
        token,
        items: [{ id: tempMenuId, price: 100 }], 
        total_price: 100 
      };
      
      const res = await request(app)
        .post('/api/orders')
        .send(newOrder);
      
      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body.status).toBe('pending');
    } finally {
      // 2. Cleanup to ensure database remains pristine
      await db('order_items').where({ menu_id: tempMenuId }).del();
      await db('orders').where({ session_token: token }).del();
      await db('table_sessions').where({ token }).del();
      await db('menus').where({ id: tempMenuId }).del();
      await db('categories').where({ id: tempCatId }).del();
    }
  });

  describe('GET /api/sessions/validate', () => {
    it('should return valid: true for an active session', async () => {
      const table_id = '02';
      const token = 'valid-token-456';
      
      try {
        await db('table_sessions').insert({
          id: require('crypto').randomUUID(),
          table_id,
          token,
          status: 'active'
        });

        const res = await request(app).get(`/api/sessions/validate?table_id=${table_id}&token=${token}`);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ valid: true, status: 'active', message: 'Session is valid and active.' });
      } finally {
        await db('table_sessions').where({ token }).del();
      }
    });

    it('should return valid: false for an invalid token', async () => {
      const res = await request(app).get('/api/sessions/validate?table_id=09&token=invalid-token');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ valid: false, message: 'Invalid session or session not active.' });
    });

    it('should return 400 if table_id is missing', async () => {
      const res = await request(app).get('/api/sessions/validate?token=some-token');
      expect(res.status).toBe(400);
      expect(res.body.valid).toBe(false);
    });
  });
});
