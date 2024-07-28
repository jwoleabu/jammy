import { Client, Events } from "discord.js";

export default {
	name: Events.ClientReady,
	once: true,
	execute(client: Client) {
        if (!client.user) {
            console.error("Client is not properly logged in.");
            return;
        }
		console.log(`Bot online as ${client.user.tag}`);
	},
};