import { test } from '@oclif/test';

describe('clean', () => {
  test
    .skip()
    .stdout()
    .command(['clean'])
    .it('runs hello', ctx => {
      expect(ctx.stdout).toBe('hello world');
    });

  test
    .skip()
    .stdout()
    .command(['clean', '--name', 'jeff'])
    .it('runs hello --name jeff', ctx => {
      expect(ctx.stdout).toBe('hello jeff');
    });
});
