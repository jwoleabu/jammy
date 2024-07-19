import { firefox } from 'playwright';
import cheerio from 'cheerio';
import { GameJam } from '../types.js';
import { changeAspectRatio } from './cropImage.js';


export async function getPage(url: URL) {
    let img: string|undefined = undefined;
    const browser = await firefox.launch({
  
    });
    const page = await browser.newPage();
    try {
      await page.goto(url.href);

      await page.evaluate(async () => {
          const banner = await page.$('.jam_banner_outer');
          if (banner) {
              const bannerBox = await banner.boundingBox();
              const style = document.createElement('style');
              if (bannerBox){
                  if (bannerBox.height > bannerBox.width * 2.5){
                      style.textContent = `.jam_banner_outer { width: ${bannerBox.height * 2.5}px !important; }`;
                      document.head.appendChild(style);
                      const buffer = await page.locator('.jam_banner_outer').screenshot();
                      img = buffer.toString('base64');
                  }
            }
          }
    });
    await page.goto(url.toString());
    const html = await page.content()
    const gameJam = extract(html, url, img);
    return gameJam;
  } catch (error: any) {
    console.error(`Error occurred: ${(error as Error).message}`);
  }
finally {
  await browser.close();
}


}
  
  async function extract(pageHtml: string, url: URL, img: string|undefined){
    const $ = cheerio.load(pageHtml);
    const dates = $('.date_data span');
    let startDate = convertToDate($(dates[0]).text());
    const endDate = convertToDate($(dates[1]).text());
    const title = $('.jam_title_header a').text();
    const joined = $('.stat_box').attr("title");
    console.log(joined);

    // let base64Image: string | undefined = undefined;


    // const imageUrl = $('.jam_banner').attr('src')
    // if (imageUrl){
    // const response = await fetch(imageUrl);
    // if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`)
    
    // const arrayBuffer = await response.arrayBuffer();
    // const imageBuffer = await changeAspectRatio(Buffer.from(arrayBuffer), 800, 320);
    // base64Image = `data:image/png;base64,${(imageBuffer as Buffer).toString('base64')}`;
  // }

    const hosts = $('.jam_host_header a');
    hosts.each((index, element) => {
      console.log($(element).text());
    });
    const gameJam = new GameJam(title, startDate, endDate, url, img);
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

  const dateWithoutSuffix = (datePart as string).replace(/(\d{1,2})[a-z]{2}/, '$1');

  const dateTimeString = `${dateWithoutSuffix} ${timePart}`;

  const dateObject = new Date(dateTimeString);

  if (isNaN(dateObject.getTime())) {
      throw new Error('Failed to parse date');
  }

  return dateObject;
}
