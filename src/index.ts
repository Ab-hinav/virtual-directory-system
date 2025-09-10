import readline from 'node:readline/promises';
import { db } from './db/knex';
import { createNode, listNodes, moveNodes, removeNodes, renameNodes } from './service/vdir.service';
import { NodeType } from './utils/types';

/**
 * Virtual Directory System CLI
 * 
 * A command-line interface for managing a virtual file system.
 * Supports creating, listing, moving, renaming, and removing files and folders.
 */

// Command definitions for better maintainability
const COMMANDS = {
  CREATE: 'create',
  LIST: 'list', 
  RENAME: 'rename',
  MOVE: 'move',
  REMOVE: 'remove',
  EXIT: 'exit'
} as const;

const NODE_TYPES = {
  FOLDER: 'folder',
  FILE: 'file'
} as const;

/**
 * Display available commands and their usage
 */
function displayHelp(): void {
  console.log('\n📁 Virtual Directory System Commands:');
  console.log('=====================================');
  console.log('• create <name> <type> [parent_name]  - Create a file or folder');
  console.log('• list <parent_name>                  - List children of a folder');
  console.log('• rename <name> <new_name>            - Rename a file or folder');
  console.log('• move <name> <new_parent_name>       - Move to a different parent');
  console.log('• remove <name>                       - Remove a file or folder');
  console.log('• exit                                - Exit the application');
  console.log('');
  console.log('Examples:');
  console.log('  create myfile file                  - Create a file at root');
  console.log('  create myfolder folder              - Create a folder at root');
  console.log('  create subfile file myfolder        - Create file inside myfolder');
  console.log('  list myfolder                       - List contents of myfolder');
  console.log('  rename myfile newfile               - Rename myfile to newfile');
  console.log('  move myfile myfolder                - Move myfile into myfolder');
  console.log('  remove myfile                       - Delete myfile');
  console.log('');
}

/**
 * Validate command arguments
 */
function validateCreateArgs(args: string[]): { isValid: boolean; error?: string } {
  if (args.length < 2) {
    return { isValid: false, error: '❌ Missing arguments. Usage: create <name> <type> [parent_name]' };
  }
  
  if (args[1] !== NODE_TYPES.FOLDER && args[1] !== NODE_TYPES.FILE) {
    return { isValid: false, error: `❌ Invalid type. Must be "${NODE_TYPES.FOLDER}" or "${NODE_TYPES.FILE}"` };
  }
  
  return { isValid: true };
}

function validateListArgs(args: string[]): { isValid: boolean; error?: string } {
  if (args.length !== 1) {
    return { isValid: false, error: '❌ Missing argument. Usage: list <parent_name>' };
  }
  return { isValid: true };
}

function validateRenameArgs(args: string[]): { isValid: boolean; error?: string } {
  if (args.length !== 2) {
    return { isValid: false, error: '❌ Missing arguments. Usage: rename <name> <new_name>' };
  }
  return { isValid: true };
}

function validateMoveArgs(args: string[]): { isValid: boolean; error?: string } {
  if (args.length !== 2) {
    return { isValid: false, error: '❌ Missing arguments. Usage: move <name> <new_parent_name>' };
  }
  return { isValid: true };
}

function validateRemoveArgs(args: string[]): { isValid: boolean; error?: string } {
  if (args.length !== 1) {
    return { isValid: false, error: '❌ Missing argument. Usage: remove <name>' };
  }
  return { isValid: true };
}

/**
 * Handle create command
 */
async function handleCreate(args: string[]): Promise<void> {
  const validation = validateCreateArgs(args);
  if (!validation.isValid) {
    console.log(validation.error);
    return;
  }

  try {
    const [name, type, parentName] = args;
    const parentId = parentName === "" ? null : parentName;
    
    const node = await createNode(name, type as NodeType, parentId);

    if(!node){
      console.log(`❌ Error creating node`);
      return;
    }

    console.log(`✅ Created ${type}: "${name}"${parentId ? ` in "${parentId}"` : ' at root'}`);
    // @ts-ignore
    console.log(`   ID: ${node.id}`);
  } catch (error: any) {
    console.log(`❌ Error creating node: ${error.message}`);
  }
}

