import readline from 'node:readline/promises';
import { db } from './db/knex';
import { createNode, listNodes, moveNodes, removeNodes, renameNodes } from './service/vdir.service';




async function main(): Promise<void> {
  await db.raw('select 1');
  console.log('DB ready');

  while (true) {

    console.log('Sample commands: create <name> <type> <parent_name>');
    console.log('Sample commands: list <parent_name>');
    console.log('Sample commands: rename <name> <new_name>');
    console.log('Sample commands: move <id> <new_parent_name>');
    console.log('Sample commands: remove <name>');
    console.log('Sample commands: exit');

    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout
    });

    const userInput = await rl.question('Enter a command: ');
    console.log(userInput);
  
    const command = userInput.split(' ');
    const commandName = command[0];
    const commandArgs = command.slice(1);

    switch (commandName) {
      case "create":
        
        if (commandArgs.length < 2) {
          console.log("Invalid command");
          continue;
        }
        if (commandArgs[1] != "folder" && commandArgs[1] != "file") {
          console.log("Invalid command , enter folder or file");
          continue;
        }
        const row = await createNode(
          commandArgs[0],
          commandArgs[1],
          commandArgs[2] == "" ? null : commandArgs[2]
        );
        console.log("Created node", row);
        break;
      case "list":
        if (commandArgs.length != 1) {
          console.log("Invalid command");
          continue;
        }
        const children = await listNodes(commandArgs[0]);
        console.log("Children", children);
        break;
      case "rename":
        if (commandArgs.length != 2) {
          console.log("Invalid command");
          continue;
        }
        await renameNodes(commandArgs[0], commandArgs[1]);
        break;
      case "move":
        if (commandArgs.length != 2) {
          console.log("Invalid command");
          continue;
        }
        await moveNodes(commandArgs[0], commandArgs[1]);

        break;
      case "remove":
        if (commandArgs.length != 1) {
          console.log("Invalid command");
          continue;
        }
        await removeNodes(commandArgs[0]);
        break;
      case "exit":
        console.log("Exiting...");
        rl.close();
        process.exit(0);
        break;
      default:
        console.log("Invalid command");
        break;
    }
    rl.close();
  }

}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});


