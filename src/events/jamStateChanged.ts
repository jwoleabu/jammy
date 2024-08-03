import {
  Client,
  Events,
  GuildScheduledEvent,
  GuildScheduledEventStatus,
  User,
} from "discord.js";

export default {
  name: Events.GuildScheduledEventUpdate,
  async execute(
    guildScheduledEvent: GuildScheduledEvent,
    newGuildScheduledEvent: GuildScheduledEvent
  ) {
    if (!guildScheduledEvent.client?.user) {
      console.error("Client is not properly logged in.");
      return;
    }
    const guild = guildScheduledEvent.guild;
    if (!guild) {
      return;
    }
    const roleManager = guild.roles;
    const jamRole = roleManager.cache.find(
      (role) => role.name === guildScheduledEvent.name
    );
    if (!jamRole || jamRole.client !== guildScheduledEvent.client) {
      return;
    }
    if (guildScheduledEvent.name !== newGuildScheduledEvent.name) {
      await jamRole.setName(
        newGuildScheduledEvent.name,
        "The event name changed so the role has been updated"
      );
      console.log(
        `scheduled event ${newGuildScheduledEvent.name} has name changed, ${jamRole.name} role has been changed`
      );
    }
    if (newGuildScheduledEvent.status === GuildScheduledEventStatus.Completed) {
      await jamRole.delete();
      console.log("The jam is complete, role deleted");
    }

    console.log("Event change detected");
    console.log(
      `${guildScheduledEvent.name} to ${newGuildScheduledEvent.name}`
    );
    console.log(`${newGuildScheduledEvent.status.toString()}`);
  },
};
