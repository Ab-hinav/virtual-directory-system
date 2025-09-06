import { db } from "../db/knex";
import { create, getNodeByName, list, move, remove, rename } from "../repos/vdir.repo";
import { isEmpty } from "../utils/helpers";
import { NodeType } from "../utils/types";

export async function createNode(
  name: string,
  type: NodeType,
  parentName: string | null
) {
  try {

    if(isEmpty(name)){
        console.log("Name not given");
        return false;
    }
    if(isEmpty(type)){
        console.log("Type not given");
        return false;
    }


    if (parentName) {
      const parentNode = await getNodeByName(db, parentName);
      if (!parentNode) {
        console.log("Parent node not found");
        return false;
      }
      if (parentNode.type == "file") {
        console.log("Parent node is a file");
        return false;
      }
      const parentId = parentNode.id;
      return await create(db, name, type, parentId);
    }

    return await create(db, name, type, null);
  } catch (error) {
    console.log("Error in creating a node");
    console.log(error);
    return false
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
        return false;
    }

    if(!node){
        console.log("Node not found");
        return false;
    }

    
  } catch (error) {
    console.log("Error in listing nodes");
    console.log(error);
    return false
  }
}

export async function renameNodes(name: string, newName: string) {
  try {
    const node = await getNodeByName(db, name);

    if (!node) {
      console.log("Node not found");
      return false;
    }

    if(node.name === newName){
        console.log("New name is same as old name");
        return false;
    }

    await rename(db, node?.id, newName);
    return true;
  } catch (error) {
    console.log("Error in renaming nodes");
    console.log(error);
    return false
  }
}

export async function moveNodes(name: string, newParentName: string) {
  try {

    const node = await getNodeByName(db, name);
    const newParentNode = await getNodeByName(db, newParentName);

    if (isEmpty(node)) {
      console.log("Node not found");
      return false;
    }
    if (isEmpty(newParentNode)) {
      console.log("New parent node not found");
      return false;
    }
    if (newParentNode &&  newParentNode.type !== "folder") {
      console.log("New parent node is not a folder");
      return false;
    }
    //@ts-ignore
    const { id } = node;
    // @ts-ignore
    const newParentId = newParentNode.id;

    await move(db,id, newParentId);

    return true;
  } catch (error) {
    console.log("Error in moving nodes");
    console.log(error);
    return false
  }
}


export async function removeNodes(name: string) {
  try {
    const node = await getNodeByName(db, name);
    if (isEmpty(node)) {
      console.log("Node not found");
      return false;
    }
    //@ts-ignore
    const { id } = node;
    await remove(db,id);
    return true;
  } catch (error) {
    console.log("Error in removing nodes");
    console.log(error);
    return false
  }
}
