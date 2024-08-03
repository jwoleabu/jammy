import { Client, Events, GuildScheduledEvent, User } from "discord.js";

export default {
	name: Events.GuildScheduledEventUserRemove,
	async execute(guilscheduledEvent: GuildScheduledEvent, user: User) {
        if (!guilscheduledEvent.client?.user) {
            console.error("Client is not properly logged in.");
            return;
        }
        const guild = guilscheduledEvent.guild;
        if(!guild){
            console.log("No guild");
            return;
        }
        const roleManager = guild.roles;
        console.log(`${guilscheduledEvent.name} has interaction removed by ${user.tag}`)
        const jamRole = roleManager.cache.find(role => role.name === guilscheduledEvent.name);
        if(!jamRole || jamRole.client !== guilscheduledEvent.client){
            return;
        }
        const member = await guild.members.fetch(user.id)
        member.roles.remove(jamRole)
		console.log(`${user.tag} has been removed from the scheduled event ${guilscheduledEvent.name} `);
	},
};