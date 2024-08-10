import {
  GuildScheduledEventStatus,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";
import { config } from "dotenv";
import { DataScraper } from "../../service/DataScraper.js";
import { GameJam } from "../../service/GameJam.js";
import {
  type BotCommand,
  URLValidator,
  HostnameValidator,
  GuildScheduledEventFactory,
} from "../../types.js";
import { firefox } from "playwright";
const command: BotCommand = {
  cooldown: 2,
  data: new SlashCommandBuilder()
    .setName("jam")
    .setDescription("Create a gamejam with a provided itch.io link")
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents)
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription("The link to the game jam")
        .setRequired(true)
    ),
  async execute(interaction) {
    config();
    const urlString = interaction.options.getString("link", true);
    const urlValidator = new URLValidator(urlString);

    if (!urlValidator.validateUrl()) {
      await interaction.reply({
        content: "The link provided is invalid",
        ephemeral: true,
      });
      return;
    }
    const url = new URL(urlString);

    const validHostnames = {
      "itch.io": "/jam",
    };
    const hostnameValidator = new HostnameValidator(validHostnames);
    if (!hostnameValidator.validateHostname(url)) {
      console.log(
        `comparing ${url.hostname} and ${url.pathname} to the required ${validHostnames["itch.io"]}`
      );
      await interaction.reply({
        content: "The link provided is not supported",
        ephemeral: true,
      });
      return;
    }

    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({
        content: "This command must be used in a server",
        ephemeral: true,
      });
      return;
    }

    interaction.deferReply();
    const browser = await firefox.launch();
    const datascraper = new DataScraper(browser);
    const jam = await datascraper.getPage(url);

    if (jam != undefined) {
      const scheduledEventsManager = GuildScheduledEventFactory.create(guild);
      const roleManager = guild.roles;
      try {
        switch (jam.state) {
          case GuildScheduledEventStatus.Scheduled:
            console.log(`jam is scheduled ${jam.state}`);
            await scheduledEventsManager.create(jam.toScheduledEvent());
            break;
          case GuildScheduledEventStatus.Active:
            console.log(`jam is active ${jam.state}`);
            await scheduledEventsManager.create(jam.toScheduledEvent(true));
            break;
          case GuildScheduledEventStatus.Completed:
            console.log(`jam is completed ${jam.state}`);
            await interaction.followUp(`THe gamejam ${jam.title} has ended :/`);
            return;
        }
      } catch (error) {
        throw new Error("Error creating guild event", error as Error);
      }
      try {
        await roleManager.create({
          name: jam.title,
        });
      } catch (error) {
        throw new Error("Error creating guild event", error as Error);
      } finally {
        await interaction.followUp(
          `Command run sucessfuly, the gamejam ${jam.title} was created`
        );
      }
    }
  },
};

export default command;
