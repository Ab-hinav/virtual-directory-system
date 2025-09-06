import { Knex } from "knex";
import { randomUUID } from "crypto";
import { NodeType, VNode } from "../utils/types";
import { isEmpty } from "../utils/helpers";

const TABLE = "nodes";
type DBLike = Knex | Knex.Transaction;

export async function create(
  db: DBLike,
  name: string,
  type: NodeType,
  parentId: string | null
): Promise<VNode> {
  const sibling = await db<VNode>(TABLE)
    .where({ parent_id: parentId, name })
    .first();
  if (!isEmpty(sibling)) {
    throw new Error("DUPLICATE_NAME");
  }

  if (isEmpty(name)) {
    throw new Error("NAME_NOT_GIVEN");
  }
  if (isEmpty(type)) {
    throw new Error("TYPE_NOT_GIVEN");
  }

  if (parentId) {
    const parent = await db<VNode>(TABLE).where({ id: parentId }).first();
    if (!parent) {
      throw new Error("PARENT_NOT_FOUND");
    }
    if (parent.type !== "folder") {
      throw new Error("PARENT_NOT_FOLDER");
    }
  }

  const now = db.fn.now();
  const row: VNode = { id: randomUUID(), name, type, parent_id: parentId };
  await db(TABLE).insert({ ...row, created_at: now, updated_at: now });
  return (await db<VNode>(TABLE).where({ id: row.id }).first())!;
}

export async function getNodeByName(
  db: DBLike,
  name: string
): Promise<VNode | null | undefined> {
  const row = await db<VNode>(TABLE).where({ name }).first();

  if (!isEmpty(row)) {
    return row;
  }
  return null;
}

export async function list(
  db: DBLike,
  parentId: string
): Promise<VNode[]> {
  if (parentId) {
    const parent = await db<VNode>(TABLE).where({ id: parentId }).first();
    if (!parent) {
      throw new Error("PARENT_NOT_FOUND");
    }
    if (parent.type !== "folder") {
      throw new Error("PARENT_NOT_FOLDER");
    }
    return db<VNode>(TABLE).where({ parent_id: parentId }).orderBy("name");
  } else {
    throw new Error("PARENT_ID_NOT_GIVEN");
  }
}

export async function rename(
  db: DBLike,
  id: string,
  newName: string
): Promise<VNode> {
  if (isEmpty(id)) {
    throw new Error("ID_NOT_GIVEN");
  }
  if (isEmpty(newName)) {
    throw new Error("NEW_NAME_NOT_GIVEN");
  }

  await db(TABLE)
    .where({ id })
    .update({ name: newName, updated_at: db.fn.now() });
  return (await db<VNode>(TABLE).where({ id }).first())!;
}

export async function move(
  db: DBLike,
  id: string,
  newParentId: string | null
): Promise<VNode> {
  if (newParentId) {
    const parent = await db<VNode>(TABLE).where({ id: newParentId }).first();
    if (!parent) {
      throw new Error("NEW_PARENT_NOT_FOUND");
    }
    if (parent.type !== "folder") {
      throw new Error("NEW_PARENT_NOT_FOLDER");
    }

    const res = await db.raw(
      `
      WITH RECURSIVE subtree(id) AS (
        SELECT id FROM ${TABLE} WHERE id = ?
        UNION ALL
        SELECT n.id FROM ${TABLE} n JOIN subtree s ON n.parent_id = s.id
      )
      SELECT id FROM subtree WHERE id = ? LIMIT 1;
    `,
      [id, newParentId]
    );
    const rows = (res as any).rows ?? res;
    if (rows.length > 0) {
      throw new Error("CANNOT_MOVE_INTO_DESCENDANT");
    }
  }
  await db(TABLE)
    .where({ id })
    .update({ parent_id: newParentId, updated_at: db.fn.now() });
  return (await db<VNode>(TABLE).where({ id }).first())!;
}

export async function remove(db: DBLike, id: string): Promise<void> {
  if (id === null) {
    throw new Error("ID_NOT_GIVEN");
  }

  await db.raw(
    `
    WITH RECURSIVE subtree(id) AS (
      SELECT id FROM ${TABLE} WHERE id = ?
      UNION ALL
      SELECT n.id FROM ${TABLE} n JOIN subtree s ON n.parent_id = s.id
    )
    DELETE FROM ${TABLE} WHERE id IN (SELECT id FROM subtree);
  `,
    [id]
  );
}
