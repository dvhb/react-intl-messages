const { test } = require('@oclif/test');
const { copyFile, mkdir, readJson, rmdir } = require('../utils');
const lokaliseKeysJson = require('./__mocks__/lokaliseKeys.json');

const messagesDir = 'messagesSync';

beforeAll(() => {
  mkdir(messagesDir);
  copyFile('__mock__/en.json', `${messagesDir}/_default.json`);
  copyFile('__mock__/en.json', `${messagesDir}/en.json`);
});

afterAll(() => {
  rmdir(messagesDir);
});

describe('sync lokalise', () => {
  const projectId = process.env.PROJECT_ID;
  const token = process.env.TOKEN;

  test
    .env({ PROJECT_ID: projectId, TOKEN: token })
    .nock('https://api.lokalise.co', api =>
      api
        .get(`/api2/projects/${projectId}/keys`)
        .query(true)
        .reply(200, { project_id: '139504615bd04772c3b220.60315670', keys: [] })
        .post(`/api2/projects/${projectId}/keys`, body => {
          expect(body).toMatchSnapshot();
          return true;
        })
        .reply(200, lokaliseKeysJson),
    )
    .stderr()
    .command(['sync', '--messagesDir', messagesDir, '--provider', 'lokalise'])
    .it('upload new message to lokalise', ctx => {
      expect(ctx.stderr).toBe('');
    });

  test
    .env({ PROJECT_ID: projectId, TOKEN: token })
    .nock('https://api.lokalise.co', api =>
      api
        .get(`/api2/projects/${projectId}/keys`)
        .query(true)
        .reply(200, {
          project_id: '139504615bd04772c3b220.60315670',
          keys: [{ key_name: { web: 'welcome' }, translations: [{ translation: 'Hello!', language_iso: 'en' }] }],
        }),
    )
    .stderr()
    .command(['sync', '--messagesDir', messagesDir, '--provider', 'lokalise'])
    .it('update existing message lokalise', ctx => {
      expect(readJson(`${messagesDir}/en.json`)).toMatchSnapshot();
      expect(ctx.stderr).toBe('');
    });
});

describe('sync locize', () => {
  const projectId = process.env.PROJECT_ID;
  const token = process.env.TOKEN;

  test
    .env({ PROJECT_ID: projectId, TOKEN: token })
    .nock('https://api.locize.io', api =>
      api
        .get(`/${projectId}/latest/en/test`)
        .reply(200, {})
        .post(`/missing/${projectId}/latest/en/test`, body => {
          expect(body).toMatchSnapshot();
          return true;
        })
        .reply(200, lokaliseKeysJson),
    )
    .stderr()
    .command(['sync', '--messagesDir', messagesDir, '--provider', 'locize'])
    .it('upload new message to locize', ctx => {
      expect(ctx.stderr).toBe('');
    });
  test
    .env({ PROJECT_ID: projectId, TOKEN: token })
    .nock('https://api.locize.io', api =>
      api
        .get(`/${projectId}/latest/en/test`)
        .reply(200, { welcome: { context: { text: 'Welcome message' }, value: 'Hello!' } }),
    )
    .stderr()
    .command(['sync', '--messagesDir', messagesDir, '--provider', 'locize'])
    .it('update local message from locize', ctx => {
      expect(readJson(`${messagesDir}/en.json`)).toMatchSnapshot();
      expect(ctx.stderr).toBe('');
    });
});
