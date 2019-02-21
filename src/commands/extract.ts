import { Command, flags } from '@oclif/command';
import { transform, TransformOptions } from '@babel/core';
import * as request from 'request-promise-native';

import { glob, readFile, writeFile } from '../utils';

type Message = {
  defaultMessage: string;
  message?: string;
  description?: string;
  files?: string[];
};
type FileMessage = Message & { id: string };
type FileToMessages = {
  [filename: string]: FileMessage[];
};

type LokaliseKey = {
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
  static description = 'describe the command here';

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
    pattern: flags.string({
      char: 'p',
      description: 'regex mask for files',
      required: true,
    }),
    ignore: flags.string({
      char: 'i',
      description: 'regex mask for ignored files',
    }),
    dest: flags.string({
      char: 'd',
      description: 'directory for extracted messages',
      default: './messages',
    }),
  };

  async run() {
    const { flags } = this.parse(Extract);

    const { langs, pattern, ignore } = flags;

    const ignorePattern = ignore && ignore.includes(',') ? ignore.split(',') : ignore;

    const lokalise = {
      projectId: process.env.LOKALISE_PROJECT_ID,
      token: process.env.LOKALISE_TOKEN,
    };

    if (!langs) {
      throw Error('Missing required "--langs" parameter');
    }
    const locales = langs.split(',');
    const isLocal = !lokalise.projectId || !lokalise.token;
    const fileToMessages: FileToMessages = {};
    let lokaliseKeys: LokaliseKey[] = [];
    let messages: { [id: string]: Message } = {};
    const newMessages: string[] = [];

    const posixPath = (fileName: string) => fileName.replace(/\\/g, '/');

    const getMessage = (locale: string, id: string) => {
      if (locale === '_default') {
        return '';
      }
      const key = lokaliseKeys.find(key => key.key_name.web === id);
      const lokaliseString = key && key.translations.find(translation => translation.language_iso === locale);
      if (lokaliseString) {
        return lokaliseString.translation;
      }
      if (locale === 'en') {
        newMessages.push(id);
      }
      return '';
    };

    const headers = { 'x-api-token': lokalise.token, 'content-type': 'application/json' };

    async function uploadToLokalise() {
      if (isLocal) {
        return;
      }
      const body = {
        keys: newMessages.map(id => ({
          key_name: id,
          description: messages[id].description,
          platforms: ['ios', 'android', 'web', 'other'],
          translations: [{ language_iso: 'en', translation: messages[id].defaultMessage }],
        })),
      };
      try {
        const response = await request({
          headers,
          body,
          url: `https://api.lokalise.co/api2/projects/${lokalise.projectId}/keys`,
          method: 'POST',
          json: true,
        });
        console.info(`Response from lokalise: ${response.statusCode}, ${response.statusMessage}`);
        console.info(`Errors: ${JSON.stringify(response.body.errors)}`);
      } catch (e) {
        console.error('Error while uploading strings to lokalise', e);
      }
    }

    async function getFromLokalise() {
      if (isLocal) {
        return;
      }
      try {
        const response = await request({
          headers,
          url: `https://api.lokalise.co/api2/projects/${lokalise.projectId}/keys`,
          method: 'GET',
          qs: { include_translations: '1', limit: 5000 },
        });
        lokaliseKeys = JSON.parse(response.body).keys;
        console.info(`Response from lokalise: ${response.statusCode}, ${response.statusMessage}`);
      } catch (e) {
        console.error('Error while fetching strings from lokalise', e);
      }
    }

    async function writeMessages(fileName: string, msgs: Message[]) {
      await writeFile(fileName, `${JSON.stringify(msgs, null, 2)}\n`);
    }

    // merge messages to source files
    async function mergeToFile(locale: string, toBuild: boolean) {
      const fileName = `src/messages/${locale}.json`;
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
          delete originalMessages[message.id].files;
        });
      } catch (err) {
        if (err.code !== 'ENOENT') {
          throw err;
        }
      }

      Object.keys(messages).forEach(id => {
        const newMsg = messages[id];
        originalMessages[id] = originalMessages[id] || { id };
        const msg = originalMessages[id];
        msg.description = newMsg.description || msg.description;
        msg.defaultMessage = newMsg.defaultMessage || msg.defaultMessage;
        msg.message = isLocal ? msg.message || '' : getMessage(locale, id);
        msg.files = newMsg.files;
      });

      const result = Object.keys(originalMessages)
        .map(key => originalMessages[key])
        .filter(msg => msg.files || msg.message);

      await writeMessages(fileName, result);

      console.info(`Messages updated: ${fileName}`);

      if (toBuild && locale !== '_default') {
        const buildFileName = `build/messages/${locale}.json`;
        try {
          await writeMessages(buildFileName, result);
          console.info(`Build messages updated: ${buildFileName}`);
        } catch (err) {
          console.error(`Failed to update ${buildFileName}`);
        }
      }
    }

    // call everytime before updating file!
    function mergeMessages() {
      messages = {};
      Object.keys(fileToMessages).forEach(fileName => {
        fileToMessages[fileName].forEach(newMsg => {
          if (messages[newMsg.id]) {
            if (messages[newMsg.id].defaultMessage !== newMsg.defaultMessage) {
              throw new Error(`Different message default messages for message id "${newMsg.id}":
          ${messages[newMsg.id].defaultMessage} -- ${messages[newMsg.id].files}
          ${newMsg.defaultMessage} -- ${fileName}`);
            }
            if (messages[newMsg.id].description && newMsg.description) {
              throw new Error(`Should be only one description for message id "${newMsg.id}":
          ${messages[newMsg.id].description} -- ${messages[newMsg.id].files}
          ${newMsg.description} -- ${fileName}`);
            }
          }
          const message = messages[newMsg.id] || {};
          messages[newMsg.id] = {
            description: newMsg.description || message.description,
            defaultMessage: newMsg.defaultMessage || message.defaultMessage,
            message: newMsg.message || message.message || '',
            files: message.files ? [...message.files, fileName].sort() : [fileName],
          };
        });
      });
    }

    async function updateMessages(toBuild: boolean) {
      await getFromLokalise();
      mergeMessages();
      await Promise.all(['_default', ...locales].map(locale => mergeToFile(locale, toBuild)));
      if (newMessages.length > 0) {
        console.info(`New translation keys: ${newMessages.length}`);
        await uploadToLokalise();
      }
    }

    /**
     * Extract react-intl messages and write it to src/messages/_default.json
     * Also extends known localizations
     */
    async function extractMessages() {
      const compare = (a: string, b: string) => {
        if (a === b) {
          return 0;
        }

        return a < b ? -1 : 1;
      };

      const processFile = async (fileName: string) => {
        try {
          const code = await readFile(fileName);
          const posixName = posixPath(fileName);
          const opts: TransformOptions = {
            babelrc: false,
            presets: ['@babel/preset-typescript', '@babel/preset-react'],
            plugins: ['react-intl'],
            filename: fileName,
          };
          const result = transform(code, opts);
          if (result && result.metadata) {
            // @ts-ignore
            const metadata = result.metadata['react-intl'];
            if (metadata.messages && metadata.messages.length) {
              const messages: FileMessage[] = metadata.messages;
              fileToMessages[posixName] = messages.sort((a, b) => compare(a.id, b.id));
            } else {
              delete fileToMessages[posixName];
            }
          }
        } catch (err) {
          console.error(`extractMessages: In ${fileName}:\n`, err.codeFrame || err);
        }
      };

      const files = await glob(pattern, ignorePattern);

      await Promise.all(files.map(processFile));
      await updateMessages(false);
    }

    extractMessages();
  }
}
