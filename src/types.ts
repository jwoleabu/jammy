import type { ChatInputCommandInteraction, Client, Collection, SlashCommandOptionsOnlyBuilder } from 'discord.js';
import { Browser, Page, ElementHandle } from 'playwright';
import cheerio from 'cheerio';

export interface CustomClient extends Client {
  cooldowns: Collection<string, Collection<any, any>>;
  commands: Collection<string, BotCommand>;
}

export interface BotCommand {
  cooldown: number;
  data: SlashCommandOptionsOnlyBuilder;
  execute(interaction: ChatInputCommandInteraction): Promise<void>;
}

enum JamState{
  Upcoming,
  Started,
  Voting,
  Complete
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

export class DataScraper {
  browser : Browser
  constructor(browser: Browser) {
      this.browser = browser;
  }
  async getPage(url: URL) {
      const page = await this.browser.newPage();
      try{
          await page.goto(url.href)

          const banner = await page.$('.jam_banner_outer');
          if (banner){
              const width: number | undefined = await this.analyseDimensions(banner)
              await page.addStyleTag({ content: `
                  .jam_banner_outer {
                      width: ${width};
                  }
              ` });
          }

          const screenshot = await this.base64Screen(page);
          const base64Image = `data:image/png;base64,${screenshot}`;
          const html = await page.content()

          const $ = cheerio.load(html);
          const dates = $('.date_data span');
          const startDate = this.convertToDate($(dates[0]).text());
          const endDate = this.convertToDate($(dates[1]).text());
          const title = $('.jam_title_header a').text();
          const joined = $('.stat_box').attr("title");

          return new GameJam(title, startDate, endDate, url, base64Image)
      }
      catch(error){
          console.error("Error navigating to the page or processing it:", error);
      }
      finally{
          await page.close();
          await this.browser.close();
      }

  }

  private async base64Screen(page: Page){
      const buffer = await page.locator('.jam_banner_outer').screenshot({ path: `picture.png`});
      const outputString = buffer.toString('base64')
      return outputString;
  }
  
  private async analyseDimensions(element: ElementHandle<SVGElement | HTMLElement>){
      try {
          const elementBox = await element.boundingBox();
  
          if (!elementBox) {
              throw new Error("Unable to retrieve the bounding box of the element.");
          }
  
          const aspectRatio = elementBox.width / elementBox.height;
          const newWidth = elementBox.height*2.5
          console.log(`Aspect Ratio: ${aspectRatio}`);
          
          return newWidth;
      } catch (error) {
          console.error("Error analysing dimensions:", error);
          //maybe throw error up callstack
      }
  }

  private convertToDate(dateString: string): Date {
      const regex = /(\w+ \d{1,2}[a-z]{2} \d{4}) at (\d{1,2}:\d{2} \w{2})/;
      const match = dateString.match(regex);
    
      if (!match) {
          throw new Error('Invalid date format');
      }
    
      const [_, datePart, timePart] = match;
    
      const dateWithoutSuffix = (datePart as string).replace(/(\d{1,2})[a-z]{2}/, '$1');
    
      const dateTimeString = `${dateWithoutSuffix} ${timePart}`;
    
      const dateObject = new Date(dateTimeString);
    
      if (isNaN(dateObject.getTime())) {
          throw new Error('Failed to parse date');
      }
    
      return dateObject;
    }
}