import { z } from 'zod';

export const orderItemSchema = z.object({
  id: z.string(), // menu_id
  quantity: z.number().int().nonnegative().optional(),
  price: z.number().nonnegative(),
  selectedOptions: z.record(z.string(), z.any()).optional(), // ต้องมี key เป็น string และ value เป็น any
});

export const orderSchema = z.object({
  table_id: z.string().min(1), // table number
  token: z.string().min(1), // session token
  items: z.array(orderItemSchema).min(1),
  total_price: z.number().nonnegative(),
});
