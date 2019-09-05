const XLSX = require('xlsx')
const TSV = require("node-tsv-json");
const fs = require('fs');
const workbook = XLSX.readFile('original-data-set.xls');

const columnMap = {
	name: 'A',
	year: 'B',
	gdp_per_capita: 'D',
	social_support: 'E',
	healthy_life_expectancy: 'F',
	freedom: 'G',
	generosity: 'H',
	corruption: 'I',
	positive_affect: 'J',
	negative_affect: 'K'
}

const initData = () => {
	const targetYear = 2018;
	const sheet = workbook.Sheets['Table2.1']
	const data = {};

	let rowExists = true;
	let i = 2; // skip the header row by starting at index 2 (index starts from 1)
	while (rowExists) {
		if (!sheet[`${columnMap['name']}${i}`]) {
			rowExists = false;
			break;
		}

		if (parseInt(sheet[`${columnMap['year']}${i}`].v) !== 2018) {
			i++;
			continue; // skip any year that is not 2018
		}

		const countryName = sheet[`${columnMap['name']}${i}`].v.toLowerCase().replace(' ', '_');
		data[countryName] = {};
		// get important data from sheet
		for (let col in columnMap) {
			const cell = sheet[`${columnMap[col]}${i}`];
			data[countryName][col] = cell ? cell.v : null;
		}
		i++;
	}

	return data;
}

const getHappiness = data => {
	const sheet = workbook.Sheets['Figure2.6'];

	let rowExists = true;
	let i = 2;
	while (rowExists) {
		if (!sheet[`A${i}`]) {
			rowExists = false;
			break;
		}

		const countryData = data[sheet[`A${i}`].v.toLowerCase().replace(' ', '_')]
		if (countryData) {
			countryData['happiness'] = sheet[`B${i}`].v;
			countryData['happiness_explained_by_gdp_per_capita'] = sheet[`F${i}`].v;
			countryData['happiness_explained_by_social_support'] = sheet[`G${i}`].v;
			countryData['happiness_explained_by_life_expectancy'] = sheet[`H${i}`].v;
			countryData['happiness_explained_by_freedom'] = sheet[`I${i}`].v;
			countryData['happiness_explained_by_generocity'] = sheet[`J${i}`].v;
			countryData['happiness_explained_by_corruption'] = sheet[`K${i}`].v;
		}

		i++;
	}

	return data;
}

const getChangesInHappiness = data => {
	const sheet = workbook.Sheets['Figure2.7'];

	let rowExists = true;
	let i = 2;
	while (rowExists) {
		if (!sheet[`A${i}`]) {
			rowExists = false;
			break;
		}

		const countryData = data[sheet[`A${i}`].v.toLowerCase().replace(' ', '_')]
		if (countryData) {
			countryData['change_in_happiness'] = sheet[`B${i}`].v;
		}

		i++;
	}

	return data;
}

const getOtherCountryData = async data => {
	return new Promise((resolve, reject) => {
		TSV({ input: 'nations.tsv', parseRows: true }, (err, tsvData) => {
			for (let i = 0; i < tsvData.length; i++) {
				const countryData = data[tsvData[i][1].trim().toLowerCase().replace(' ', '_')];
				if (countryData) {
					countryData['image'] = tsvData[i][2];
					countryData['system_of_government'] = tsvData[i][13];
					countryData['incarceration_rates'] = tsvData[i][15];
					countryData['location'] = tsvData[i][19];
				}
			}

			resolve(data);
		});
	})
}

const main = async () => {
	let data = initData();
	data = getHappiness(data);
	data = getChangesInHappiness(data);
	data = await getOtherCountryData(data);

	fs.writeFileSync('output-data.json', JSON.stringify(data));
	return data;
}

main();
