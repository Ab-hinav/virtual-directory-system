import { db } from "../db/knex";
import { create, getNodeByName, list, move, remove, rename } from "../repos/vdir.repo";
import { NodeType } from "../utils/types";

export async function createNode(
  name: string,
  type: NodeType,
  parentName: string | null
) {
  try {
    if (parentName) {
      const parentNode = await getNodeByName(db, parentName);
      if (!parentNode) {
        console.log("Parent node not found");
        return;
      }
      if (parentNode.type == "file") {
        console.log("Parent node is a file");
        return;
      }
      const parentId = parentNode.id;
      return await create(db, name, type, parentId);
    }

    return await create(db, name, type, null);
  } catch (error) {
    console.log("Error in creating a node");
    console.log(error);
  }
}

export async function listNodes(parentName: string) {
  try {

    const node = await getNodeByName(db,parentName);

    if(node && node.type == 'folder'){
        return await list(db, node.id);
    }

    if(node && node.type == 'file'){
        console.log("File not allowed");
        return;
    }

    if(!node){
        console.log("Node not found");
        return;
    }

    
  } catch (error) {
    console.log("Error in listing nodes");
    console.log(error);
  }
}

export async function renameNodes(name: string, newName: string) {
  try {
    const node = await getNodeByName(db, name);

    if (!node) {
      console.log("Node not found");
      return;
    }

    if(node.name === newName){
        console.log("New name is same as old name");
        return;
    }

    return await rename(db, node?.id, newName);
  } catch (error) {
    console.log("Error in renaming nodes");
    console.log(error);
  }
}

export async function moveNodes(name: string, newParentName: string) {
  try {

    const node = await getNodeByName(db, name);
    const newParentNode = await getNodeByName(db, newParentName);

    if (!node) {
      console.log("Node not found");
      return;
    }
    if (!newParentNode) {
      console.log("New parent node not found");
      return;
    }
    if (newParentNode.type !== "folder") {
      console.log("New parent node is not a folder");
      return;
    }
    const { id } = node;
    const newParentId = newParentNode.id;

    return await move(db,id, newParentId);
  } catch (error) {
    console.log("Error in moving nodes");
    console.log(error);
  }
}


export async function removeNodes(name: string) {
  try {
    const node = await getNodeByName(db, name);
    if (!node) {
      console.log("Node not found");
      return;
    }
    const { id } = node;
    return await remove(db,id);
  } catch (error) {
    console.log("Error in removing nodes");
    console.log(error);
  }
}
