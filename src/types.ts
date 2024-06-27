import { ChatInputCommandInteraction, Client, Collection, SlashCommandOptionsOnlyBuilder } from 'discord.js';

export interface CustomClient extends Client {
  cooldowns: Collection<string, Collection<any, any>>;
  commands: Collection<string, BotCommand>;
}

export interface BotCommand {
  cooldown: number;
  data: SlashCommandOptionsOnlyBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export class GameJam {
  title: string;
  startDate: Date;
  endDate: Date;
  link: URL;
  image: string | undefined;

  constructor(title: string, startDate: Date, endDate: Date, link: URL, image: string | undefined) {
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.link = new URL(link);
    this.image = image;
  }

  toString(): string {
    return `GameJam: ${this.title}\nStart Date: ${this.startDate}\nEnd Date: ${this.endDate}\nLink: ${this.link.href}`;
  }
}
