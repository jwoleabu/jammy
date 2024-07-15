import {Guild, GuildScheduledEventEntityType, GuildScheduledEventManager, GuildScheduledEventPrivacyLevel, PermissionFlagsBits, SlashCommandBuilder} from "discord.js"
import { config } from "dotenv";
import { type BotCommand, GameJam, DataScraper } from '../../types.js';
import { firefox } from "playwright";
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
        let gameJam: GameJam;
        url = new URL(urlString);

        const guild = interaction.guild   
        if (!guild){
            await interaction.reply({ content: 'This command must be used in a server.', ephemeral: true });
            return;
        }
        interaction.deferReply();
        const browser = await firefox.launch();
        const datascraper = new DataScraper(browser);
        const jam = await datascraper.getPage(url);

        if(jam != undefined){
            try{
                await guild.scheduledEvents.create({
                    name: jam.title,
                    scheduledStartTime: jam.startDate,
                    scheduledEndTime: jam.endDate,
                    privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
                    entityType: GuildScheduledEventEntityType.External,
                    entityMetadata: {
                        location: url.toString(),
                    },
                    description: `Join us for the ${jam.title} game jam!`,
                    image: jam.image
                });
            }
            catch(error){
                throw new Error("Error creating guild event",error as Error)
            }
            finally{
                await interaction.followUp({content: `Command complete`, ephemeral: true });
            }
        }
        }
    };

export default command;