import {Guild, GuildScheduledEventEntityType, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, PermissionFlagsBits, SlashCommandBuilder} from "discord.js"
import { config } from "dotenv";
import { getPage } from "../../function/getPage.js";
import { BotCommand, GameJam } from '../../types.js';
const command: BotCommand = {
	cooldown: 2,
	data: new SlashCommandBuilder()
    .setName('jam')
    .setDescription('Create a gamejam with a provided itch.io link')
    .setDefaultMemberPermissions(PermissionFlagsBits.CreateEvents)
    .addStringOption(option =>
		option.setName('link')
			.setDescription('The link to the game jam')
            .setRequired(true)),
    async execute(interaction){
        config()
        const urlString = interaction.options.getString('link', true);
        let url: URL | undefined;
        let gameJam: GameJam | undefined;
        url = new URL(urlString);

        (async () => {
            try {
                gameJam = await getPage(url);
                console.log(gameJam);
                const guild = interaction.guild   
                if (!guild){
                    await interaction.reply({ content: 'This command must be used in a server.', ephemeral: true });
                    return;
                }
                await guild.scheduledEvents.create({
                    name: gameJam.title,
                    scheduledStartTime: gameJam.startDate,
                    scheduledEndTime: gameJam.endDate,
                    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                    entityType: GuildScheduledEventEntityType.External,
                    entityMetadata: {
                      location: url.toString(),
                    },
                    description: `Join us for the ${gameJam.title} game jam!`,
                    image: gameJam.image
                  });
            } catch (err) {
                console.error(err);
            }
            })();

            await interaction.reply({content: `Command executed`, ephemeral: true });
        }
    };

export default command;