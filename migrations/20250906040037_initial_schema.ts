import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {
  // Create nodes table (for virtual directory system)
  await knex.schema.createTable('nodes', (table) => {
    table.text('id').primary();
    table.text('name').notNullable();
    table.text('type').notNullable(); // 'file' | 'folder'
    table.text('parent_id').nullable();
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });

  // Create indexes for nodes table
  await knex.schema.raw(
    `CREATE UNIQUE INDEX idx_nodes_parent_name ON nodes(parent_id, name);`
  );
  await knex.schema.raw(
    `CREATE INDEX idx_nodes_parent_id ON nodes(parent_id);`
  );
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTableIfExists('nodes');
}

