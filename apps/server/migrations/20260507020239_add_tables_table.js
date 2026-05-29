/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tables', table => {
    table.string('id').primary(); // โต๊ะ 1, 2, ..., 10
    table.string('name').notNullable();
    table.integer('capacity').defaultTo(4);
    table.timestamps(true, true);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTableIfExists('tables');
};
