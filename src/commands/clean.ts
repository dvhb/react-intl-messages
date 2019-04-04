import * as path from 'path';

import { Base } from '../base';
import { readFile, request } from '../utils';
import { LokaliseKey } from './sync';

const format = (time: Date) => time.toTimeString().replace(/.*(\d{2}:\d{2}:\d{2}).*/, '$1');
const showError = (message: string) => console.error(`\x1b[31m${message}\x1b[0m`);
const showInfo = (message: string) => console.info(`\x1b[34m[${format(new Date())}]\x1b[0m`, `${message}`);

export default class Clean extends Base {
  static description = 'Clean lokalise for unused translation keys';

  static flags = {
    ...Base.flags,
    ...Base.lokaliseFlags,
  };

  async getKeys() {
    const {
      flags: { token, projectId },
    } = this.parse(Clean);
    const headers = { 'x-api-token': token, 'content-type': 'application/json' };

    try {
      const response = await request<{ keys: LokaliseKey[] }>({
        headers,
        qs: { limit: 5000 },
        url: `https://api.lokalise.co/api2/projects/${projectId}/keys`,
        method: 'GET',
      });
      return response.keys;
    } catch (e) {
      console.error(e);
    }
  }

  async removeKeys(keys: number[]) {
    const {
      flags: { token, projectId },
    } = this.parse(Clean);
    const headers = { 'x-api-token': token, 'content-type': 'application/json' };
    try {
      const response = await request<any>({
        headers,
        url: `https://api.lokalise.co/api2/projects/${projectId}/keys`,
        method: 'DELETE',
        body: { keys },
      });
      return response.keys_removed;
    } catch (e) {
      console.error(e);
    }
  }

  async createSnapshot() {
    const {
      flags: { token, projectId },
    } = this.parse(Clean);
    const headers = { 'x-api-token': token, 'content-type': 'application/json' };
    try {
      const response = await request<any>({
        headers,
        url: `https://api.lokalise.co/api2/projects/${projectId}/snapshots`,
        method: 'POST',
        body: { title: 'API snapshot' },
      });
      return response.snapshot.snapshot_id;
    } catch (e) {
      console.error(e);
    }
  }

  async run() {
    const {
      flags: { messagesDir },
    } = this.parse(Clean);
    const start = new Date();
    const remoteKeys = await this.getKeys();
    if (!remoteKeys) return;
    showInfo(`Get ${remoteKeys.length} keys from Lokalise`);

    const defaultFilePath = path.join(messagesDir, '_default.json');
    const defaultFile = await readFile(defaultFilePath);
    const localKeys = JSON.parse(defaultFile).map((key: { id: any }) => key.id);
    showInfo(`Found ${localKeys.length} keys keys in ${defaultFilePath}`);

    const unusedKeys: number[] = [];
    remoteKeys.forEach(key => {
      if (!localKeys.includes(key.key_name.ios)) {
        unusedKeys.push(key.key_id);
      }
    });
    showInfo(`Found ${unusedKeys.length} unused keys`);

    if (unusedKeys.length > 0) {
      const snapshotId = await this.createSnapshot();
      if (snapshotId) {
        showInfo(`Created snapshot: ${snapshotId}`);
        const removedKeys = await this.removeKeys(unusedKeys);
        if (removedKeys) {
          showInfo('Unused keys removed from lokalise');
        } else {
          console.info(removedKeys);
        }
      } else {
        showError('Something wrong with snapshot');
        return;
      }
    }
    const end = new Date();
    const time = end.getTime() - start.getTime();
    showInfo(`Finished in ${time} ms`);
  }
}
