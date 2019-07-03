const tsv = require("node-tsv-json");
const puppeteer = require('puppeteer');
const fs = require('fs');

const loadTsv = () => {
  return new Promise((resolve, reject) => {
    tsv({
      input: "output2.tsv",
      output: "output.json",
      parseRows: true
    }, (err, result) => {
      if(err) {
        throw new Error(err);
        reject(err);
      }else {
        resolve(result);
      }
    });
  });
}

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

const findImage = async (row, page) => {
  const name = row[2].replace(/ /gi, "+");
  const fileName = row[1];
  await page.goto(`https://www.google.co.uk/search?rlz=1C1CHBF_en-GBGB787GB787&biw=1920&bih=947&tbm=isch&sa=1&ei=qT8iW7qGNeebgAb1prnIAQ&q=dungeons+and+dragons+${name}&oq=dungeons+and+dragons+${name}`);
  let base64 = await page.evaluate(() => document.querySelector('#rg_s .rg_bx:first-child img').getAttribute('src'));
  let data = base64.replace(/^data:image\/\w+;base64,/, "");
  let buf = new Buffer(data, 'base64');
  await fs.writeFile(`images/${fileName}`, buf, err => {
    if (err){ console.log(err); }
  });
  console.log(`${fileName} written`);
  await timeout(1500);
}

(async () => {
  const data = await loadTsv();
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  for (var i = 1; i < data.length; i++) {
    await findImage(data[i], page);
  }
})();
