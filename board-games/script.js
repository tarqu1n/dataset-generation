const fs = require('fs');
const puppeteer = require('puppeteer');

let breakLoop = false;
let gameData = {};
let totalSaves = 0;
let totalItems = 0;
let timeForLoop = (Date.now() / 1000).toFixed(2);
function storeData(data) {
  let foundThisLoop = 0;

  for (var i = 0; i < data.length; i++) {
    if (!gameData[data[i].id]) {
      foundThisLoop++;
      gameData[data[i].id] = data[i];
    }
  }

  if (foundThisLoop === 0) {
    breakLoop = true;
  }

  fs.writeFile('output.json', JSON.stringify(gameData), err => {
    if (err) {
      console.log(err); // eslint-disable-line
    }else{
      totalSaves++;
      totalItems += foundThisLoop;
      const now = (Date.now() / 1000).toFixed(2);
      console.log(`output.json saved ${foundThisLoop} new items. Total saves: ${totalSaves}! Total items: ${totalItems}. Time for loop: ${now - timeForLoop}`);
      timeForLoop = now;
    }
  });
}

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  // Allows you to intercept a request; must appear before your first page.goto()
  await page.setRequestInterception(true);

  // Request intercept handler... will be triggered with
  // each page.goto() statement
  page.on('request', interceptedRequest => {
      interceptedRequest.continue();
  });

  page.on('response', response => {
    if (response.url().endsWith("/ajax/popular_games") || response.url().endsWith("ajax/recommend"))

      response.json().then(data => {
        if (Array.isArray(data)) {
          storeData(data);
        } else if (data.games) {
          storeData(data.games);
        }
      });
      // do something here
  });

  await page.goto('https://www.boardgamefinder.net/');

  while(!breakLoop) {
    let previousHeight = await page.evaluate('document.body.scrollHeight');
    await page.evaluate('window.scrollTo(0, document.body.scrollHeight)');
    await page.waitForFunction(`document.body.scrollHeight > ${previousHeight}`);
    await page.waitFor(3000);
  }
})();
