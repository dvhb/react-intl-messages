import { flags } from '@oclif/command';
import { transform } from '@babel/core';
import * as path from 'path';

import { Base } from '../base';
import { glob, posixPath, readFile, showError, showInfo, writeFile } from '../utils';

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

export default class Extract extends Base {
  static description = 'Extract translations from source files to json';

  static examples = [
    `$ messages extract --langs=en,fr,de,ru --pattern="src/**/*.{ts,tsx}"
`,
  ];

  static flags = {
    ...Base.flags,
    ...Base.langFlags,
    pattern: flags.string({
      char: 'p',
      description: 'Regex mask for files',
      default: () => (Base.cosmiconfig ? Base.cosmiconfig.pattern : null),
      required: true,
    }),
    ignore: flags.string({
      char: 'i',
      description: 'Regex mask for ignored files',
      default: () => (Base.cosmiconfig ? Base.cosmiconfig.ignore : null),
    }),
  };

  messages: { [id: string]: Message } = {};
  fileToMessages: FileToMessages = {};

  static async writeMessages(fileName: string, msgs: Message[]) {
    return writeFile(fileName, `${JSON.stringify(msgs, null, 2)}\n`);
  }

  /**
   * Merge messages to source files
   * @param locale
   */
  async mergeToFile(locale: string) {
    const {
      flags: { messagesDir },
    } = this.parse(Extract);
    const fileName = path.join(messagesDir, `${locale}.json`);
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

    Object.keys(this.messages).forEach(id => {
      const newMsg = this.messages[id];
      originalMessages[id] = originalMessages[id] || { id };
      const msg = originalMessages[id];
      msg.description = newMsg.description || msg.description;
      msg.defaultMessage = newMsg.defaultMessage || msg.defaultMessage;
      msg.message = msg.message || '';
      msg.files = newMsg.files;
    });

    const result = Object.keys(originalMessages)
      .map(key => originalMessages[key])
      .filter(msg => msg.files || msg.message);

    await Extract.writeMessages(fileName, result);

    showInfo(`Messages updated: ${fileName}`);
  }

  mergeMessages() {
    this.messages = {};
    const messages = this.messages;
    Object.keys(this.fileToMessages).forEach(fileName => {
      this.fileToMessages[fileName].forEach(newMsg => {
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

  processFile = async (filename: string) => {
    const compare = (a: string, b: string) => (a === b ? 0 : a < b ? -1 : 1);
    try {
      const code = await readFile(filename);
      const posixName = posixPath(filename);
      const result = transform(code, { filename, plugins: ['react-intl'] });
      if (result && result.metadata) {
        // @ts-ignore
        const metadata = result.metadata['react-intl'];
        if (metadata.messages && metadata.messages.length) {
          const messages: FileMessage[] = metadata.messages;
          this.fileToMessages[posixName] = messages.sort((a, b) => compare(a.id, b.id));
        } else {
          delete this.fileToMessages[posixName];
        }
      }
    } catch (err) {
      showError(`extractMessages: In ${filename}:\n${err.codeFrame || err}`);
    }
  };

  /**
   * Extract react-intl messages and write it to <dest>/_default.json
   * Also extends known localizations
   */
  async run() {
    const {
      flags: { langs, pattern, ignore },
    } = this.parse(Extract);

    const locales = langs.split(',');
    const ignorePattern = ignore && ignore.includes(',') ? ignore.split(',') : ignore;
    const files = await glob(pattern, ignorePattern);

    await Promise.all(files.map(this.processFile));
    this.mergeMessages();
    await Promise.all(['_default', ...locales].map(locale => this.mergeToFile(locale)));
  }
}
