const fs = require('fs');

const keys = fs.readFileSync(__dirname + '/.keys/keys.json');
const keysJ = JSON.parse(keys);

module.exports = keysJ;
