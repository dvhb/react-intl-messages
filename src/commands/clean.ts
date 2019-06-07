import * as path from 'path';

import { Base } from '../base';
import { readFile, request, showError, showInfo } from '../utils';
import { LokaliseKey } from '../providers/localize';

export default class Clean extends Base {
  static description = 'Clean lokalise for unused translation keys';

  static flags = {
    ...Base.flags,
    ...Base.providersFlags,
  };

  async getKeys() {
    const {
      flags: { lokaliseToken, lokaliseProjectId },
    } = this.parse(Clean);
    const headers = { 'x-api-token': lokaliseToken, 'content-type': 'application/json' };

    try {
      const response = await request<{ keys: LokaliseKey[] }>({
        headers,
        qs: { limit: 5000 },
        url: `https://api.lokalise.co/api2/projects/${lokaliseProjectId}/keys`,
        method: 'GET',
      });
      return response.keys;
    } catch (e) {
      showError(e);
    }
  }

  async removeKeys(keys: number[]) {
    const {
      flags: { lokaliseToken, lokaliseProjectId },
    } = this.parse(Clean);
    const headers = { 'x-api-token': lokaliseToken, 'content-type': 'application/json' };
    try {
      const response = await request<any>({
        headers,
        url: `https://api.lokalise.co/api2/projects/${lokaliseProjectId}/keys`,
        method: 'DELETE',
        body: { keys },
      });
      return response.keys_removed;
    } catch (e) {
      showError(e);
    }
  }

  async createSnapshot() {
    const {
      flags: { lokaliseToken, lokaliseProjectId },
    } = this.parse(Clean);
    const headers = { 'x-api-token': lokaliseToken, 'content-type': 'application/json' };
    try {
      const response = await request<any>({
        headers,
        url: `https://api.lokalise.co/api2/projects/${lokaliseProjectId}/snapshots`,
        method: 'POST',
        body: { title: 'API snapshot' },
      });
      return response.snapshot.snapshot_id;
    } catch (e) {
      showError(e);
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
          showInfo(removedKeys);
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
