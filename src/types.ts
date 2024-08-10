import {
  GuildScheduledEventManager,
  type ChatInputCommandInteraction,
  type Client,
  type Collection,
  type Guild,
  type SlashCommandOptionsOnlyBuilder,
} from "discord.js";

export interface CustomClient extends Client {
  cooldowns: Collection<string, Collection<any, any>>;
  commands: Collection<string, BotCommand>;
}

export interface BotCommand {
  cooldown: number;
  data: SlashCommandOptionsOnlyBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

export class URLValidator {
  private examinedString: string;

  constructor(inputString: string) {
    this.examinedString = inputString;
  }

  public validateUrl(): boolean {
    try {
      new URL(this.examinedString);
      return true;
    } catch (error) {
      return false;
    }
  }
}

export class HostnameValidator {
  private allowedHosts: { [key: string]: string };
  constructor(allowedHosts: { [key: string]: string }) {
    this.allowedHosts = allowedHosts;
  }

  public validateHostname(url: URL): boolean {
    try {
      const hostname = url.hostname;
      const pathname = url.pathname;

      if (this.allowedHosts.hasOwnProperty(hostname)) {
        const validPath = this.allowedHosts[hostname];
        return pathname.startsWith(validPath as string);
      }
    } catch (error) {}
    return false;
  }
}

export class GuildScheduledEventFactory {
  public static create(guild: Guild): GuildScheduledEventManager {
    return guild.scheduledEvents;
  }
}

export class Host
{  
  private name : string;
  
  constructor(name: string){
  this.name = name
  }
}
