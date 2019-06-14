const fs = require('fs');
const games = require('./output.json');
const keys = Object.keys(games);
const request = require("request");

const findImage= async id => {
	await page.goto(`https://www.boardgamefinder.net/assets/games/images/${id}.jpg`);
}

const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

function download(uri, filename) {
  request.head(uri, function(err, res, body) {
    request(uri)
    .pipe(fs.createWriteStream(`images/${filename}`))
    .on("close", () => {
			console.log(`${filename} saved.`)
		});
 });
}

(async () => {
  for (var i = 0; i < keys.length; i++) {
    await download(`https://www.boardgamefinder.net/assets/games/images/${keys[i]}.jpg`, `${keys[i]}.jpg`)
		await timeout(1000);
  }
})();
