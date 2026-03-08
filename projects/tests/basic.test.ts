import { describe, it, expect } from 'vitest';

describe('ZAEP Core', () => {
  it('should have valid config', async () => {
    const config = await import('../src/lib/config');
    const defaultExport = config.default || config;
    expect(defaultExport.project).toBeDefined();
    expect(defaultExport.project.name).toBe('智元企业AI中台');
  });
});
