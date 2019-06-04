import { test } from '@oclif/test';
import { readJson, mkdir, rmdir } from '../utils';

beforeAll(() => {
  mkdir('messages');
});

afterAll(() => {
  rmdir('messages');
});

describe('extract', () => {
  test
    .stdout()
    .command(['extract'])
    .it('extract messages into en.json', () => {
      expect(readJson('messages/en.json')).toMatchSnapshot();
    });
});
