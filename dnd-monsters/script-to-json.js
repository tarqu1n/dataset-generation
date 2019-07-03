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
  else { cr = Number(cr); }

  const resultant = {
    id: data.name[0].toLowerCase().replace(/\((.+?)\)/g, '').trim().replace(/\s/g, "_"),
    name: data.name[0].replace(/\((.+?)\)/g, '').replace(/\,/g, '').trim(),
    size: getSize(data.size[0]),
    type: type.split(',').map(a => a.trim()),
    speed: data.speed[0].replace(/\./g, ''),
    source: source.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
    alignment: data.alignment[0],
    ac: Number(data.ac[0].split(' ')[0]),
    hp: Number(data.hp[0].split(' ')[0]),
    hp_dice: hpDice,
    strength: Number(data.str[0]),
    dexterity: Number(data.dex[0]),
    constitution: Number(data.con[0]),
    intelligence: Number(data.int[0]),
    wisdom: Number(data.wis[0]),
    charisma: Number(data.cha[0]),
    passive_perception: Number(data.passive[0]),
    challenge_rating: cr,
  }

  if (armourType){
    data.armour_type = armourType;
  }

  // optional objects
  if (data.skill && data.skill[0]) { resultant.skills = splitProficiencies(data.skill[0]); }
  if (data.vulnerable && data.vulnerable[0]) { resultant.vulnerabilities = data.vulnerable[0].split(','); }
  if (data.save && data.save[0]) { resultant.saves = getSaves(data.save); }
  if (data.immune && data.immune[0]) { resultant.damage_immunities = data.immune[0].replace(';', ',').replace('and ', '').split(','); }
  if (data.conditionImmune && data.conditionImmune[0]) { resultant.condition_immunities = data.conditionImmune[0].toLowerCase().split(','); }
  if (data.resist) { resultant.damage_resistances = getResist(data.resist[0]); }
  if (data.languages) { resultant.languages = getLanguages(data.languages[0]); }
  if (data.senses) { resultant.senses = data.senses[0].replace(/\./g, ''); }
  if (data.spells && data.spells[0]) { resultant.spells = data.spells[0].split(','); }
  if (data.slots && data.slots[0]) { resultant.spell_slots = data.slots[0].split(',').map(a => Number(a)); }
  if (data.trait) { resultant.traits = getTraits(data.trait); }
  if (data.action) { resultant.actions = getActions(data.action); }
  if (data.reaction) { resultant.reactions = getActions(data.reaction); }
  if (data.legendary) { resultant.legendary_actions = getActions(data.legendary); }

  return resultant;
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

function splitProficiencies (profs) {
  return profs
    .split(',')
    .map(a => {
      const split = a.trim().split(' ');
      return {
        type: split[0],
        value: Number(split[1].replace('+', '').replace('-', '')),
      }
    });
}

function getSaves (save) {
  let saves = save[0]
    .toLowerCase()
    .replace('str', 'Strength')
    .replace('dex', 'Dexterity')
    .replace('con', 'Constitution')
    .replace('wis', 'Wisdom')
    .replace('int', 'Intelligence')
    .replace('cha', 'Charisma')
    .split(',');

  saves = saves.map(a => {
    const split = a.trim().split(' ')
    return {
      type: split[0],
      value: Number(split[1].replace('+', '').replace('-', '')),
    }
  })

  return saves;
}
function getResist(text) {
  if (text) {
    text = text.replace(';', ',').replace('and', '');

    const split = text.split(',').map(a => a.trim());
    // console.log(split);
    const singleWords = split.slice().filter(a => a.match(/w* w*/g));
    if (!singleWords) {
      return split;
    } else {
      return [text];
    }
  }
  return null;
}

function getLanguages (text) {
  return text.replace(/\./g, '').toLowerCase();
}

function getTraits (arr) {
  let newMap = arr
    .filter(a => a.name[0] !== 'Source')
    .map(i => {
      return {
        name: i.name[0].replace(/\((.+?)\)/g, '').trim(),
        text: i.text[0].trim(),
      }
    })

  return newMap;
}

function getActions (arr) {
  let newMap = arr.map(i => {
    const result = {
      name: i.name[0].trim(),
      text: i.text[0],
    }

    if (i.attack) {
      const attack = i.attack[0].split('|');
      result.attack = {
        name: attack[0] || i.name[0],
        to_hit: Number(attack[1]),
        damage: attack[2],
      }
    }

    return result;
  })

  return newMap;
}

fs.writeFile('output.obj.json', JSON.stringify(result), err => {
  if (err) {
    console.log(err); // eslint-disable-line
  }else{
    console.log("output.obj.json saved!"); // eslint-disable-line
  }
});

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


}
