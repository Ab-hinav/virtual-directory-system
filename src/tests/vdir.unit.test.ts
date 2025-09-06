import { db } from "../db/knex";
import { create, list, move, remove, rename } from "../repos/vdir.repo";

test("basic math works", () => {
  expect(2 + 2).toBe(4);
});

test("create function check", async () => {
  const rootFolder = await create(db, "rootFolder", "file", null);
  expect(rootFolder).not.toBeNull();
  const rootFile = await create(db, "rootFile", "file", null);
  expect(rootFile).not.toBeNull();

  // //duplicate folder or file name
  try {
    await create(db, "rootFolder", "file", null);
  } catch (e) {
    // @ts-expect-error
    expect(e?.message).toBe("DUPLICATE_FILE_NAME");
  }

  // // creating child of a file
  try {
    const child = await create(db, "child", "file", rootFolder.id);
  } catch (e) {
    // @ts-ignore
    expect(e?.message).toBe("PARENT_NOT_FOLDER");
  }

  // //name not given

  try {
    const str = "";
    const rootFolder = await create(db, str, "file", null);
  } catch (e) {
    // @ts-ignore
    expect(e?.message).toBe("NAME_NOT_GIVEN");
  }

  // // type not given
  try {
    const str = "root";
    // @ts-ignore
    const rootFolder = await create(db, str, "", null);
  } catch (e) {
    // @ts-ignore
    expect(e?.message).toBe("TYPE_NOT_GIVEN");
  }

  // // parent not found
  try {
    const rootFolder = await create(db, "random_name", "file", "random_id");
  } catch (e) {
    // @ts-ignore
    expect(e?.message).toBe("PARENT_NOT_FOUND");
  }
});

test("rename function check ", async () => {
  const root = await create(db, "root", "file", null);
  const renamed = await rename(db, root.id, "root_renamed");

  expect(renamed.name).toBe("root_renamed");

  // name not given
  try {
    const root = await create(db, "root", "file", null);
    await rename(db, root.id, "");
  } catch (e) {
    // @ts-ignore
    expect(e?.message).toBe("NEW_NAME_NOT_GIVEN");
  }

  // id not given
  try {
    await rename(db, "", "root");
  } catch (e) {
    // @ts-ignore
    expect(e?.message).toBe("ID_NOT_GIVEN");
  }
});

test("list function check", async () => {
  const root = await create(db, "root", "folder", null);
  const child = await create(db, "child", "folder", root.id);
  const child2 = await create(db, "child2", "file", root.id);
  const rootChildren = [child.name, child2.name];
  const children = await list(db, root.id);

  for (const child of children) {
    if (!rootChildren.includes(child.name)) {
      throw new Error("Children not found");
    }
  }

  // parent not found

  try {
    await list(db, "random_id");
  } catch (e) {
    // @ts-ignore
    expect(e.message).toBe("PARENT_NOT_FOUND");
  }

  // parent not folder

  try {
    const random = await create(db, "random", "file", null);
    await list(db, random.id);
  } catch (e) {
    // @ts-ignore
    expect(e.message).toBe("PARENT_NOT_FOLDER");
  }

  // parent id not given

  try {
    await list(db, "");
  } catch (e) {
    // @ts-ignore
    expect(e.message).toBe("PARENT_ID_NOT_GIVEN");
  }
});

test("remove function check", async () => {
  const root = await create(db, "root", "folder", null);
  const child = await create(db, "child", "folder", root.id);
  const child2 = await create(db, "child2", "file", root.id);
  const child3 = await create(db, "child3", "file", child.id);
  const child4 = await create(db, "child4", "folder", child.id);
  const child5 = await create(db, "child5", "file", child4.id);

  await remove(db, child.id);

  const children = await list(db, root.id);
  expect(children.length).toBe(1);

  //id not given

  try {
    await remove(db, "");
  } catch (e) {
    // @ts-ignore
    expect(e.message).toBe("ID_NOT_GIVEN");
  }
});

test("move function check", async () => {
  const root = await create(db, "root", "folder", null);
  const folder = await create(db, "child", "folder", root.id);
  const folder1 = await create(db, "child2", "folder", root.id);
  const file1 = await create(db, "file1", "file", folder.id);
  const file2 = await create(db, "file2", "file", folder.id);

  const children = await list(db, folder.id);
  expect(children.length).toBe(2);
  expect(children[0].name).toBe("file1");
  await move(db, file1.id, folder1.id);
  const children2 = await list(db, folder.id);
  expect(children2.length).toBe(1);

  // try to move file under file
  try {
    await move(db, file2.id, file1.id);
  } catch (e) {
    //@ts-ignore
    expect(e.message).toBe("NEW_PARENT_NOT_FOLDER");
  }

  // trying to move top folder in subdirectory folder

  try {
    await move(db, root.id, folder.id);
  } catch (e) {
    // @ts-ignore
    expect(e.message).toBe("CANNOT_MOVE_INTO_DESCENDANT");
  }
});
