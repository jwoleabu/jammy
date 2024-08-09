import { REST, Routes, SlashCommandBuilder } from 'discord.js';
import { fileURLToPath } from 'url';
import { config } from 'dotenv';


import fs from 'fs';
import path from 'path';
import { BotCommand } from '../types.js';
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const commands : ReturnType<SlashCommandBuilder['toJSON']>[] = [];
const parentDir = path.resolve(__dirname, '..');
const foldersPath = path.join(parentDir, 'commands');
console.log(foldersPath)
const commandFolders = fs.readdirSync(foldersPath);

const loadCommands = async () => {
    for (const folder of commandFolders) {
        const commandsPath = path.join(foldersPath, folder);
        const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js') || file.endsWith('ts'));

        const imports = commandFiles.map(async (file) => {
            const filePath = path.join(commandsPath, file);
            try {
                const command : BotCommand = await import(filePath).then(mod => mod.default);
                console.log(command)
                if ('data' in command && 'execute' in command) {
                    commands.push(command.data.toJSON());
                } else {
                    console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
                }
            } catch (error) {
                console.error(`Error importing command from ${filePath}:`, error);
            }
        });

        await Promise.all(imports);
    }
};

let rest = new REST().setToken(process.env.TOKEN as string);


const deployCommands = async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationGuildCommands(process.env.CLIENTID as string, process.env.SERVERID as string),
            { body: commands }
        );

        console.log(`Successfully reloaded ${(data as object[]).length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }
};

(async () => {
    await loadCommands();
    await deployCommands();
})();