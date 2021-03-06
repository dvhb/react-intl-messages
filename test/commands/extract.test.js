const { test } = require('@oclif/test');
const { readJson, mkdir, rmdir } = require('../utils');

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
    .it('extract providerMessages into en.json', () => {
      expect(readJson(`${messagesDir}/en.json`)).toMatchSnapshot();
    });
});
