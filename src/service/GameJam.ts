import {
  GuildScheduledEventEntityType,
  GuildScheduledEventPrivacyLevel,
  GuildScheduledEventStatus,
} from "discord.js";

export class GameJam {
  title: string;
  startDate: Date;
  endDate: Date;
  link: URL;
  image: string | undefined;
  state: GuildScheduledEventStatus;

  constructor(
    title: string,
    startDate: Date,
    endDate: Date,
    link: URL,
    image: string | undefined
  ) {
    this.title = title;
    this.startDate = startDate;
    this.endDate = endDate;
    this.link = new URL(link);
    this.image = image;
    this.state = this.resolveState();
  }

  private resolveState() {
    if (new Date() > this.startDate) {
      return GuildScheduledEventStatus.Active;
    } else if (new Date() > this.endDate) {
      return GuildScheduledEventStatus.Completed;
    }
    return GuildScheduledEventStatus.Scheduled;
  }

  toScheduledEvent(timeOverride: boolean = false) {
    const activeEventDate = new Date();
    activeEventDate.setSeconds(activeEventDate.getSeconds() + 30);
    return {
      name: this.title,
      scheduledStartTime: timeOverride
        ? activeEventDate
        : this.startDate,
      scheduledEndTime: this.endDate,
      privacyLevel: GuildScheduledEventPrivacyLevel.GuildOnly,
      entityType: GuildScheduledEventEntityType.External,
      entityMetadata: {
        location: this.link.href,
      },
      description: `Join us for the ${this.title} game jam!`,
      image: this.image,
    };
  }

  toString(): string {
    return `GameJam: ${this.title}\nStart Date: ${this.startDate}\nEnd Date: ${this.endDate}\nLink: ${this.link.href}`;
  }
}
