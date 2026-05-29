/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema
    .createTable('categories', table => {
      table.uuid('id').primary();
      table.string('name').notNullable();
      table.integer('display_order').defaultTo(0);
    })
    .createTable('menus', table => {
      table.uuid('id').primary();
      table.uuid('category_id').references('id').inTable('categories');
      table.string('name').notNullable();
      table.string('name_th').notNullable();
      table.decimal('price', 10, 2).notNullable();
      table.text('description');
      table.string('image_url');
      table.text('options'); // เก็บ JSON string ของ options
      table.boolean('is_available').defaultTo(true);
    })
    .createTable('orders', table => {
      table.uuid('id').primary();
      table.string('table_id').notNullable();
      table.string('session_token').notNullable(); // เชื่อมกับ session ปัจจุบัน
      table.decimal('total_price', 10, 2).notNullable();
      table.string('status').defaultTo('pending');
      table.timestamps(true, true);
    })
    .createTable('table_sessions', table => {
      table.uuid('id').primary();
      table.string('table_id').notNullable();
      table.string('token').notNullable().unique();
      table.string('status').defaultTo('active'); // active, completed
      table.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('order_items', table => {
      table.uuid('id').primary();
      table.uuid('order_id').references('id').inTable('orders').onDelete('CASCADE');
      table.uuid('menu_id').references('id').inTable('menus');
      table.integer('quantity').notNullable();
      table.decimal('price_at_order', 10, 2).notNullable();
      table.text('notes');
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema
    .dropTableIfExists('order_items')
    .dropTableIfExists('orders')
    .dropTableIfExists('menus')
    .dropTableIfExists('categories');
};
