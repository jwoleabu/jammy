import { firefox } from 'playwright';
import cheerio from 'cheerio';
import { GameJam } from '../types.js';
import { get } from 'http';


export async function getPage(url: URL) {
    const browser = await firefox.launch({
  
    });
    const page = await browser.newPage();
    await page.goto(url.toString());
    const html = await page.content()
    const gameJam = extract(html, url);
    await browser.close();
    return gameJam;
}
  
  async function extract(pageHtml: string, url: URL){
    const $ = cheerio.load(pageHtml);
    const dates = $('.date_data span');
    const startDate = convertToDate($(dates[0]).text());
    const endDate = convertToDate($(dates[1]).text());
    const title = $('.jam_title_header a').text();
    const joined = $('.stat_box').attr("title");
    console.log(joined);

    let base64Image: string | undefined = undefined;


    const imageUrl = $('.jam_banner').attr('src')
    if (imageUrl){
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    const arrayBuffer = await response.arrayBuffer();
    const imageBuffer = Buffer.from(arrayBuffer);
    base64Image = `data:image/png;base64,${imageBuffer.toString('base64')}`;
  }

    const hosts = $('.jam_host_header a');
    hosts.each((index, element) => {
      console.log($(element).text());
    });
    const gameJam = new GameJam(title, startDate, endDate, url, base64Image);
    // console.log(gameJam)
    return gameJam
}

function convertToDate(dateString: string): Date {
  const regex = /(\w+ \d{1,2}[a-z]{2} \d{4}) at (\d{1,2}:\d{2} \w{2})/;
  const match = dateString.match(regex);

  if (!match) {
      throw new Error('Invalid date format');
  }

  const [_, datePart, timePart] = match;

  const dateWithoutSuffix = datePart.replace(/(\d{1,2})[a-z]{2}/, '$1');

  const dateTimeString = `${dateWithoutSuffix} ${timePart}`;

  const dateObject = new Date(dateTimeString);

  if (isNaN(dateObject.getTime())) {
      throw new Error('Failed to parse date');
  }

  return dateObject;
}
