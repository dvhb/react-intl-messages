const { test } = require('@oclif/test');
const { copyFile, mkdir, rmdir } = require('../utils');
const lokaliseKeysJson = require('./__mocks__/lokaliseKeys.json');

const messagesDir = 'messagesClean';

beforeAll(() => {
  mkdir(messagesDir);
  copyFile('__mock__/empty.json', `${messagesDir}/_default.json`);
});

afterAll(() => {
  rmdir(messagesDir);
});

describe('clean', () => {
  const projectId = process.env.PROJECT_ID;
  const token = process.env.TOKEN;

  test
    .env({
      PROJECT_ID: projectId,
      TOKEN: token,
    })
    .nock('https://api.lokalise.co', api =>
      api
        .get(`/api2/projects/${projectId}/keys`)
        .query(true)
        .reply(200, lokaliseKeysJson)
        .post(`/api2/projects/${projectId}/snapshots`)
        .reply(200, { snapshot: { snapshot_id: 1 } })
        .delete(`/api2/projects/${projectId}/keys`)
        .reply(200, { keys_removed: [22743596] }),
    )
    .stderr()
    .command(['clean', '--messagesDir', messagesDir, '--provider', 'lokalise'])
    .it('runs hello', ctx => {
      expect(ctx.stderr).toBe('');
    });
});
