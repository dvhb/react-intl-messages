import { Command, flags } from '@oclif/command';
import * as cosmiconfig from 'cosmiconfig';

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

  static lokaliseFlags = {
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

  async init() {
    const explorer = cosmiconfig(this.config.bin);
    const result = explorer.searchSync();
    Base.cosmiconfig = result ? result.config : null;
  }
}
