
import { create, list, move, remove, rename } from '../repos/vdir.repo';
import { db } from '../db/knex';

// Helper function to create test data
async function createTestFile(name: string, parentId: string | null = null) {
  return await create(db, name, "file", parentId);
}

async function createTestFolder(name: string, parentId: string | null = null) {
  return await create(db, name, "folder", parentId);
}

// Helper function to expect specific errors
async function expectError(fn: () => Promise<any>, expectedError: string) {
  try {
    await fn();
    throw new Error(`Expected error "${expectedError}" but no error was thrown`);
  } catch (error: any) {
    expect(error.message).toBe(expectedError);
  }
}

describe("Virtual Directory System - Integration Tests", () => {
  describe("Complex Scenarios", () => {
    test("should handle complete workflow: create, move, rename, and recursive delete", async () => {
      // Create a nested structure: root -> projects -> 2025 -> README.md
      const root = await createTestFolder("root");
      const projects = await createTestFolder("projects", root.id);
      const year2025 = await createTestFolder("2025", projects.id);
      const readme = await createTestFile("README.md", year2025.id);

      // Verify initial structure
      const projectsChildren = await list(db, projects.id);
      expect(projectsChildren.map(c => c.name)).toEqual(["2025"]);

      // Move README.md from 2025 to projects
      await move(db, readme.id, projects.id);

      // Rename 2025 folder to archive
      await rename(db, year2025.id, "archive");

      // Recursively remove projects folder (should remove archive and README.md)
      await remove(db, projects.id);

      // Verify root is now empty
      const rootChildren = await list(db, root.id);
      expect(rootChildren).toEqual([]);

      // Cleanup
      await remove(db, root.id);
    });

    test("should prevent moving folder into its own descendant", async () => {
      // Create structure: root -> level1 -> level2
      const root = await createTestFolder("root");
      const level1 = await createTestFolder("level1", root.id);
      const level2 = await createTestFolder("level2", level1.id);

      // Try to move level1 into level2 (should fail)
      await expectError(
        () => move(db, level1.id, level2.id),
        "CANNOT_MOVE_INTO_DESCENDANT"
      );

      // Cleanup
      await remove(db, root.id);
    });

    test("should handle multi-level nested structure correctly", async () => {
      // Create a complex nested structure
      const root = await createTestFolder("root");
      const level1Folder = await createTestFolder("level1Folder", root.id);
      const level1File = await createTestFile("level1File", root.id);
      const level1Folder2 = await createTestFolder("level1Folder2", root.id);
      const level1File2 = await createTestFile("level1File2", root.id);
      const level2Folder = await createTestFolder("level2Folder", level1Folder.id);
      const level2File = await createTestFile("level2File", level1Folder.id);

      // Verify root level children
      const rootChildren = await list(db, root.id);
      expect(rootChildren).toHaveLength(4);
      expect(rootChildren.map(c => c.name)).toEqual(
        expect.arrayContaining(["level1Folder", "level1File", "level1Folder2", "level1File2"])
      );

      // Verify level1 folder children
      const level1Children = await list(db, level1Folder.id);
      expect(level1Children).toHaveLength(2);
      expect(level1Children.map(c => c.name)).toEqual(
        expect.arrayContaining(["level2Folder", "level2File"])
      );

      // Cleanup
      await remove(db, root.id);
    });

    test("should handle deep chain structure and partial deletion", async () => {
      // Create a deep chain: root -> level1 -> level2 -> level3 -> level4 -> level5
      const root = await createTestFolder("root");
      const level1 = await createTestFolder("level1", root.id);
      const level2 = await createTestFolder("level2", level1.id);
      const level3 = await createTestFolder("level3", level2.id);
      const level4 = await createTestFolder("level4", level3.id);
      const level5 = await createTestFolder("level5", level4.id);

      // Verify initial structure
      expect((await list(db, root.id)).length).toBe(1);
      expect((await list(db, level1.id)).length).toBe(1);

      // Remove level3 (should remove level4 and level5 as well, but level2 remains)
      await remove(db, level3.id);
      
      // Verify level1 still has level2 as a child
      expect((await list(db, level1.id)).length).toBe(1);
      expect((await list(db, root.id)).length).toBe(1);

      // Remove level1 (should remove level2 as well)
      await remove(db, level1.id);
      
      // Verify root is now empty
      expect((await list(db, root.id)).length).toBe(0);

      // Cleanup
      await remove(db, root.id);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle operations on empty directory", async () => {
      const emptyFolder = await createTestFolder("emptyFolder");
      
      const children = await list(db, emptyFolder.id);
      expect(children).toHaveLength(0);

      // Cleanup
      await remove(db, emptyFolder.id);
    });

    test("should maintain data integrity during complex operations", async () => {
      // Create a structure with mixed files and folders
      const root = await createTestFolder("root");
      const folder1 = await createTestFolder("folder1", root.id);
      const folder2 = await createTestFolder("folder2", root.id);
      const file1 = await createTestFile("file1", folder1.id);
      const file2 = await createTestFile("file2", folder1.id);
      const file3 = await createTestFile("file3", folder2.id);

      // Move file1 from folder1 to folder2
      await move(db, file1.id, folder2.id);

      // Verify folder1 now has only file2
      const folder1Children = await list(db, folder1.id);
      expect(folder1Children).toHaveLength(1);
      expect(folder1Children[0].name).toBe("file2");

      // Verify folder2 now has file1 and file3
      const folder2Children = await list(db, folder2.id);
      expect(folder2Children).toHaveLength(2);
      expect(folder2Children.map(c => c.name)).toEqual(
        expect.arrayContaining(["file1", "file3"])
      );

      // Rename folder1 to avoid conflicts
      await rename(db, folder1.id, "renamedFolder");

      // Verify rename worked
      const rootChildren = await list(db, root.id);
      expect(rootChildren.map(c => c.name)).toEqual(
        expect.arrayContaining(["renamedFolder", "folder2"])
      );

      // Cleanup
      await remove(db, root.id);
    });
  });
});