import fs from 'node:fs';

const file = fs.readFileSync('static/decks/default.json', 'utf8');
const data = JSON.parse(file);

let index = 0;

for (const [key, value] of Object.entries(data)) {
    if ('phrases' in value) {
        for (let i = 0; i < value.phrases.length; i++) {
            value.phrases[i] = {id: index.toString(), ...value.phrases[i]}
            index++;
        }
    }
    if ('options' in value) {
        for (let i = 0; i < value.options.length; i++) {
            value.options[i] = {id: index.toString(), ...value.options[i]}
            index++;
        }
    }
}

fs.writeFileSync('static/decks/default.json', JSON.stringify(data, null, 2));
