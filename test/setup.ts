import { resolve } from 'path';
import { config } from 'dotenv';

process.chdir(resolve(__dirname, 'test-project'));
config();
