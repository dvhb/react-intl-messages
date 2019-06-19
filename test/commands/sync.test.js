const { test } = require('@oclif/test');
const { copyFile, mkdir, readJson, rmdir } = require('../utils');
const lokaliseKeysJson = require('./__mocks__/lokaliseKeys.json');
const locizeKeysJson = require('./__mocks__/locizeKeys.json');

const messagesDir = 'messagesSync';

beforeEach(() => {
  mkdir(messagesDir);
  copyFile('__mock__/en.json', `${messagesDir}/_default.json`);
  copyFile('__mock__/en.json', `${messagesDir}/en.json`);
  copyFile('__mock__/ru.json', `${messagesDir}/ru.json`);
});

afterEach(() => {
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
          keys: [
            { key_name: { web: 'welcome' }, translations: [{ translation: 'Hello!', language_iso: 'en' }] },
            { key_name: { web: 'logInfo' }, translations: [{ translation: 'Log info', language_iso: 'en' }] },
          ],
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
        .get(`/${projectId}/latest/ru/test`)
        .reply(200, {})
        .post(`/missing/${projectId}/latest/en/test`, body => {
          expect(body).toMatchSnapshot('missing/en');
          return true;
        })
        .reply(200, locizeKeysJson)
        .post(`/update/${projectId}/latest/ru/test`, body => {
          expect(body).toMatchSnapshot('missing/ru');
          return true;
        })
        .reply(200, locizeKeysJson),
    )
    .stderr()
    .command(['sync', '--messagesDir', messagesDir, '--provider', 'locize', '--uploadTranslations'])
    .it('upload new message to locize', ctx => {
      expect(ctx.stderr).toBe('');
    });
  test
    .env({ PROJECT_ID: projectId, TOKEN: token })
    .nock('https://api.locize.io', api =>
      api
        .get(`/${projectId}/latest/en/test`)
        .reply(200, { welcome: 'Hello!', logInfo: 'Log info' })
        .get(`/${projectId}/latest/ru/test`)
        .reply(200, { welcome: 'Привет!' }),
    )
    .stderr()
    .command(['sync', '--messagesDir', messagesDir, '--provider', 'locize'])
    .it('update local message from locize', ctx => {
      expect(readJson(`${messagesDir}/en.json`)).toMatchSnapshot('file/en.json');
      expect(ctx.stderr).toBe('');
    });
});
