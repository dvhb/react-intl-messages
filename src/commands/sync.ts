import * as path from 'path';

import { asyncForEach, readFile, showError, showInfo, toHash, writeFile } from '../utils';
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
  messages: { [locale: string]: { [id: string]: Message } } = {};

  static async readMessages(fileName: string) {
    try {
      try {
        return JSON.parse(await readFile(fileName)) as Message[];
      } catch (err) {
        throw new Error(`Error parsing messages JSON in file ${fileName}`);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') {
        throw err;
      }
    }
  }

  async mergeToFile(locale: string) {
    const { flags } = this.parse(Extract);

    const fileName = path.join(flags.messagesDir, `${locale}.json`);
    const fileMessages = await Extract.readMessages(fileName);
    if (!fileMessages) return;
    const result = fileMessages
      .map(msg => ({ ...msg, message: this.provider!.getMessage(locale, msg.id) || msg.message }))
      .filter(msg => msg.files || msg.message);

    this.messages[locale] = toHash(result, 'id');

    await Extract.writeMessages(fileName, result);

    showInfo(`Messages updated: ${fileName}`);
  }

  static async writeMessages(fileName: string, msgs: Message[]) {
    await writeFile(fileName, `${JSON.stringify(msgs, null, 2)}\n`);
  }

  async run() {
    const {
      flags: { langs, provider, projectId, token, version, namespace },
    } = this.parse(Extract);

    const getProvider = () => {
      const providers: { [key: string]: any } = {
        lokalise: () => new Lokalise(projectId, token),
        locize: () => new Locize(projectId, token, version, namespace),
      };
      return providers[provider]();
    };

    this.provider = getProvider();
    if (!this.provider) {
      showError('Not provider selected');
      return;
    }

    const locales = langs.split(',');
    locales.forEach(locale => {
      this.messages[locale] = {};
    });

    await this.provider.getKeys(locales);
    await Promise.all(locales.map(locale => this.mergeToFile(locale)));
    const newMessages = this.provider.getNewMessages();
    if (newMessages.length > 0) {
      showInfo(`New translation keys: ${newMessages.length}`);
      if (provider === 'locize') {
        await asyncForEach(locales, locale =>
          this.provider!.uploadMessages(newMessages.map(id => this.messages[locale][id]).filter(Boolean), locale),
        );
      } else {
        await this.provider.uploadMessages(newMessages.map(id => this.messages[locales[0]][id]), 'en');
      }
    }
  }
}
