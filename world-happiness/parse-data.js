const XLSX = require('xlsx')
const TSV = require("node-tsv-json");
const fs = require('fs');
const workbook = XLSX.readFile('original-data-set.xls');

const round_to_dp = (x, dp = 0) => {
    return Math.round( x * Math.pow(10, dp) ) / Math.pow(10, dp)
}

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

const buildData = () => {
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
		const countryName = sheet[`${columnMap['name']}${i}`].v.toLowerCase().split(' ').join('_');

		if (data[countryName] && parseInt(data[countryName].year) > parseInt(sheet[`${columnMap['year']}${i}`].v)) {
			i++;
			continue;
		}

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

		const countryData = data[sheet[`A${i}`].v.toLowerCase().split(' ').join('_')]
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

		const countryData = data[sheet[`A${i}`].v.toLowerCase().split(' ').join('_')]
		if (countryData) {
			countryData['change_in_happiness'] = sheet[`B${i}`].v;
		}

		i++;
	}

	return data;
}
const cullIncomplete = data => {
  for (let key in data) {
		if (!data[key].happiness) {
      delete data[key];
    }
	}

  return data;
}
const getOtherCountryData = async data => {
	return new Promise((resolve, reject) => {
		TSV({ input: 'nations.tsv', parseRows: true }, (err, tsvData) => {
			for (let i = 0; i < tsvData.length; i++) {

        let countryName = tsvData[i][1].trim().toLowerCase().split(' ').join('_')
        //map country names
        if (countryName === 'hong_kong') countryName = 'hong_kong_s.a.r._of_china';
        if (countryName === 'taiwan') countryName = 'taiwan_province_of_china';
        if (countryName === 'palestine') countryName = 'palestinian_territories';

				const countryData = data[countryName];
				if (countryData) {
					countryData['image'] = tsvData[i][2];
					countryData['system_of_government'] = tsvData[i][13];
					countryData['incarceration_rates'] = tsvData[i][15];
					countryData['location'] = tsvData[i][19];
				}

        if (countryName === 'congo_republic') {
          data['congo_(brazzaville)']['image'] = tsvData[i][2];
					data['congo_(brazzaville)']['system_of_government'] = tsvData[i][13];
					data['congo_(brazzaville)']['incarceration_rates'] = tsvData[i][15];
					data['congo_(brazzaville)']['location'] = tsvData[i][19];
          data['congo_(kinshasa)']['image'] = tsvData[i][2];
					data['congo_(kinshasa)']['system_of_government'] = tsvData[i][13];
					data['congo_(kinshasa)']['incarceration_rates'] = tsvData[i][15];
					data['congo_(kinshasa)']['location'] = tsvData[i][19];
        }
			}

      for (let key in data) {
        if (!data[key]['image']) data[key]['image'] = `${key}.jpg`;
        if (!data[key]['system_of_government']) data[key]['system_of_government'] = null;
        if (!data[key]['incarceration_rates']) data[key]['incarceration_rates'] = null;
        if (!data[key]['location']) data[key]['location'] = null;
      }

			resolve(data);
		});
	})
}

const formatData = data => {
  for (let i = 0; i < data.length; i++) {
    data[i].gdp_per_capita = round_to_dp(data[i].gdp_per_capita, 2);
    data[i].social_support = round_to_dp(data[i].social_support, 2);
    data[i].healthy_life_expectancy = round_to_dp(data[i].healthy_life_expectancy, 1);
    data[i].freedom = round_to_dp(data[i].freedom, 3);
    data[i].generosity = round_to_dp(data[i].generosity, 3);
    data[i].corruption = round_to_dp(data[i].corruption, 3);
    data[i].positive_affect = round_to_dp(data[i].positive_affect, 3);
    data[i].negative_affect = round_to_dp(data[i].negative_affect, 3);

    data[i].happiness = round_to_dp(data[i].happiness, 2);
    data[i].happiness_explained_by_gdp_per_capita = round_to_dp(data[i].happiness_explained_by_gdp_per_capita, 2);
    data[i].happiness_explained_by_social_support = round_to_dp(data[i].happiness_explained_by_social_support, 2);
    data[i].happiness_explained_by_life_expectancy = round_to_dp(data[i].happiness_explained_by_life_expectancy, 2);
    data[i].happiness_explained_by_freedom = round_to_dp(data[i].happiness_explained_by_freedom, 2);
    data[i].happiness_explained_by_generocity = round_to_dp(data[i].happiness_explained_by_generocity, 2);
    data[i].happiness_explained_by_corruption = round_to_dp(data[i].happiness_explained_by_corruption, 2);
  }

  return data;
}
const main = async () => {
	let data = buildData();
	data = getHappiness(data);
	data = getChangesInHappiness(data);
  data = cullIncomplete(data);

	data = await getOtherCountryData(data);

	let arrData = [];
	for (let key in data) {
		arrData.push(data[key]);
	}

  arrData = formatData(arrData);

	fs.writeFileSync('output-data.json', JSON.stringify(arrData));
  console.log(`output-data.json written with ${arrData.length} items`);

  const converter = require('json-2-csv');
  converter.json2csv(arrData, (err, csv) => {
      if (err) console.log(err);

      fs.writeFileSync('output-data.csv', csv);
      console.log(`output-data.csv written with ${arrData.length} items`);
  })

  	return data;
}

main();
