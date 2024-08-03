import {
  Client,
  Events,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
  User,
} from "discord.js";

export default {
  name: Events.GuildScheduledEventDelete,
  async execute(guilscheduledEvent: GuildScheduledEvent) {
    if (!guilscheduledEvent.client?.user) {
      console.error("Client is not properly logged in.");
      return;
    }
    const guild = guilscheduledEvent.guild;
    if (!guild) {
      return;
    }
    const roleManager = guild.roles;
    const jamRole = roleManager.cache.find(
      (role) => role.name === guilscheduledEvent.name
    );
    if (!jamRole || jamRole.client !== guilscheduledEvent.client) {
      return;
    }
    await jamRole.delete();
    console.log(`scheduled event ${guilscheduledEvent.name} has been cancelled, the role ${jamRole.name} has been deleted`);
  }
};
