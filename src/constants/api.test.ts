import { API_URL } from '@/constants/api';

describe('API constants', () => {
  it('uses the fitness API base URL', () => {
    expect(API_URL).toContain('/api/fitness');
  });
});
