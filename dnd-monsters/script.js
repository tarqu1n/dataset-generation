const fs = require('fs');
const parseXml = require('xml2js').parseString;
const puppeteer = require('puppeteer');

const loadImages = false;
const saveDataFile = true;

files = fs.readdirSync('./sources');

let origional = [];
let result = [];
let count = 0;
let names = [];

files.forEach((file) => {
  let res;
  const fileData = parseXml(fs.readFileSync(`./sources/${file}`, 'utf8'), (err, res) => {
    console.log(file);
    if (err) { throw new Error(err) }
    res.compendium.monster.forEach(datum => {
      res = parseEntry(datum);
      if (names.indexOf(res.name) === -1) {
        names.push(res.name);
        result.push(res);
        count++;
        origional.push(datum);
      }
    })
  });
});

function parseEntry (data) {
  let hpDice = data.hp[0].split(' ')[1] || '';
  if (hpDice) {
    hpDice = hpDice.replace(/[\(\)]/g, '').trim()
  }

  let armourSplit = data.ac[0].split('(')
  let armourType = armourSplit[1] ? armourSplit[1].replace(/[\(\)]/g, '').trim() : '';
  if (armourType.indexOf(' with ') !== -1){
    armourType = '';
  }

  let sourceSplit = data.type[0].split(',');
  let source = sourceSplit[sourceSplit.length - 1].trim();

  let type = data.type[0].split(/[\,\(]/g).map(x => x.replace(/[\(\)]/g, '').trim());
  type.splice(type.length - 1, 1);
  type = type.join(', ').toLowerCase();

  let cr = data.cr[0];
  if (cr === '1/2') { cr = 0.5; }
  else if (cr === '1/4') { cr = 0.25; }
  else if (cr === '1/8') { cr = 0.125; }

  return {
    id: data.name[0].toLowerCase().replace(/\((.+?)\)/g, '').trim().replace(/\s/g, "_"),
    image_src: data.name[0].toLowerCase().replace(/\,/g, '').replace(/[\s\/]/g, '_') + '.png',
    name: data.name[0].replace(/\((.+?)\)/g, '').replace(/\,/g, '').trim(),
    size: getSize(data.size[0]),
    type: type,
    speed: data.speed[0].replace(/\./g, ''),
    source: source.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    alignment: data.alignment[0],
    ac: Number(data.ac[0].split(' ')[0]),
    armour_type: armourType,
    hp: Number(data.hp[0].split(' ')[0]),
    hp_dice: hpDice,
    strength: Number(data.str[0]),
    dexterity: Number(data.dex[0]),
    constitution: Number(data.con[0]),
    intelligence: Number(data.int[0]),
    wisdom: Number(data.wis[0]),
    charisma: Number(data.cha[0]),
    skill: data.skill ? data.skill.join(',') : '',
    vulnerable: data.vulnerable ? data.vulnerable[0] : '',
    save: data.save ? data.save[0].toLowerCase() : '',
    passive_perception: Number(data.passive[0]),
    immune_to: data.immune ? data.immune[0].replace('and ', '') : '',
    condition_immune: data.conditionImmune ? data.conditionImmune[0] : '',
    languages: data.languages ? getLanguages(data.languages[0]) : '',
    challenge_rating: cr,
    senses: data.senses ? data.senses[0].replace(/\./g, '') : '',
    resistances: data.resist ? getResist(data.resist[0]) : '',
    spells: data.spells ? data.spells[0] : '',
    spell_slots: data.slots ? data.slots[0] : '',
    traits: data.trait ? getTraits(data.trait) : '',
    actions: data.action ? getActions(data.action) : '',
    reactions: data.reaction ? getActions(data.reaction) : '',
    legendary: data.legendary ? getActions(data.legendary) : '',
  }
}

function getSize (size) {
  switch (size) {
    case 'T':
      return 'tiny';
    case 'S':
      return 'small';
    case 'M':
      return 'medium';
    case 'L':
      return 'large'
    case 'H':
      return 'huge'
    case 'G':
      return 'Gargantuan'
    default:
      return '';
  }
}

function getResist(text) {
  if (text) {
    text = text.replace(';', ',').replace('and', '');
    return text;
  }
  return '';
}

function getLanguages (text) {
  return text.replace(/\./g, '').toLowerCase().replace(' but can\'t speak', ', can\'t speak');
}

function getTraits (arr) {
  let newMap = arr.map(i => {
    if (i.name[0] === 'Source') {
      return '';
    }
    return i.name[0].toLowerCase().replace(/\((.+?)\)/g, '').trim();
  })

  return newMap.join(', ');
}

function getActions (arr) {
  let newMap = arr.map(i => i.name[0].toLowerCase().replace(/\((.+?)\)/g, '').trim())

  return newMap.join(', ');
}

const random = Math.floor(Math.random() * count);
console.log(count);
console.log(origional[random]);
console.log(result[random]);
console.log(result.length);

if (saveDataFile) {
  let tsv = '';
  const keys = Object.keys(result[0]);

  tsv += keys.join('\t');
  tsv += '\n';

  result.forEach(row => {
    for (var i = 0; i < keys.length; i++) {
      tsv += row[keys[i]];
      tsv += '\t';
    }
    tsv += '\n';
  })

  fs.writeFile('output.tsv', tsv, err => {
    if (err) {
      console.log(err); // eslint-disable-line
    }else{
      console.log("output.tsv saved!"); // eslint-disable-line
    }
  });
}

if (loadImages) {
  // get images
  function timeout(ms) {
      return new Promise(resolve => setTimeout(resolve, ms));
  }

  result.sort((a, b) => {
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }
    return 0;
  });

  (async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();

    for (var i = 0; i < result.length; i++){
      console.log(result[i].name, i);
      let name = result[i].name.replace(/ /gi, "+")
      await page.goto(`https://www.google.co.uk/search?rlz=1C1CHBF_en-GBGB787GB787&biw=1920&bih=947&tbm=isch&sa=1&ei=qT8iW7qGNeebgAb1prnIAQ&q=dungeons+and+dragons+${name}&oq=dungeons+and+dragons+${name}`);
      let base64 = await page.evaluate(() => document.querySelector('#rg_s .rg_bx:first-child img').getAttribute('src'));
      let data = base64.replace(/^data:image\/\w+;base64,/, "");
      let buf = new Buffer(data, 'base64');
      await fs.writeFile(`images/${result[i].name.toLowerCase().replace(/\,/g, '').replace(/[\s\/]/g, '_')}.png`, buf, err => {
        if (err){
          console.log(err);
        }
      });
      await timeout(1500);
      console.log(`images/${result[i].name.toLowerCase().replace(/\,/g, '').replace(/[\s\/]/g, '_')}.png written from url https://www.google.co.uk/search?rlz=1C1CHBF_en-GBGB787GB787&biw=1920&bih=947&tbm=isch&sa=1&ei=qT8iW7qGNeebgAb1prnIAQ&q=dungeons+and+dragons+${name}&oq=dungeons+and+dragons+${name}`); // eslint-disable-line
      console.log('======================');
    }
  })();
}
