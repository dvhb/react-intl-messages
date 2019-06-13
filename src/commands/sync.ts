import * as path from 'path';

import { readFile, showError, showInfo, writeFile } from '../utils';
import { Base } from '../base';
import { Lokalise } from '../providers/lokalise';
import { Provider } from '../providers/provider';
import { Message } from '../types';
import { Locize } from '../providers/locize';

export default class Extract extends Base {
  static description = 'Synchronise extracted files with Lokalise.co';

  static examples = [
    `$ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
`,
  ];

  static flags = {
    ...Base.flags,
    ...Base.langFlags,
    ...Base.providersFlags,
  };
  provider?: Provider;
  messages: { [id: string]: Message } = {};

  async mergeToFile(locale: string) {
    const {
      flags: { messagesDir },
    } = this.parse(Extract);
    const fileName = path.join(messagesDir, `${locale}.json`);
    const originalMessages: { [id: string]: Message } = this.messages;
    try {
      const oldFile = await readFile(fileName);

      let oldJson;
      try {
        oldJson = JSON.parse(oldFile);
      } catch (err) {
        throw new Error(`Error parsing messages JSON in file ${fileName}`);
      }

      oldJson.forEach((message: Message) => {
        originalMessages[message.id] = message;
      });
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }

    Object.keys(originalMessages).forEach(id => {
      const newMsg = originalMessages[id];
      originalMessages[id] = originalMessages[id] || { id };
      const msg = originalMessages[id];
      msg.description = newMsg.description || msg.description;
      msg.defaultMessage = newMsg.defaultMessage || msg.defaultMessage;
      if (this.provider) {
        msg.message = this.provider.getMessage(locale, id);
      }
      msg.files = newMsg.files;
    });

    const result = Object.keys(originalMessages)
      .map(key => originalMessages[key])
      .filter(msg => msg.files || msg.message);

    await Extract.writeMessages(fileName, result);

    showInfo(`Messages updated: ${fileName}`);
  }

  static async writeMessages(fileName: string, msgs: Message[]) {
    await writeFile(fileName, `${JSON.stringify(msgs, null, 2)}\n`);
  }

  async run() {
    const {
      flags: { langs, lokalise, locize, lokaliseToken, lokaliseProjectId, locizeApiKey, locizeProjectId },
    } = this.parse(Extract);

    const getProvider = () => {
      if (lokalise) return new Lokalise(lokaliseProjectId, lokaliseToken);
      if (locize) return new Locize(locizeProjectId, locizeApiKey);
    };

    this.provider = getProvider();
    if (!this.provider) {
      showError('Not provider selected');
      return;
    }

    const locales = langs.split(',');

    await this.provider.getKeys(locales);
    await Promise.all(locales.map(locale => this.mergeToFile(locale)));
    const newMessages = this.provider.getNewMessages();
    if (newMessages.length > 0) {
      showInfo(`New translation keys: ${newMessages.length}`);
      await this.provider.uploadMessages(newMessages.map(id => this.messages[id]));
    }
  }
}
