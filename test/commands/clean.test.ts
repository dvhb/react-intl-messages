import { test } from '@oclif/test';
import { copyFile, mkdir, rmdir } from '../utils';
import * as lokaliseKeysJson from './__mocks__/lokaliseKeys.json';

const messagesDir = 'messagesClean';

beforeAll(() => {
  mkdir(messagesDir);
  copyFile('__mock__/empty.json', `${messagesDir}/_default.json`);
});

afterAll(() => {
  rmdir(messagesDir);
});

describe('clean', () => {
  const projectId = '139504615bd04772c3b220.60315670';
  const token = 'df4722895ecb0cb829537c0e49e9bd5e02a076ac';

  test
    .env({
      LOKALISE_PROJECT_ID: projectId,
      LOKALISE_TOKEN: token,
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
    .command(['clean', '--messagesDir', messagesDir])
    .it('runs hello', ctx => {
      expect(ctx.stderr).toBe('');
    });
});
