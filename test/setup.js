const { resolve } = require('path');
const { config } = require('dotenv');

process.chdir(resolve(__dirname, 'test-project'));
config();
