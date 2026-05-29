import http from 'http';
import { Server } from 'socket.io';
import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import knex from 'knex';
import jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import rateLimit from 'express-rate-limit';
import authMiddleware from './authMiddleware';
import { orderSchema } from './schemas';
import logger from './logger';

const knexConfig = require('../knexfile');

dotenv.config();

const environment = process.env.NODE_ENV || 'development';
const config = knexConfig[environment] || knexConfig.development;
const db = knex(config);
export const app = express();

app.disable('x-powered-by');

// Security headers middleware
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'no-referrer');
  res.setHeader('Content-Security-Policy', "default-src 'none'; frame-ancestors 'none';");
  next();
});

const server = http.createServer(app);
const port = process.env.PORT || 4000;

const allowedOrigins = process.env.FRONTEND_URL 
  ? process.env.FRONTEND_URL.split(',') 
  : ["http://localhost:3005", "http://127.0.0.1:3005"];

// Initialize Socket.io with secure origins from environment configuration
export const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);
  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  message: 'Too many requests from this IP, please try again after 15 minutes',
});
app.use('/api/', apiLimiter);

const apiRouter = express.Router();

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many login attempts, please try again after 15 minutes',
});

// --- 1. Admin & Auth ---
apiRouter.post('/admin/login', loginLimiter, async (req: Request, res: Response) => {
  const { password } = req.body;
  const adminPasswordHash = process.env.ADMIN_PASSWORD_HASH;

  if (!adminPasswordHash) {
    logger.error('ADMIN_PASSWORD_HASH is not set.');
    return res.status(500).json({ message: 'Server configuration error' });
  }

  const isPasswordValid = await bcrypt.compare(password, adminPasswordHash);

  if (isPasswordValid) {
    const token = jwt.sign({ isAdmin: true }, process.env.JWT_SECRET as string, { expiresIn: '24h' });
    res.json({ success: true, token });
  } else {
    res.status(401).json({ message: 'Invalid password' });
  }
});

const adminRouter = express.Router();
adminRouter.use(authMiddleware);

adminRouter.post('/tables/:id/open', async (req: Request, res: Response) => {
  const { id } = req.params;
  const token = require('crypto').randomBytes(16).toString('hex');
  try {
    await db('table_sessions').where({ table_id: id, status: 'active' }).update({ status: 'completed' });
    await db('table_sessions').insert({
      id: require('crypto').randomUUID(),
      table_id: id,
      token: token,
      status: 'active'
    });
    io.emit('order_updated', { table_id: id });
    res.json({ table_id: id, token });
  } catch (err) {
    res.status(500).json({ message: 'Error opening table' });
  }
});

adminRouter.post('/tables/:id/close', async (req: Request, res: Response) => {
  const { id } = req.params;
  const trx = await db.transaction();
  try {
    const activeSession = await trx('table_sessions')
      .where({ table_id: id })
      .whereIn('status', ['active', 'calling_bill'])
      .first();

    if (!activeSession) {
      await trx.rollback();
      return res.status(404).json({ message: 'No active session' });
    }

    await trx('table_sessions').where({ id: activeSession.id }).update({ status: 'completed', is_calling_bill: false });
    await trx('orders').where({ session_token: activeSession.token }).update({ status: 'paid' });
    await trx.commit();
    io.emit('order_updated', { token: activeSession.token, table_id: id });
    res.json({ message: 'Table closed' });
  } catch (err) {
    await trx.rollback();
    res.status(500).json({ message: 'Error closing table' });
  }
});

adminRouter.get('/orders', async (req: Request, res: Response) => {
  try {
    const orders = await db('orders').select('*').orderBy('created_at', 'desc');
    const ordersWithItems = await Promise.all(orders.map(async (order) => {
      const items = await db('order_items')
        .select('order_items.*', 'menus.name_th')
        .leftJoin('menus', 'order_items.menu_id', 'menus.id')
        .where('order_id', order.id);
      return {
        ...order,
        items: items.map(i => ({ ...i, nameTh: i.name_th, price: i.price_at_order, selectedOptions: i.notes && i.notes.startsWith('{') ? JSON.parse(i.notes) : null }))
      };
    }));
    res.json(ordersWithItems);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching orders' });
  }
});

adminRouter.get('/tables/status', async (req: Request, res: Response) => {
  try {
    const tables = await db('tables').select('*');
    const tableStatuses = await Promise.all(tables.map(async (table) => {
      const activeSession = await db('table_sessions').where({ table_id: table.id }).whereIn('status', ['active', 'calling_bill']).first();
      let totalAmount = 0;
      if (activeSession) {
        const result = await db('orders').where({ session_token: activeSession.token }).whereNot('status', 'paid').sum('total_price as total');
        totalAmount = result[0].total || 0;
      }
      return { id: table.id, name: table.name, status: activeSession ? activeSession.status : 'available', is_calling_bill: activeSession ? !!activeSession.is_calling_bill : false, current_session: activeSession ? activeSession.token : null, total_amount: totalAmount };
    }));
    res.json(tableStatuses);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching status' });
  }
});