/**
 * Handle list command
 */
async function handleList(args: string[]): Promise<void> {
  const validation = validateListArgs(args);
  if (!validation.isValid) {
    console.log(validation.error);
    return;
  }

  try {
    const [parentName] = args;
    const children = await listNodes(parentName);

    if(!children){
      console.log(`❌ Error listing children`);
      return;
    }
   
    if ( children.length === 0) {
      console.log(`📂 Folder "${parentName}" is empty`);
    } else {
      console.log(`📂 Contents of "${parentName}":`);
      children.forEach(child => {
        const icon = child.type === NODE_TYPES.FOLDER ? '📁' : '📄';
        console.log(`   ${icon} ${child.name} (${child.type})`);
      });
    }
  } catch (error: any) {
    console.log(`❌ Error listing children: ${error.message}`);
  }
}

/**
 * Handle rename command
 */
async function handleRename(args: string[]): Promise<void> {
  const validation = validateRenameArgs(args);
  if (!validation.isValid) {
    console.log(validation.error);
    return;
  }

    const [name, newName] = args;
    const resp = await renameNodes(name, newName);
    if(!resp){
      console.log(`❌ Error renaming`);
      return;
    }
    console.log(`✅ Renamed "${name}" to "${newName}"`);
  
}

/**
 * Handle move command
 */
async function handleMove(args: string[]): Promise<void> {
  const validation = validateMoveArgs(args);
  if (!validation.isValid) {
    console.log(validation.error);
    return;
  }

  const [name, newParentName] = args;
  const response = await moveNodes(name, newParentName);
  if (response) {
    console.log(`✅ Moved "${name}" to "${newParentName}"`);
  } else {
    console.log(`❌ Error moving`);
  }

}

/**
 * Handle remove command
 */
async function handleRemove(args: string[]): Promise<void> {
  const validation = validateRemoveArgs(args);
  if (!validation.isValid) {
    console.log(validation.error);
    return;
  }
    const [name] = args;
    const response = await removeNodes(name);
    if(response){
      console.log(`✅ Removed "${name}"`);
    }else{
      console.log(`❌ Error removing`);
    }
    
}

/**
 * Process user command
 */
async function processCommand(userInput: string): Promise<boolean> {
  const command = userInput.trim().split(' ');
  const commandName = command[0];
  const commandArgs = command.slice(1);

  switch (commandName) {
    case COMMANDS.CREATE:
      await handleCreate(commandArgs);
      break;
      
    case COMMANDS.LIST:
      await handleList(commandArgs);
      break;
      
    case COMMANDS.RENAME:
      await handleRename(commandArgs);
      break;
      
    case COMMANDS.MOVE:
      await handleMove(commandArgs);
      break;
      
    case COMMANDS.REMOVE:
      await handleRemove(commandArgs);
      break;
      
    case COMMANDS.EXIT:
      console.log('👋 Goodbye!');
      return false; // Exit the main loop
      
    default:
      console.log('❌ Invalid command. Type "help" for available commands.');
      break;
  }
  
  return true; // Continue the main loop
}

/**
 * Main application entry point
 */
async function main(): Promise<void> {
  try {
    // Test database connection
    await db.raw('SELECT 1');
    console.log('✅ Database connected successfully');
    
    console.log('\n🚀 Virtual Directory System Started!');
    console.log('Type "help" for commands or "exit" to quit.\n');
    
    while (true) {
      const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });

      const userInput = await rl.question('vdir> ');
      rl.close();
      
      // Handle help command
      if (userInput.trim() === 'help') {
        displayHelp();
        continue;
      }
      
      // Process the command
      const shouldContinue = await processCommand(userInput);
      if (!shouldContinue) {
        break;
      }
      
      console.log(''); // Add spacing between commands
    }

    process.exit(0);
    
  } catch (error) {
    console.error('❌ Fatal error:', error);
    process.exit(1);
  }
}

// Start the application
main().catch((error) => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});


