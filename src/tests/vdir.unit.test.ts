import { db } from "../db/knex";
import { create, list, move, remove, rename } from "../repos/vdir.repo";

// Helper function to expect specific errors
async function expectError(fn: () => Promise<any>, expectedError: string) {
  try {
    await fn();
    throw new Error(`Expected error "${expectedError}" but no error was thrown`);
  } catch (error: any) {
    expect(error.message).toBe(expectedError);
  }
}

// Helper function to create test data
async function createTestFile(name: string, parentId: string | null = null) {
  return await create(db, name, "file", parentId);
}

async function createTestFolder(name: string, parentId: string | null = null) {
  return await create(db, name, "folder", parentId);
}

describe("Virtual Directory System", () => {
  describe("create() function", () => {
    test("should create files and folders at root level", async () => {
      const file = await createTestFile("testFile");
      const folder = await createTestFolder("testFolder");

      expect(file).toBeDefined();
      expect(file.name).toBe("testFile");
      expect(file.type).toBe("file");
      expect(file.parent_id).toBeNull();

      expect(folder).toBeDefined();
      expect(folder.name).toBe("testFolder");
      expect(folder.type).toBe("folder");
      expect(folder.parent_id).toBeNull();

      
      await remove(db, file.id);
      await remove(db, folder.id);
    });

    test("should create children inside folders", async () => {
      const parentFolder = await createTestFolder("parent");
      const childFile = await createTestFile("child", parentFolder.id);
      const childFolder = await createTestFolder("childFolder", parentFolder.id);

      expect(childFile.parent_id).toBe(parentFolder.id);
      expect(childFolder.parent_id).toBe(parentFolder.id);

      
      await remove(db, parentFolder.id);
    });

    test("should throw error when creating child of a file", async () => {
      const file = await createTestFile("parentFile");

      await expectError(
        () => createTestFile("child", file.id),
        "PARENT_NOT_FOLDER"
      );

     
      await remove(db, file.id);
    });

    test("should throw error for duplicate names in same parent", async () => {
      const folder = await createTestFolder("parent");
      const dup = await createTestFile("duplicate", folder.id);

      await expectError(
        () => createTestFile("duplicate", folder.id),
        "DUPLICATE_NAME"
      );

      
      await remove(db, folder.id);
      await remove(db, dup.id);
    });

    test("should throw error for empty name", async () => {
      await expectError(
        () => create(db, "", "file", null),
        "NAME_NOT_GIVEN"
      );
    });

    test("should throw error for empty type", async () => {
      await expectError(
        () => create(db, "test", "" as any, null),
        "TYPE_NOT_GIVEN"
      );
    });

    test("should throw error for non-existent parent", async () => {
      await expectError(
        () => createTestFile("test", "non-existent-id"),
        "PARENT_NOT_FOUND"
      );
    });
  });

  describe("rename() function", () => {
    test("should rename files and folders", async () => {
      const file = await createTestFile("originalName");
      const renamedFile = await rename(db, file.id, "newName");

      expect(renamedFile.name).toBe("newName");
      expect(renamedFile.id).toBe(file.id);

      
      await remove(db, file.id);
    });

    test("should throw error for empty new name", async () => {
      const file = await createTestFile("test");

      await expectError(
        () => rename(db, file.id, ""),
        "NEW_NAME_NOT_GIVEN"
      );

      
      await remove(db, file.id);
    });

    test("should throw error for empty id", async () => {
      await expectError(
        () => rename(db, "", "newName"),
        "ID_NOT_GIVEN"
      );
    });
  });

  describe("list() function", () => {
    test("should list children of a folder", async () => {
      const parent = await createTestFolder("parent");
      const child1 = await createTestFile("file1", parent.id);
      const child2 = await createTestFolder("folder1", parent.id);
      const child3 = await createTestFile("file2", parent.id);

      const children = await list(db, parent.id);

      expect(children).toHaveLength(3);
      expect(children.map(c => c.name)).toEqual(
        expect.arrayContaining(["file1", "folder1", "file2"])
      );

      
      await remove(db, parent.id);
    });

    test("should return empty array for folder with no children", async () => {
      const folder = await createTestFolder("emptyFolder");
      const children = await list(db, folder.id);

      expect(children).toHaveLength(0);

     
      await remove(db, folder.id);
    });

    test("should throw error for non-existent parent", async () => {
      await expectError(
        () => list(db, "non-existent-id"),
        "PARENT_NOT_FOUND"
      );
    });

    test("should throw error when listing children of a file", async () => {
      const file = await createTestFile("testFile");

      await expectError(
        () => list(db, file.id),
        "PARENT_NOT_FOLDER"
      );

      
      await remove(db, file.id);
    });

    test("should throw error for empty parent id", async () => {
      await expectError(
        () => list(db, ""),
        "PARENT_ID_NOT_GIVEN"
      );
    });
  });

  describe("remove() function", () => {
    test("should remove files and folders", async () => {
      const file = await createTestFile("toBeRemoved");
      await remove(db, file.id);

      // Verify it's removed by trying to list (should not exist)
      await expectError(
        () => list(db, file.id),
        "PARENT_NOT_FOUND"
      );
    });

    test("should recursively remove folder and all its children", async () => {
      // Create a nested structure: parent -> child1 -> grandchild
      const parent = await createTestFolder("parent");
      const child = await createTestFolder("child", parent.id);
      const grandchild = await createTestFile("grandchild", child.id);
      const sibling = await createTestFile("sibling", parent.id);

      // Remove the child folder (should remove grandchild too)
      await remove(db, child.id);

      // Verify only sibling remains
      const remainingChildren = await list(db, parent.id);
      expect(remainingChildren).toHaveLength(1);
      expect(remainingChildren[0].name).toBe("sibling");

      
      await remove(db, parent.id);
    });

    test("should throw error for null id", async () => {
      await expectError(
        () => remove(db, null as any),
        "ID_NOT_GIVEN"
      );
    });
  });

  describe("move() function", () => {
    test("should move files between folders", async () => {
      const sourceFolder = await createTestFolder("source");
      const targetFolder = await createTestFolder("target");
      const file = await createTestFile("movableFile", sourceFolder.id);

      // Verify file is in source folder
      let sourceChildren = await list(db, sourceFolder.id);
      expect(sourceChildren).toHaveLength(1);

      // Move file to target folder
      await move(db, file.id, targetFolder.id);

      // Verify file moved to target folder
      sourceChildren = await list(db, sourceFolder.id);
      expect(sourceChildren).toHaveLength(0);

      const targetChildren = await list(db, targetFolder.id);
      expect(targetChildren).toHaveLength(1);
      expect(targetChildren[0].name).toBe("movableFile");

      
      await remove(db, sourceFolder.id);
      await remove(db, targetFolder.id);
    });

    test("should move folders with their children", async () => {
      const sourceParent = await createTestFolder("sourceParent");
      const targetParent = await createTestFolder("targetParent");
      const folderToMove = await createTestFolder("folderToMove", sourceParent.id);
      const childFile = await createTestFile("childFile", folderToMove.id);

      // Move the folder
      await move(db, folderToMove.id, targetParent.id);

      // Verify folder moved to target
      const targetChildren = await list(db, targetParent.id);
      expect(targetChildren).toHaveLength(1);
      expect(targetChildren[0].name).toBe("folderToMove");

      // Verify child file moved with the folder
      const movedFolderChildren = await list(db, folderToMove.id);
      expect(movedFolderChildren).toHaveLength(1);
      expect(movedFolderChildren[0].name).toBe("childFile");

      
      await remove(db, sourceParent.id);
      await remove(db, targetParent.id);
    });

    test("should throw error when moving to a file", async () => {
      const folder = await createTestFolder("folder");
      const file = await createTestFile("file", folder.id);
      const targetFile = await createTestFile("targetFile");

      await expectError(
        () => move(db, file.id, targetFile.id),
        "NEW_PARENT_NOT_FOLDER"
      );

      
      await remove(db, folder.id);
      await remove(db, targetFile.id);
    });

    test("should throw error when moving folder into its own descendant", async () => {
      const parent = await createTestFolder("parent");
      const child = await createTestFolder("child", parent.id);
      const grandchild = await createTestFolder("grandchild", child.id);

      await expectError(
        () => move(db, parent.id, grandchild.id),
        "CANNOT_MOVE_INTO_DESCENDANT"
      );

      
      await remove(db, parent.id);
    });
  });
});
