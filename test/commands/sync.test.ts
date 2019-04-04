import { expect, test } from '@oclif/test';

describe('sync', () => {
  test
    .skip()
    .stdout()
    .command(['sync'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).to.contain('hello world');
    });

  test
    .skip()
    .stdout()
    .command(['sync', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).to.contain('hello jeff');
    });
});
