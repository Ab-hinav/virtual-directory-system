import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {


    await knex.schema.raw(
        `CREATE UNIQUE INDEX idx_nodes_name ON nodes(name);`
      );

}


export async function down(knex: Knex): Promise<void> {


    await knex.schema.raw(
        `DROP INDEX idx_nodes_name;`
      );

}

