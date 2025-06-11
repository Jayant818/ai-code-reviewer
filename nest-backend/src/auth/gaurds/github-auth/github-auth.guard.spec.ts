import { GithubAuthGuard } from './github-auth.guard';

describe('GithubAuthGuard', () => {
  it('should be defined', () => {
    expect(new GithubAuthGuard()).toBeDefined();
  });
});
