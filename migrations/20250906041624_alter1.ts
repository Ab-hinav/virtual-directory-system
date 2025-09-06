import type { Knex } from "knex";


export async function up(knex: Knex): Promise<void> {


    await knex.schema.alterTable('nodes', (table) => {
        table.timestamp('deleted_at').nullable();
    });


}


export async function down(knex: Knex): Promise<void> {
    await knex.schema.alterTable('nodes', (table) => {
        table.dropColumn('deleted_at');
    });
}

