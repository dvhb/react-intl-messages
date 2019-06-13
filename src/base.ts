import { Command, flags } from '@oclif/command';
import * as cosmiconfig from 'cosmiconfig';
import { config } from 'dotenv';

config();

export abstract class Base extends Command {
  static cosmiconfig: cosmiconfig.Config | null;

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
      default: () => (Base.cosmiconfig ? Base.cosmiconfig.langs : null),
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
  };

  async init() {
    const explorer = cosmiconfig(this.config.bin);
    const result = explorer.searchSync();
    Base.cosmiconfig = result ? result.config : null;
  }
}
