const fs = require('fs');
const games = require('./output.json');

// console.log(games);
let tsv = '';
const keys = Object.keys(games[Object.keys(games)[0]]);

tsv += keys.join('\t');
console.log(tsv);
tsv += '\timg_src';
console.log(tsv);
tsv += '\n';


Object.keys(games).forEach(rowIndex => {
	const row = games[rowIndex];
	for (var i = 0; i < keys.length; i++) {

		let cellData;
		if (keys[i] === 'mechanics' || keys[i] === 'categories') {
			if (!row[keys[i]]) {
				cellData = '';
			} else {
				cellData = row[keys[i]].map(a => a.name).join(',')
			}
		} else {
			cellData = row[keys[i]];
		}

		if (cellData === undefined) {
			cellData = null;
		}

		tsv += String(cellData).replace(/\s+/g, ' ').replace(/(<([^>]+)>)/ig,"").trim().replace(/(\r\n|\n|\r)/gm," ");
		tsv += '\t';
	}

	tsv += `${row.id}.jpg`;
	tsv += '\n';
})

fs.writeFile('output.tsv', tsv, err => {
	if (err) {
		console.log(err); // eslint-disable-line
	}else{
		console.log("output.tsv saved!"); // eslint-disable-line
	}
});