adminRouter.patch('/orders/:id/status', async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status } = req.body;
  try {
    await db('orders').where('id', id).update({ status });
    const updatedOrder = await db('orders').where({ id }).first();
    io.emit('order_updated', { token: updatedOrder.session_token, ...updatedOrder });
    res.json({ message: 'Status updated' });
  } catch (err) {
    res.status(500).json({ message: 'Error updating status' });
  }
});

apiRouter.use('/admin', adminRouter);

// --- 2. Customer API ---
apiRouter.get('/menu', async (req: Request, res: Response) => {
  try {
    const menus = await db('menus').select('menus.*', 'categories.name as category').leftJoin('categories', 'menus.category_id', 'categories.id').where('is_available', true);
    res.json(menus.map(m => ({ ...m, image: m.image_url, nameTh: m.name_th, options: m.options ? JSON.parse(m.options) : [] })));
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

apiRouter.post('/orders', async (req: Request, res: Response) => {
  try {
    const { table_id, token, items, total_price } = orderSchema.parse(req.body);
    const session = await db('table_sessions').where({ table_id, token }).whereIn('status', ['active', 'calling_bill']).first();
    if (!session) return res.status(403).json({ message: 'Invalid session' });

    const trx = await db.transaction();
    try {
      const orderId = require('crypto').randomUUID();
      await trx('orders').insert({ id: orderId, table_id, session_token: token, total_price, status: 'pending' });
      const orderItems = items.map((item: any) => ({
        id: require('crypto').randomUUID(), order_id: orderId, menu_id: item.id, quantity: item.quantity || 1, price_at_order: item.price, notes: item.selectedOptions ? JSON.stringify(item.selectedOptions) : ''
      }));
      await trx('order_items').insert(orderItems);
      await trx.commit();

      const newOrder = await db('orders').where({ id: orderId }).first();
      io.emit('new_order', newOrder);
      res.status(201).json({ id: orderId, status: 'pending' });
    } catch (err) {
      await trx.rollback();
      res.status(500).json({ message: 'Error' });
    }
  } catch (error: any) {
    res.status(400).json({ message: 'Validation failed' });
  }
});

apiRouter.get('/orders', async (req: Request, res: Response) => {
  const { table_id, token } = req.query;
  try {
    const items = await db('order_items').select('order_items.*', 'menus.name_th as nameTh', 'orders.status as status', 'orders.created_at as order_time').join('orders', 'order_items.order_id', 'orders.id').join('menus', 'order_items.menu_id', 'menus.id').where({ 'orders.table_id': table_id, 'orders.session_token': token }).orderBy('orders.created_at', 'desc');
    res.json(items.map(item => ({ ...item, price: item.price_at_order, selectedOptions: item.notes && (item.notes.startsWith('{') || item.notes.startsWith('[')) ? JSON.parse(item.notes) : [] })));
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

apiRouter.post('/orders/call-bill', async (req: Request, res: Response) => {
  const { table_id, token } = req.body;
  try {
    await db('table_sessions').where({ table_id, token, status: 'active' }).update({ is_calling_bill: true, status: 'calling_bill' });
    io.emit('order_updated', { token, table_id });
    res.json({ message: 'Bill requested' });
  } catch (err) {
    res.status(500).json({ message: 'Error' });
  }
});

apiRouter.get('/sessions/validate', async (req: Request, res: Response) => {
  const { table_id, token } = req.query;
  if (!table_id || !token) {
    return res.status(400).json({ valid: false, message: 'Missing table_id or token.' });
  }
  try {
    const session = await db('table_sessions').where({ table_id, token }).whereIn('status', ['active', 'calling_bill']).first();
    if (session) {
      res.json({ valid: true, status: session.status, message: 'Session is valid and active.' });
    } else {
      res.json({ valid: false, message: 'Invalid session or session not active.' });
    }
  } catch (err) {
    res.status(500).json({ valid: false, message: 'Internal server error.' });
  }
});

app.use('/api', apiRouter);

app.get('/health', (req, res) => res.send('API is running...'));

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  logger.error(err.message);
  res.status(500).json({ message: 'Internal Server Error' });
});

if (process.env.NODE_ENV !== 'test') {
  server.listen(port, () => {
    console.log(`Server is running at http://127.0.0.1:${port}`);
    logger.info(`Server started on port ${port}`);
  });
}
