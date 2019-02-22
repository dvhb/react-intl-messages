import { Command, flags } from '@oclif/command';

export abstract class Base extends Command {
  static flags = {
    help: flags.help({ char: 'h' }),
    messagesDir: flags.string({
      char: 'd',
      description: 'Directory for extracted messages',
      default: 'src/messages',
      required: true,
    }),
  };

  static langFlags = {
    langs: flags.string({
      char: 'l',
      description: 'Comma separated languages',
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
}
