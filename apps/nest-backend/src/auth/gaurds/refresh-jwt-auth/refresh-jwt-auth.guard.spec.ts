import { RefreshJwtAuthGuard } from './refresh-jwt-auth.guard';

describe('RefreshJwtAuthGuard', () => {
  it('should be defined', () => {
    expect(new RefreshJwtAuthGuard()).toBeDefined();
  });
});
