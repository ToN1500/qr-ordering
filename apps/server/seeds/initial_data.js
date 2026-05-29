const crypto = require('crypto');

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = async function(knex) {
  // Clear existing data
  await knex('order_items').del();
  await knex('orders').del();
  await knex('menus').del();
  await knex('categories').del();
  await knex('table_sessions').del();
  await knex('tables').del();

  // Insert Tables
  const tables = [];
  for (let i = 1; i <= 10; i++) {
    tables.push({ id: i.toString(), name: `Table ${i}`, capacity: 4 });
  }
  await knex('tables').insert(tables);

  const sigCatId = crypto.randomUUID();
  const pastaCatId = crypto.randomUUID();
  const saladCatId = crypto.randomUUID();

  await knex('categories').insert([
    { id: sigCatId, name: 'Signature', display_order: 1 },
    { id: pastaCatId, name: 'Pasta', display_order: 2 },
    { id: saladCatId, name: 'Salad', display_order: 3 }
  ]);

  await knex('menus').insert([
    {
      id: crypto.randomUUID(),
      category_id: sigCatId,
      name: 'Wagyu Steak A5',
      name_th: 'เนื้อย่างวากิว A5',
      price: 1250,
      image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&q=80&w=800',
      description: 'เนื้อวากิวคัดเกรดพิเศษ ย่างเตาถ่านหอมกรุ่น เสิร์ฟพร้อมซอสสูตรเฉพาะที่เคี่ยวมานานกว่า 24 ชั่วโมง',
      options: JSON.stringify([{ label: "ระดับความสุก", choices: ["Rare", "Medium Rare", "Medium", "Done"] }]),
      is_available: true
    },
    {
      id: crypto.randomUUID(),
      category_id: pastaCatId,
      name: 'Truffle Fettuccine',
      name_th: 'เฟตตูชินีทรัฟเฟิล',
      price: 480,
      image_url: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&q=80&w=800',
      description: 'ครีมซอสทรัฟเฟิลเข้มข้น เส้นสดทำเองทุกวัน หอมกลิ่นทรัฟเฟิลออยล์และพาเมซานชีส',
      options: JSON.stringify([{ label: "ความเผ็ด", choices: ["ไม่เผ็ด", "เผ็ดน้อย", "เผ็ดปกติ"] }]),
      is_available: true
    },
    {
      id: crypto.randomUUID(),
      category_id: saladCatId,
      name: 'Burrata & Tomato',
      name_th: 'สลัดบูร์ราต้า',
      price: 350,
      image_url: 'https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?auto=format&fit=crop&q=80&w=800',
      description: 'ชีสบูร์ราต้านำเข้า เสิร์ฟพร้อมมะเขือเทศเชอร์รี่ บัลซามิกเกลซ และน้ำมันมะกอกคุณภาพสูง',
      options: null,
      is_available: true
    }
  ]);
};
