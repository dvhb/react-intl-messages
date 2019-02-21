import { Command, flags } from '@oclif/command';
import * as request from 'request-promise-native';

import { readFile, writeFile } from '../utils';
import * as path from 'path';

type Message = {
  defaultMessage: string;
  message?: string;
  description?: string;
  files?: string[];
};
type FileMessage = Message & { id: string };

export type LokaliseKey = {
  key_id: number;
  created_at: string;
  key_name: {
    ios: string;
    android: string;
    web: string;
    other: string;
  };
  filenames: {
    ios: string;
    android: string;
    web: string;
    other: string;
  };
  description: string;
  platforms: string[];
  tags: string[];
  comments: {
    comment_id: number;
    comment: string;
    added_by: number;
    added_by_email: string;
    added_at: string;
  }[];
  screenshots: {
    screenshot_id: number;
    title: string;
    description: string;
    screenshot_tags: string[];
    url: string;
    created_at: string;
  }[];
  translations: {
    translation_id: number;
    key_id: number;
    language_iso: string;
    translation: string;
    modified_by: number;
    modified_by_email: string;
    modified_at: string;
    is_reviewed: boolean;
    reviewed_by: number;
    words: number;
  }[];
};

export default class Extract extends Command {
  static description = 'Synchronise extracted files with Lokalise.co';

  static examples = [
    `$ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
`,
  ];

  static flags = {
    help: flags.help({ char: 'h' }),
    langs: flags.string({
      char: 'l',
      description: 'comma separated languages',
      required: true,
    }),
    source: flags.string({
      char: 's',
      description: 'directory for extracted messages',
      default: 'src/messages',
      required: true,
    }),
    projectId: flags.string({
      char: 'i',
      description: 'Lokalise project id',
      env: 'LOKALISE_PROJECT_ID',
      required: true,
    }),
    token: flags.string({
      char: 't',
      description: 'Lokalise token',
      env: 'LOKALISE_TOKEN',
      required: true,
    }),
  };
  lokaliseKeys: LokaliseKey[] = [];
  messages: { [id: string]: Message } = {};
  newMessages: string[] = [];

  async getFromLokalise() {
    const {
      flags: { token, projectId },
    } = this.parse(Extract);
    const headers = { 'x-api-token': token, 'content-type': 'application/json' };
    try {
      const response = await request({
        headers,
        url: `https://api.lokalise.co/api2/projects/${projectId}/keys`,
        method: 'GET',
        qs: { include_translations: '1', limit: 5000 },
      });
      this.lokaliseKeys = JSON.parse(response).keys;
    } catch (e) {
      console.error('Error while fetching strings from lokalise', e);
    }
  }

  async uploadToLokalise() {
    const {
      flags: { token, projectId },
    } = this.parse(Extract);
    const headers = { 'x-api-token': token, 'content-type': 'application/json' };
    const body = {
      keys: this.newMessages.map(id => ({
        key_name: id,
        description: this.messages[id].description,
        platforms: ['ios', 'android', 'web', 'other'],
        translations: [{ language_iso: 'en', translation: this.messages[id].defaultMessage }],
      })),
    };
    try {
      const response = await request({
        headers,
        body,
        url: `https://api.lokalise.co/api2/projects/${projectId}/keys`,
        method: 'POST',
        json: true,
      });
      console.info(`Response from lokalise: ${response.statusCode}, ${response.statusMessage}`);
      console.info(`Errors: ${JSON.stringify(response.body.errors)}`);
    } catch (e) {
      console.error('Error while uploading strings to lokalise', e);
    }
  }

  getMessage(locale: string, id: string) {
    const key = this.lokaliseKeys.find(key => key.key_name.web === id);
    const lokaliseString = key && key.translations.find(translation => translation.language_iso === locale);
    if (lokaliseString) {
      return lokaliseString.translation;
    }
    if (locale === 'en') {
      this.newMessages.push(id);
    }
    return '';
  }

  async mergeToFile(locale: string) {
    const {
      flags: { source },
    } = this.parse(Extract);
    const fileName = path.join(source, `${locale}.json`);
    const originalMessages: { [id: string]: Message } = {};
    try {
      const oldFile = await readFile(fileName);

      let oldJson;
      try {
        oldJson = JSON.parse(oldFile);
      } catch (err) {
        throw new Error(`Error parsing messages JSON in file ${fileName}`);
      }

      oldJson.forEach((message: FileMessage) => {
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
      msg.message = this.getMessage(locale, id);
      msg.files = newMsg.files;
    });

    const result = Object.keys(originalMessages)
      .map(key => originalMessages[key])
      .filter(msg => msg.files || msg.message);

    await Extract.writeMessages(fileName, result);

    console.info(`Messages updated: ${fileName}`);
  }

  static async writeMessages(fileName: string, msgs: Message[]) {
    await writeFile(fileName, `${JSON.stringify(msgs, null, 2)}\n`);
  }

  async run() {
    const {
      flags: { langs },
    } = this.parse(Extract);

    const locales = langs.split(',');

    await this.getFromLokalise();
    await Promise.all(locales.map(locale => this.mergeToFile(locale)));
    if (this.newMessages.length > 0) {
      console.info(`New translation keys: ${this.newMessages.length}`);
      await this.uploadToLokalise();
    }
  }
}
