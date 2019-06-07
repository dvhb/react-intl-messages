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
    lokalise: flags.boolean({
      description: 'Translation service provider',
      env: 'LOKALISE',
      dependsOn: ['lokaliseProjectId', 'lokaliseToken'],
      exclusive: ['locize'],
    }),
    lokaliseProjectId: flags.string({
      description: 'Lokalise project id',
      env: 'LOKALISE_PROJECT_ID',
    }),
    lokaliseToken: flags.string({
      description: 'Lokalise token',
      env: 'LOKALISE_TOKEN',
    }),

    locize: flags.boolean({
      description: 'Translation service provider',
      env: 'LOCIZE',
      dependsOn: ['locizeProjectId', 'locizeApiKey'],
      exclusive: ['lokalise'],
    }),
    locizeProjectId: flags.string({
      description: 'Locize project id',
      env: 'LOCIZE_PROJECT_ID',
    }),
    locizeApiKey: flags.string({
      description: 'Locize api key',
      env: 'LOCIZE_API_KEY',
    }),
  };

  async init() {
    const explorer = cosmiconfig(this.config.bin);
    const result = explorer.searchSync();
    Base.cosmiconfig = result ? result.config : null;
  }
}
