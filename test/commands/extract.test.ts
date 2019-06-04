import { test } from '@oclif/test';
import { readJson, mkdir, rmdir } from '../utils';

const messagesDir = 'messagesExtract';

beforeAll(() => {
  mkdir(messagesDir);
});

afterAll(() => {
  rmdir(messagesDir);
});

describe('extract', () => {
  test
    .stdout()
    .command(['extract', '--messagesDir', messagesDir])
    .it('extract messages into en.json', () => {
      expect(readJson(`${messagesDir}/en.json`)).toMatchSnapshot();
    });
});
