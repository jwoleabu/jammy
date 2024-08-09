import { Client, Events, GuildScheduledEvent, User } from "discord.js";

export default {
  name: Events.GuildScheduledEventUserAdd,
  async execute(guilscheduledEvent: GuildScheduledEvent, user: User) {
    if (!guilscheduledEvent.client?.user) {
      console.error("Client is not properly logged in.");
      return;
    }
    const guild = guilscheduledEvent.guild;
    if (!guild) {
      return;
    }
    if (guilscheduledEvent.partial) {
      guilscheduledEvent
        .fetch()
        .then((fullGuildScheduledEvent) => {
          guilscheduledEvent = fullGuildScheduledEvent;
          console.log(
            `complete from partial fetched ${fullGuildScheduledEvent.name}`
          );
        })
        .catch((error) => {
          console.log(
            "Something went wrong when fetching the guild scheduled event",
            error
          );
        });
    }
    if (user.partial) {
      user
        .fetch()
        .then((fullUser) => {
          user = fullUser;
          console.log(`complete from partial fetched ${fullUser.tag}`);
        })
        .catch((error) => {
          console.log("Something went wrong when fetching the user", error);
        });
    }
    const roleManager = guild.roles;
    console.log(
      `${guilscheduledEvent.name} has interaction add by ${user.tag}`
    );
    const jamRole = roleManager.cache.find(
      (role) => role.name === guilscheduledEvent.name
    );
    if (!jamRole || jamRole.client !== guilscheduledEvent.client) {
      return;
    }
    const member = await guild.members.fetch(user.id);
    member.roles.add(jamRole);
    console.log(
      `${user.tag} has been added to the scheduled event ${guilscheduledEvent.name} `
    );
  },
};
