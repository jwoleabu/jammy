import {
  Client,
  Collection,
  Events,
  GatewayIntentBits,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "dotenv";
import { fileURLToPath } from "url";
import fs from "fs";
import path from "path";
import { CustomClient, BotCommand } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

config();

const client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildScheduledEvents],
  allowedMentions: { parse: [] },
}) as CustomClient;

client.cooldowns = new Collection();
client.commands = new Collection();
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".js") || file.endsWith("ts"));
  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    import(filePath)
      .then((commandModule) => {
        const command: BotCommand = commandModule.default;
        if ("data" in command && "execute" in command) {
          client.commands.set(command.data.name, command);
        } else {
          console.log(
            `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
          );
        }
      })
      .catch((error) => {
        console.error(`Error importing command from ${filePath}:`, error);
      });
  }
}
console.log("All commands loaded")

const eventsPath = path.join(__dirname, "events");
const eventFiles = fs
  .readdirSync(eventsPath)
  .filter((file) => file.endsWith(".js") || file.endsWith(".ts"));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);

  import(filePath)
    .then((discordEvent) => {
      const event = discordEvent.default;
      if (event.once) {
        client.once(event.name, (...args) => event.execute(...args));
      } else {
        client.on(event.name, (...args) => event.execute(...args));
      }
    })
    .catch((error) => {
      console.error(`Error importing command from ${filePath}:`, error);
    });
}
console.log("All events loaded")


client.login(process.env.TOKEN);