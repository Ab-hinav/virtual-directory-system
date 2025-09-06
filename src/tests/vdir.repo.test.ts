
import { create, list, move, remove, rename } from '../repos/vdir.repo';
import { db } from '../db/knex';


/*

create root -> node(folder)
create projects -> node(folder) -> root
create 2025 -> node(folder) -> projects
create readme -> node(file) -> 2025

list projects -> 2025
move readme -> projects   
rename 2025 -> archive  
remove projects
list root -> []

*/


test("runs the sample scenario recursive delete", async () => {
  const root = await create(db, "root", "folder", null);

  const projects = await create(db, "projects", "folder", root.id);
  const y2025 = await create(db, "2025", "folder", projects.id);
  const readme = await create(db, "README.md", "file", y2025.id);

  const children = await list(db, projects.id);

  expect(children.map((c) => c.name)).toEqual(["2025"]);

  await move(db, readme.id, projects.id);
  await rename(db, y2025.id, "archive");
  await remove(db, projects.id);

  const rootChildren = await list(db, root.id);
  expect(rootChildren).toEqual([]);
});


test("try to insert a folder into one of its children",async () => {

    const root = await create( db,"root","folder",null)
    const level1Folder = await create(db,"subroot", "folder", root.id)
    const level1File = await create(db,"subrootFile", "file", root.id)
    const level2Folder = await create( db,"subroot2", "folder", level1Folder.id)
    const level2File = await create(db,"subroot2File", "file", level1Folder.id)

    try {
      
     await move(db,level1Folder.id, level2Folder.id)
    }catch(err){
        // @ts-ignore
        expect(err.message).toBe("CANNOT_MOVE_INTO_DESCENDANT")
    }

})

test("add files and folders and check their children",async() =>{

    const root = await create(db,'root','folder',null)
    const level1Folder = await create(db, 'level1Folder', 'folder', root.id)
    const level1File = await create(db, 'level1File', 'file', root.id)
    const level1Folder1 = await create(db, 'level1Folder1', 'folder', root.id)
    const level1File1 = await create(db, 'level1File1', 'folder', root.id)
    const level2Folder = await create(db, 'level2Folder', 'folder', level1Folder.id)
    const level2File = await create(db, 'level2File', 'file', level1Folder.id)

    const listRootChildren = await list(db, root.id)
    const mySet = new Set()
    mySet.add(level1Folder.name)
    mySet.add(level1File.name)
    mySet.add(level1Folder1.name)
    mySet.add(level1File1.name)
    for (let children of listRootChildren){
        if(!mySet.has(children.name)){
            throw new Error("level check failed for root")
        }
    }
    mySet.clear()
    mySet.add(level2Folder.name)
    mySet.add(level2File.name)

    const listLevel1FolderChildren = await list(db, level1Folder.id)

    for(let children of listLevel1FolderChildren){
        if(!mySet.has(children.name)){
            
            throw new Error("level check failed for level1Folder")
        }
    }

})


test("one big chain structure check",async()=>{

    const root = await create(db, 'root', 'folder', null)
    const level1Folder = await create(db, 'level1Folder', 'folder', root.id)
    const level2Folder = await create(db, 'level2Folder', 'folder', level1Folder.id)
    const level3Folder = await create(db, 'level3Folder', 'folder', level2Folder.id)
    const level4Folder = await create(db, 'level4Folder', 'folder', level3Folder.id)
    const level5Folder = await create(db, 'level5Folder', 'folder', level4Folder.id)

    expect((await list(db,root.id)).length).toBe(1)
    expect((await list(db, level1Folder.id)).length).toBe(1)

    await remove(db, level3Folder.id)
    expect((await list(db, root.id)).length).toBe(1)
    await remove(db,level1Folder.id)
    expect((await list(db, root.id)).length).toBe(0)




})




//   let db: Knex;
//   const rootId = 'root';

// //   beforeAll(async () => {
// //     db = knex({ ...config, connection: { filename: ':memory:' } });
// //     await db.schema.createTable('nodes', (t) => {
// //       t.text('id').primary();
// //       t.text('name').notNullable();
// //       t.text('type').notNullable();
// //       t.text('parent_id').nullable();
// //       t.timestamp('created_at').defaultTo(db.fn.now());
// //       t.timestamp('updated_at').defaultTo(db.fn.now());
// //     });
// //     await db('nodes').insert({ id: rootId, name: '/', type: 'folder', parent_id: null });
// //   });

// //   afterAll(async () => {
// //     await db.destroy();
// //   });

//   it('runs the sample scenario', async () => {
//     const projects = await create(db, 'projects', 'folder', rootId);
//     const y2025 = await create(db, '2025', 'folder', projects.id);
//     const readme = await create(db, 'README.md', 'file', y2025.id);

//     const children = await list(db, projects.id);
//     expect(children.map(c => c.name)).toEqual(['2025']);

//     await move(db, readme.id, projects.id);
//     await rename(db, y2025.id, 'archive');
//     await remove(db, projects.id);

//     const rootChildren = await list(db, rootId);
//     expect(rootChildren).toEqual([]);
//   });
// });