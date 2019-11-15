import { Command, flags } from '@oclif/command';
import { cosmiconfigSync } from 'cosmiconfig';
import { config } from 'dotenv';

import { Config } from './types';

config();

export abstract class Base extends Command {
  static cosmiconfig: Config | null;

  static flags = {
    help: flags.help({ char: 'h' }),
    messagesDir: flags.string({
      char: 'd',
      description: 'Directory for extracted messages',
      default: () => (Base.cosmiconfig ? Base.cosmiconfig.messagesDir : 'src/messages'),
      required: true,
    }),
  };

  static langFlags = {
    langs: flags.string({
      char: 'l',
      description: 'Comma separated languages',
      default: () => (Base.cosmiconfig ? Base.cosmiconfig.langs : undefined),
      required: true,
    }),
  };

  static providersFlags = {
    provider: flags.string({
      required: true,
      description: 'Translation service provider',
      options: ['lokalise', 'locize'],
    }),
    projectId: flags.string({
      description: 'Provider`s project id',
      env: 'PROJECT_ID',
    }),
    token: flags.string({
      description: 'Provider`s token',
      env: 'TOKEN',
    }),
    version: flags.string({
      description: 'Translations version, for example "production". Required for Locize',
      env: 'VERSION',
    }),
    namespace: flags.string({
      description: 'Provider`s namespace. Required for Locize',
      env: 'NAMESPACE',
    }),
    uploadTranslations: flags.boolean({
      description: 'Upload existing translations to provider. Useful for provider migration.',
    }),
  };

  async init() {
    const explorer = cosmiconfigSync(this.config.bin);
    const result = explorer.search();
    Base.cosmiconfig = result ? result.config : null;
  }
}
